// core/services/referral.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ApiResponse } from '@core/models/paged-response.model';

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
}
