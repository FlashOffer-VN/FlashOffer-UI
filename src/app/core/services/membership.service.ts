import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { MyMembership } from '../models/membership.model';

/** Hạng thành viên của chính tài khoản đang đăng nhập. */
@Injectable({ providedIn: 'root' })
export class MembershipService {
    private readonly _baseUrl = 'membership-tiers';

    constructor(private _apiService: ApiService) { }

    /** Hạng hiện tại kèm quyền lợi và danh sách hạng. GET /api/v1/membership-tiers/me */
    getMine(): Observable<ApiResponse<MyMembership>> {
        return this._apiService.get<ApiResponse<MyMembership>>(`${this._baseUrl}/me`);
    }
}
