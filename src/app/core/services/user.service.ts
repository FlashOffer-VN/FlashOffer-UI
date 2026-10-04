import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AdminUser } from '../models/user.model';
import { ApiResponse, PagedResponse } from '@core/models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly _baseUrl = 'Users';

    constructor(private _apiService: ApiService) { }

    /**
     * Danh sách người dùng phân trang (Admin)
     * GET /api/v1/Users?pageNumber=&pageSize=&search=
     */
    getData(pageNumber = 1, pageSize = 10, search = ''): Observable<PagedResponse<AdminUser>> {
        // Backend yêu cầu pageSize trong [1, 100]
        const params: any = { pageNumber, pageSize: this.clampPageSize(pageSize), search, sortBy: 'CreatedAt', sortOrder: 'desc' };

        return this._apiService.get<PagedResponse<AdminUser>>(this._baseUrl, params);
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
