import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/paged-response.model';
import {
    CommissionBeneficiary,
    CommissionConfig,
    MyCommission,
    SaveCommissionConfigRequest
} from '../models/commission.model';

/** Tài khoản chọn được khi cấu hình hoa hồng riêng. */
export interface CommissionUser {
    id: string;
    username: string;
    fullName: string;
    role: string;
}

/**
 * Cấu hình hoa hồng: bản chung cho mọi tài khoản hoặc bản riêng cho một/nhiều tài khoản,
 * và mức hoa hồng đang áp cho chính tài khoản đang đăng nhập.
 */
@Injectable({ providedIn: 'root' })
export class CommissionService {
    private readonly _baseUrl = 'commissions';

    constructor(private _apiService: ApiService) { }

    /** Danh sách cấu hình hoa hồng. GET /api/v1/commissions */
    getConfigs(beneficiary?: CommissionBeneficiary | null): Observable<PagedResponse<CommissionConfig>> {
        const params: Record<string, unknown> = { pageNumber: 1, pageSize: 50 };
        if (beneficiary) params['beneficiary'] = beneficiary;
        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this._apiService.get<PagedResponse<CommissionConfig>>(this._baseUrl, params);
    }

    /** Tìm tài khoản để chọn khi cấu hình riêng. GET /api/v1/commissions/users */
    searchUsers(search = ''): Observable<ApiResponse<CommissionUser[]>> {
        const params: Record<string, unknown> = {};
        if (search.trim()) params['search'] = search.trim();
        return this._apiService.get<ApiResponse<CommissionUser[]>>(`${this._baseUrl}/users`, params);
    }

    /** Lưu cấu hình cho bản chung hoặc cho một/nhiều tài khoản. POST /api/v1/commissions */
    save(request: SaveCommissionConfigRequest): Observable<ApiResponse<CommissionConfig[]>> {
        return this._apiService.post<ApiResponse<CommissionConfig[]>>(this._baseUrl, request);
    }

    /** Xoá một cấu hình hoa hồng. DELETE /api/v1/commissions/{id} */
    remove(id: string): Observable<ApiResponse<{ id: string }>> {
        return this._apiService.delete<ApiResponse<{ id: string }>>(`${this._baseUrl}/${id}`);
    }

    /** Danh sách cấu hình hoa hồng đã xoá mềm. GET /api/v1/commissions/deleted */
    getDeletedConfigs(beneficiary?: CommissionBeneficiary | null): Observable<PagedResponse<CommissionConfig>> {
        const params: Record<string, unknown> = { pageNumber: 1, pageSize: 50 };
        if (beneficiary) params['beneficiary'] = beneficiary;
        params['sortBy'] = 'CreatedAt';
        params['sortOrder'] = 'desc';

        return this._apiService.get<PagedResponse<CommissionConfig>>(`${this._baseUrl}/deleted`, params);
    }

    /** Khôi phục một cấu hình hoa hồng đã xoá mềm. POST /api/v1/commissions/{id}/restore */
    restore(id: string): Observable<ApiResponse<CommissionConfig>> {
        return this._apiService.post<ApiResponse<CommissionConfig>>(`${this._baseUrl}/${id}/restore`, {});
    }

    /** Mức hoa hồng đang áp cho chính tôi. GET /api/v1/commissions/me */
    getMine(): Observable<ApiResponse<MyCommission>> {
        return this._apiService.get<ApiResponse<MyCommission>>(`${this._baseUrl}/me`);
    }
}
