import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ApiResponse, UserRole } from '../models/auth.model';
import {
    Permission,
    PermissionMatrix,
    UserPermissionCandidate,
    UserPermissionDetail,
    UpdateUsersPermissionsResult,
    toPermissionCode
} from '../models/permission.model';

/**
 * Quyền của tài khoản đang đăng nhập (đọc từ hồ sơ đã lưu sau khi đăng nhập) và API quản lý quyền.
 * Quyền kèm theo token dạng claim nên kiểm tra ở đây không gọi thêm API.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
    private readonly _baseUrl = 'permissions';

    constructor(
        private _apiService: ApiService,
        private _auth: AuthService
    ) { }

    /** Mã quyền của tài khoản đang đăng nhập. */
    getCodes(): string[] {
        return this._auth.getCurrentUser()?.permissions ?? [];
    }

    /**
     * Tài khoản có quyền không. Nhận một mã hoặc nhiều mã — chỉ cần đúng một mã.
     * SuperAdmin luôn đúng. Không truyền mã nào thì trả về false để tránh mở nhầm.
     */
    has(permission: Permission | string | null | undefined | readonly (Permission | string)[]): boolean {
        const user = this._auth.getCurrentUser();
        if (!user) return false;
        if (user.role === UserRole.SuperAdmin) return true;

        // Hồ sơ lưu từ trước khi có tính năng phân quyền chưa kèm danh sách quyền: chưa xác định được
        // nên không ẩn/chặn (tránh khoá oan menu của phiên đang đăng nhập); API vẫn là nơi chặn thật.
        if (!Array.isArray(user.permissions)) return true;

        const wanted = (Array.isArray(permission) ? permission : [permission])
            .map(code => toPermissionCode(code))
            .filter((code): code is string => !!code);
        if (wanted.length === 0) return false;

        const codes = this.getCodes();
        return wanted.some(code => codes.includes(code));
    }

    /** Tài khoản đang đăng nhập có phải SuperAdmin. */
    isSuperAdmin(): boolean {
        return this._auth.getCurrentUser()?.role === UserRole.SuperAdmin;
    }

    /** Ma trận phân quyền. GET /api/v1/permissions */
    getMatrix(): Observable<ApiResponse<PermissionMatrix>> {
        return this._apiService.get<ApiResponse<PermissionMatrix>>(this._baseUrl);
    }

    /** Cập nhật quyền cho một vai trò. PUT /api/v1/permissions/roles/{role} */
    updateRolePermissions(role: UserRole, permissionCodes: string[]): Observable<ApiResponse<PermissionMatrix>> {
        return this._apiService.put<ApiResponse<PermissionMatrix>>(`${this._baseUrl}/roles/${role}`, { permissionCodes });
    }

    /** Tìm tài khoản để cấu hình quyền riêng. GET /api/v1/permissions/users */
    searchUsers(search: string): Observable<ApiResponse<UserPermissionCandidate[]>> {
        return this._apiService.get<ApiResponse<UserPermissionCandidate[]>>(`${this._baseUrl}/users`, {
            search: search || undefined,
            pageNumber: 1,
            pageSize: 50
        });
    }

    /** Quyền hiệu lực của một tài khoản. GET /api/v1/permissions/users/{userId} */
    getUserPermissions(userId: string): Observable<ApiResponse<UserPermissionDetail>> {
        return this._apiService.get<ApiResponse<UserPermissionDetail>>(`${this._baseUrl}/users/${userId}`);
    }

    /** Đặt quyền hiệu lực cho một tài khoản. PUT /api/v1/permissions/users/{userId} */
    updateUserPermissions(userId: string, permissionCodes: string[]): Observable<ApiResponse<UserPermissionDetail>> {
        return this._apiService.put<ApiResponse<UserPermissionDetail>>(`${this._baseUrl}/users/${userId}`, { permissionCodes });
    }

    /** Áp cùng một bộ quyền cho nhiều tài khoản. PUT /api/v1/permissions/users */
    updateUsersPermissions(userIds: string[], permissionCodes: string[]): Observable<ApiResponse<UpdateUsersPermissionsResult>> {
        return this._apiService.put<ApiResponse<UpdateUsersPermissionsResult>>(`${this._baseUrl}/users`, {
            userIds,
            permissionCodes
        });
    }
}
