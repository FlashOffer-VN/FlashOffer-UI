import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
    User,
    UserRole,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse
} from '../models/auth.model';

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

    login(data: LoginRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('auth/login', data).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('auth/register', data).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.clearBodyRoleClass();
        this.stopRefreshTokenTimer();
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    getMe(): Observable<ApiResponse<User>> {
        return this.api.get<ApiResponse<User>>('auth/me').pipe(
            tap(response => {
                if (response.success && response.data) {
                    const user = response.data;
                    localStorage.setItem('user', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    this.setBodyRoleClass(user.role);
                }
            })
        );
    }

    refreshToken(): Observable<any> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }
        return this.api.post('auth/refresh', { refreshToken }).pipe(
            tap((response: any) => {
                const newToken = response?.data?.token || response?.token;
                if (newToken) {
                    localStorage.setItem('token', newToken);
                    this.startRefreshTokenTimer();
                }
            })
        );
    }

    private startRefreshTokenTimer(): void {
        const token = this.getToken();
        if (!token) return;

        const expiresIn = 55 * 60 * 1000;
        this.stopRefreshTokenTimer();
        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken().subscribe({
                next: () => console.log('✅ Token refreshed successfully'),
                error: (error) => {
                    console.error('❌ Token refresh failed:', error);
                    this.logout();
                }
            });
        }, expiresIn);
    }

    private stopRefreshTokenTimer(): void {
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
            this.refreshTokenTimeout = null;
        }
    }

    private handleAuthResponse(response: AuthResponse): void {
        const data = response?.data;

        if (!data) {
            console.error('❌ No data in auth response');
            return;
        }

        // ✅ Xử lý role an toàn - ép kiểu rõ ràng
        const roleValue = data.role || 'GUEST';

        const user: User = {
            id: 0,
            username: data.username || '',
            email: data.username || '',
            role: roleValue as UserRole,
            fullName: data.fullName || ''
        };

        if (data.token) {
            localStorage.setItem('token', data.token);
        }

        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.setBodyRoleClass(user.role);
        this.startRefreshTokenTimer();
    }

    private loadStoredUser(): void {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr) as User;
                this.currentUserSubject.next(user);
                this.setBodyRoleClass(user.role);
                if (this.getToken()) {
                    this.startRefreshTokenTimer();
                }
            } catch (error) {
                console.error('Failed to parse user from localStorage', error);
            }
        }
    }

    // ✅ Fix: Xử lý role an toàn, không dùng toString() gây lỗi
    private normalizeRole(role: string | UserRole): string {
        if (typeof role === 'string') {
            return role;
        }
        // UserRole là enum, có thể so sánh trực tiếp
        if (role === UserRole.ADMIN) return 'ADMIN';
        if (role === UserRole.USER) return 'USER';
        if (role === UserRole.GUEST) return 'GUEST';
        return String(role); // fallback an toàn
    }

    private setBodyRoleClass(role: string | UserRole): void {
        this.clearBodyRoleClass();
        const roleStr = this.normalizeRole(role);

        if (roleStr === UserRole.ADMIN || roleStr === 'Admin' || roleStr === 'admin') {
            document.body.classList.add('admin-role');
        } else if (roleStr === UserRole.USER || roleStr === 'User' || roleStr === 'user') {
            document.body.classList.add('user-role');
        }
    }

    private clearBodyRoleClass(): void {
        document.body.classList.remove('admin-role', 'user-role');
    }

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
}