import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { MembershipTier, MyMembership, SaveMembershipTierRequest } from '../models/membership.model';

/** Hạng thành viên của chính tài khoản đang đăng nhập. */
@Injectable({ providedIn: 'root' })
export class MembershipService {
    private readonly _baseUrl = 'MembershipTiers';

    constructor(private _apiService: ApiService) { }

    /** Hạng hiện tại kèm quyền lợi và danh sách hạng. GET /api/v1/MembershipTiers/me */
    getMine(): Observable<ApiResponse<MyMembership>> {
        return this._apiService.get<ApiResponse<MyMembership>>(`${this._baseUrl}/me`);
    }

    /** Danh sách hạng thành viên cho màn quản trị. GET /api/v1/MembershipTiers?activeOnly= */
    getTiers(activeOnly = false): Observable<ApiResponse<MembershipTier[]>> {
        return this._apiService.get<ApiResponse<MembershipTier[]>>(this._baseUrl, { activeOnly });
    }

    /** Thêm mới (không truyền id) hoặc cập nhật một hạng. POST /api/v1/MembershipTiers?id= */
    saveTier(request: SaveMembershipTierRequest, id?: string | null): Observable<ApiResponse<MembershipTier>> {
        const endpoint = id ? `${this._baseUrl}?id=${id}` : this._baseUrl;
        return this._apiService.post<ApiResponse<MembershipTier>>(endpoint, request);
    }

    /** Xoá một hạng thành viên. DELETE /api/v1/MembershipTiers/{id} */
    deleteTier(id: string): Observable<ApiResponse<unknown>> {
        return this._apiService.delete<ApiResponse<unknown>>(`${this._baseUrl}/${id}`);
    }

    /** Danh sách hạng thành viên đã xoá mềm. GET /api/v1/MembershipTiers/deleted */
    getDeletedTiers(): Observable<ApiResponse<MembershipTier[]>> {
        return this._apiService.get<ApiResponse<MembershipTier[]>>(`${this._baseUrl}/deleted`);
    }

    /** Khôi phục một hạng thành viên đã xoá mềm. POST /api/v1/MembershipTiers/{id}/restore */
    restoreTier(id: string): Observable<ApiResponse<MembershipTier>> {
        return this._apiService.post<ApiResponse<MembershipTier>>(`${this._baseUrl}/${id}/restore`, {});
    }
}
