// core/services/referral.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse, PagedResponse } from '@core/models/paged-response.model';
import {
    ReferralEventItem,
    ReferralEventQuery,
    ReferralStatsItem,
    ReferralStatsOverview,
    ReferralStatsQuery
} from '@core/models/referral-stats.model';

@Injectable({ providedIn: 'root' })
export class ReferralService {
    private readonly _baseUrl = 'Referrals';

    constructor(private _apiService: ApiService) { }

    /**
     * Ghi nhận mã chia sẻ (?ref=) trên link vào tài khoản đang đăng nhập — lần đầu mới ghi,
     * mở link của CTV khác sau đó không ghi đè.
     * POST /api/v1/Referrals/me
     */
    saveMyReferralCode(referralCode: string): Observable<string | null> {
        return this._apiService
            .post<ApiResponse<{ referralCode: string | null }>>(`${this._baseUrl}/me`, { referralCode })
            .pipe(
                map((response) => response?.data?.referralCode ?? null),
                // Chưa đăng nhập / lỗi mạng thì bỏ qua, không chặn trang
                catchError(() => of(null))
            );
    }

    /**
     * Thống kê theo từng mã chia sẻ (màn quản trị).
     * GET /api/v1/Referrals/stats
     */
    getStats(query: ReferralStatsQuery): Observable<PagedResponse<ReferralStatsItem>> {
        return this._apiService.get<PagedResponse<ReferralStatsItem>>(`${this._baseUrl}/stats`, query);
    }

    /**
     * Số liệu tổng hợp + số phát sinh theo ngày cho board thống kê (màn quản trị).
     * GET /api/v1/Referrals/stats/overview
     */
    getOverview(query: ReferralStatsQuery): Observable<ApiResponse<ReferralStatsOverview>> {
        return this._apiService.get<ApiResponse<ReferralStatsOverview>>(`${this._baseUrl}/stats/overview`, query);
    }

    /**
     * Danh sách phát sinh của một mã chia sẻ (màn quản trị).
     * GET /api/v1/Referrals/stats/{referralCode}/events
     */
    getEvents(referralCode: string, query: ReferralEventQuery): Observable<PagedResponse<ReferralEventItem>> {
        return this._apiService.get<PagedResponse<ReferralEventItem>>(
            `${this._baseUrl}/stats/${encodeURIComponent(referralCode)}/events`,
            query
        );
    }
}
