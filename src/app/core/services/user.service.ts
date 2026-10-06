import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    AdminUser,
    AdminUserDetail,
    CreateAdminUserRequest,
    UpdateUserInfoRequest,
    UserAccountScope
} from '../models/user.model';
import { ApiResponse, PagedResponse } from '@core/models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly _baseUrl = 'Users';

    constructor(private _apiService: ApiService) { }

    /**
     * Danh sách người dùng phân trang (Admin)
     * GET /api/v1/Users?pageNumber=&pageSize=&search=&scope=
     */
    getData(pageNumber = 1, pageSize = 10, search = '', searchField?: string,
        scope?: UserAccountScope): Observable<PagedResponse<AdminUser>> {
        // Backend yêu cầu pageSize trong [1, 100]
        const params: any = { pageNumber, pageSize: this.clampPageSize(pageSize), search, sortBy: 'CreatedAt', sortOrder: 'desc' };
        // Cột tìm kiếm do người dùng chọn; bỏ trống = tìm mọi trường (hành vi cũ)
        if (searchField) params.searchField = searchField;
        // Tab tài khoản thường / tài khoản quản trị
        if (scope) params.scope = scope;

        return this._apiService.get<PagedResponse<AdminUser>>(this._baseUrl, params);
    }

    /**
     * Chi tiết tài khoản: thông tin tài khoản + hồ sơ CTV/đối tác đang liên kết (Admin)
     * GET /api/v1/Users/{id}
     */
    getDetail(id: string): Observable<ApiResponse<AdminUserDetail>> {
        return this._apiService.get<ApiResponse<AdminUserDetail>>(`${this._baseUrl}/${id}`);
    }

    /**
     * Sửa thông tin tài khoản (họ tên / SĐT / email / Zalo / trạng thái hoạt động) (Admin)
     * PUT /api/v1/Users/{id}
     */
    updateInfo(id: string, body: UpdateUserInfoRequest): Observable<ApiResponse<AdminUser>> {
        return this._apiService.put<ApiResponse<AdminUser>>(`${this._baseUrl}/${id}`, body);
    }

    /**
     * Tạo tài khoản quản trị (role Admin) (Admin)
     * POST /api/v1/Users/admin
     */
    createAdmin(body: CreateAdminUserRequest): Observable<ApiResponse<AdminUser>> {
        return this._apiService.post<ApiResponse<AdminUser>>(`${this._baseUrl}/admin`, body);
    }

    /**
     * Gán / đổi vai trò tài khoản (Admin)
     * PUT /api/v1/Users/{id}/role
     */
    updateRole(id: string, role: string | number): Observable<ApiResponse<AdminUser>> {
        return this._apiService.put<ApiResponse<AdminUser>>(`${this._baseUrl}/${id}/role`, { role });
    }

    /**
     * Cấp lại mật khẩu cho người dùng quên mật khẩu: mật khẩu mới là số điện thoại của tài khoản,
     * người dùng phải đổi ở lần đăng nhập kế tiếp (Admin)
     * POST /api/v1/Users/{id}/reset-password
     */
    resetPassword(id: string): Observable<ApiResponse<AdminUser>> {
        return this._apiService.post<ApiResponse<AdminUser>>(`${this._baseUrl}/${id}/reset-password`);
    }

    private clampPageSize(pageSize: number): number {
        return Math.min(Math.max(pageSize, 1), 100);
    }
}
