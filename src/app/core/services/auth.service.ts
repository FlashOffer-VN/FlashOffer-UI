import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    User,
    UserRole,
    isAdminRole,
    toUserRole,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse,
    ChangeCredentialsRequest
} from '../models/auth.model';
import { isBrowser } from '../utils/platform';
import { UpdateMyProfileRequest } from '../models/auth.model';
import { storageGet, storageRemove, storageSet } from '../utils/storage';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();
    private refreshTokenTimeout: any;

    constructor(
        private api: ApiService,
        private router: Router,
        private translate: TranslateService
    ) {
        this.loadStoredUser();
    }

    /**
     * Đăng nhập
     * @param data - LoginRequest có thể chứa isAdmin flag
     */
    login(data: LoginRequest & { isAdmin?: boolean }): Observable<AuthResponse> {
        // Gửi kèm ngôn ngữ đang dùng: API ghi vào token, từ đó mọi nội dung trả về đã đúng ngôn ngữ này.
        const payload: LoginRequest & { isAdmin?: boolean } = {
            ...data,
            language: this.translate.currentLang || 'vi'
        };

        return this.api.post<AuthResponse>('auth/login', payload).pipe(
            tap(response => this.handleAuthResponse(response, data.isAdmin))
        );
    }

    /**
     * Đăng ký
     */
    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('auth/register', data).pipe(
            tap(response => this.handleAuthResponse(response, false))
        );
    }

    /**
     * Đăng xuất user thường -> redirect về /login
     */
    logout(): void {
        this.clearSession();
        this.router.navigate(['/login']);
    }

    /**
     * Đăng xuất admin -> redirect về /admin-login
     */
    logoutToAdmin(): void {
        this.clearSession();
        this.router.navigate(['/admin-login']);
    }

    /**
     * Lấy token từ localStorage
     */
    getToken(): string | null {
        return storageGet('token');
    }

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Lấy user hiện tại
     */
    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Gọi API lấy thông tin user
     */
    getMe(): Observable<ApiResponse<User>> {
        return this.api.get<ApiResponse<User>>('auth/me').pipe(
            tap(response => {
                if (response.success && response.data) {
                    const user = response.data;
                    storageSet('user', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
            })
        );
    }

    /**
     * Cập nhật thông tin cá nhân của chính người đang đăng nhập (PUT auth/me)
     */
    updateMe(payload: UpdateMyProfileRequest): Observable<ApiResponse<User>> {
        return this.api.put<ApiResponse<User>>('auth/me', payload).pipe(
            tap(response => {
                if (response.success && response.data) {
                    const user = { ...(this.getCurrentUser() ?? ({} as User)), ...response.data } as User;
                    storageSet('user', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
            })
        );
    }

    /**
     * Làm mới token đang dùng. Máy chủ đọc token cũ từ header Authorization, cấp token mới kèm
     * quyền mới nhất và vô hiệu hóa token cũ ngay sau đó.
     */
    refreshToken(): Observable<any> {
        if (!this.getToken()) {
            return throwError(() => new Error('Chưa đăng nhập'));
        }
        return this.api.post('auth/refresh', {}).pipe(
            tap((response: any) => {
                const newToken = response?.data?.token || response?.token;
                if (newToken) {
                    storageSet('token', newToken);
                    this.startRefreshTokenTimer(response?.data?.expiresAt || response?.expiresAt);
                }
            })
        );
    }

    /**
     * Trích xuất message lỗi từ response
     */
    extractErrorMessage(error: any): string {
        if (error?.error?.errors && Array.isArray(error.error.errors)) {
            return error.error.errors[0];
        }
        if (error?.error?.message) {
            return error.error.message;
        }
        if (error?.message) {
            return error.message;
        }
        return this.translate.instant('ERROR.GENERAL');
    }

    /**
     * Xóa session và reset state
     */
    private clearSession(): void {
        storageRemove('token');
        storageRemove('user');
        this.currentUserSubject.next(null);
        this.stopRefreshTokenTimer();
    }

    /**
     * Hẹn làm mới token trước khi hết hạn 5 phút. Thời hạn thật đọc từ trường ExpiresAt của máy chủ
     * (cấu hình Thời hạn token trong Cài đặt chung); không đọc được thì hẹn 55 phút.
     */
    private startRefreshTokenTimer(expiresAt?: string): void {
        if (!this.getToken()) return;

        this.stopRefreshTokenTimer();

        const expires = expiresAt ? Date.parse(expiresAt) : NaN;
        const delay = Number.isNaN(expires)
            ? 55 * 60 * 1000
            : Math.max(expires - Date.now() - 5 * 60 * 1000, 60 * 1000);

        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken().subscribe({
                next: () => console.log('✅ Token refreshed successfully'),
                error: () => {
                    // Hết hạn làm mới được thì kết thúc phiên, không giữ token đã chết.
                    this.logout();
                }
            });
        }, delay);
    }

    /**
     * Dừng timer refresh token
     */
    private stopRefreshTokenTimer(): void {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }
    }

    /**
     * Xử lý response auth, lưu token và redirect theo role
     * @param response - AuthResponse từ API
     * @param isAdmin - Flag xác định login từ trang admin
     */
    private handleAuthResponse(response: AuthResponse, isAdmin: boolean = false): void {
        const data = response?.data;

        if (!data) {
            console.error('❌ No data in auth response');
            return;
        }

        const roleValue = toUserRole(data.role);

        const user: User = {
            id: data.id ?? '',
            username: data.username || '',
            email: data.email || data.username || '',
            role: roleValue,
            fullName: data.fullName || '',
            mustChangeCredentials: data.mustChangeCredentials === true,
            permissions: data.permissions ?? []
        };

        if (data.token) {
            storageSet('token', data.token);
        }

        storageSet('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.startRefreshTokenTimer(data.expiresAt);

        this.redirectAfterLogin(user, isAdmin);
    }

    /**
     * Redirect sau login dựa trên role và flag isAdmin
     */
    private redirectAfterLogin(user: User, isAdmin: boolean): void {
        // Tài khoản tạo tự động (mật khẩu = SĐT) phải đổi tên đăng nhập + mật khẩu trước khi dùng tiếp
        if (user.mustChangeCredentials) {
            this.router.navigate(['/user/change-credentials']);
            return;
        }

        if (isAdmin || isAdminRole(user.role)) {
            this.router.navigate(['/admin/dashboard']);
        } else {
            this.router.navigate(['/social']);
        }
    }

    /**
     * True khi tài khoản đang đăng nhập buộc phải đổi tên đăng nhập + mật khẩu (lần đầu).
     */
    mustChangeCredentials(): boolean {
        return this.getCurrentUser()?.mustChangeCredentials === true;
    }

    /**
     * Đổi tên đăng nhập + mật khẩu. API trả token mới (username là claim trong token)
     * nên cập nhật lại token + user đang lưu, KHÔNG redirect (trang gọi tự quyết định).
     */
    changeCredentials(payload: ChangeCredentialsRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('auth/change-credentials', payload).pipe(
            tap(response => this.applyChangedCredentials(response))
        );
    }

    /**
     * Cập nhật token + user sau khi đổi thông tin đăng nhập thành công.
     */
    private applyChangedCredentials(response: AuthResponse): void {
        const data = response?.data;
        if (!data) return;

        if (data.token) {
            storageSet('token', data.token);
        }

        const current = this.getCurrentUser();
        const user: User = {
            ...(current || ({} as User)),
            id: current?.id ?? data.id ?? 0,
            username: data.username || current?.username || '',
            email: data.email || current?.email || data.username || '',
            role: toUserRole(data.role ?? current?.role),
            fullName: data.fullName || current?.fullName || '',
            mustChangeCredentials: data.mustChangeCredentials === true,
            permissions: data.permissions ?? current?.permissions ?? []
        };

        storageSet('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    /**
     * Load user từ localStorage khi app khởi động
     */
    private loadStoredUser(): void {
        // SSR-safe: on the server (prerender) there is no localStorage — skip.
        if (!isBrowser()) return;
        const userStr = storageGet('user');
        if (userStr) {
            try {
                const stored = JSON.parse(userStr) as User;
                const user: User = { ...stored, role: toUserRole(stored.role) };
                this.currentUserSubject.next(user);
                if (this.getToken()) {
                    this.startRefreshTokenTimer();
                }
            } catch (error) {
                console.error('Failed to parse user from localStorage', error);
            }
        }
    }

}