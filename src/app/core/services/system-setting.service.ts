import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { PublicSystemSetting, SystemSetting, SaveSystemSettingRequest } from '../models/system-setting.model';

/** Cài đặt chung của hệ thống — màn quản trị đọc/sửa, giao diện người dùng đọc phần công khai. */
@Injectable({ providedIn: 'root' })
export class SystemSettingService {
    private readonly _baseUrl = 'Settings';

    constructor(private readonly _apiService: ApiService) { }

    /** Cài đặt chung đầy đủ. GET /api/v1/settings */
    get(): Observable<ApiResponse<SystemSetting>> {
        return this._apiService.get<ApiResponse<SystemSetting>>(this._baseUrl);
    }

    /** Phần cài đặt công khai, không cần đăng nhập. GET /api/v1/settings/public */
    getPublic(): Observable<ApiResponse<PublicSystemSetting>> {
        return this._apiService.get<ApiResponse<PublicSystemSetting>>(`${this._baseUrl}/public`);
    }

    /** Cập nhật cài đặt chung. PUT /api/v1/settings */
    save(request: SaveSystemSettingRequest): Observable<ApiResponse<SystemSetting>> {
        return this._apiService.put<ApiResponse<SystemSetting>>(this._baseUrl, request);
    }
}
