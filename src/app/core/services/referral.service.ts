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
     * Bỏ tham số rỗng trước khi gửi: HttpParams biến null/undefined thành chuỗi "null"/"undefined"
     * nên API bind DateTime? sẽ báo validation_error (lỗi màn thống kê giới thiệu khi chưa chọn ngày).
     */
    private cleanQuery(query: object): Record<string, any> {
        const params: Record<string, any> = {};

        Object.entries(query).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params[key] = value;
            }
        });

        return params;
    }

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
        return this._apiService.get<PagedResponse<ReferralStatsItem>>(`${this._baseUrl}/stats`, this.cleanQuery(query));
    }

    /**
     * Số liệu tổng hợp + số phát sinh theo ngày cho board thống kê (màn quản trị).
     * GET /api/v1/Referrals/stats/overview
     */
    getOverview(query: ReferralStatsQuery): Observable<ApiResponse<ReferralStatsOverview>> {
        return this._apiService.get<ApiResponse<ReferralStatsOverview>>(`${this._baseUrl}/stats/overview`, this.cleanQuery(query));
    }

    /**
     * Danh sách phát sinh của một mã chia sẻ (màn quản trị).
     * GET /api/v1/Referrals/stats/{referralCode}/events
     */
    getEvents(referralCode: string, query: ReferralEventQuery): Observable<PagedResponse<ReferralEventItem>> {
        return this._apiService.get<PagedResponse<ReferralEventItem>>(
            `${this._baseUrl}/stats/${encodeURIComponent(referralCode)}/events`,
            this.cleanQuery(query)
        );
    }

    /**
     * Thống kê giới thiệu của chính tài khoản đang đăng nhập (khu vực thành viên).
     * GET /api/v1/Referrals/me/stats
     */
    getMyStats(query: ReferralStatsQuery): Observable<ApiResponse<ReferralStatsOverview>> {
        return this._apiService.get<ApiResponse<ReferralStatsOverview>>(`${this._baseUrl}/me/stats`, this.cleanQuery(query));
    }

    /**
     * Phát sinh giới thiệu của chính tài khoản đang đăng nhập (khu vực thành viên).
     * GET /api/v1/Referrals/me/events
     */
    getMyEvents(query: ReferralEventQuery): Observable<PagedResponse<ReferralEventItem>> {
        return this._apiService.get<PagedResponse<ReferralEventItem>>(`${this._baseUrl}/me/events`, this.cleanQuery(query));
    }
}
