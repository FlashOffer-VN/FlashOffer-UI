import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/paged-response.model';
import {
    BankAccount,
    BankAccountQuery,
    BankAccountVerificationCode,
    MyPayoutQuery,
    MyWallet,
    PayoutQuery,
    PayoutStatement,
    SaveBankAccountRequest,
    VerifyBankAccountRequest
} from '../models/payout.model';

/** Ví hoa hồng và thông tin ngân hàng nhận giải ngân của tài khoản đang đăng nhập. */
@Injectable({ providedIn: 'root' })
export class PayoutService {
    private readonly _baseUrl = 'Payouts';
    private readonly _bankAccountUrl = 'BankAccounts';

    constructor(private _apiService: ApiService) { }

    /** Số dư khả dụng, phí rút sớm, hạn mức và các lần chi trả gần đây. GET /api/v1/Payouts/me */
    getMyWallet(): Observable<ApiResponse<MyWallet>> {
        return this._apiService.get<ApiResponse<MyWallet>>(`${this._baseUrl}/me`);
    }

    /** Gửi yêu cầu rút hoa hồng sớm của chính người gọi. POST /api/v1/Payouts/withdrawals */
    createWithdrawal(amount: number): Observable<ApiResponse<PayoutStatement>> {
        return this._apiService.post<ApiResponse<PayoutStatement>>(`${this._baseUrl}/withdrawals`, { amount });
    }

    /** Huỷ một yêu cầu rút còn chờ duyệt. POST /api/v1/Payouts/{id}/cancel */
    cancelPayout(id: string): Observable<ApiResponse<PayoutStatement>> {
        return this._apiService.post<ApiResponse<PayoutStatement>>(`${this._baseUrl}/${id}/cancel`, {});
    }

    /** Thông tin ngân hàng nhận tiền của tôi; trả về rỗng khi chưa khai. GET /api/v1/BankAccounts/me */
    getMyBankAccount(): Observable<ApiResponse<BankAccount | null>> {
        return this._apiService.get<ApiResponse<BankAccount | null>>(`${this._bankAccountUrl}/me`);
    }

    /** Lưu thông tin ngân hàng nhận tiền của tôi. PUT /api/v1/BankAccounts/me */
    saveMyBankAccount(request: SaveBankAccountRequest): Observable<ApiResponse<BankAccount>> {
        return this._apiService.put<ApiResponse<BankAccount>>(`${this._bankAccountUrl}/me`, request);
    }

    /** Danh sách tài khoản ngân hàng chờ xác thực. GET /api/v1/BankAccounts */
    getBankAccounts(query: BankAccountQuery): Observable<PagedResponse<BankAccount>> {
        return this._apiService.get<PagedResponse<BankAccount>>(this._bankAccountUrl, { ...query });
    }

    /** Tạo (hoặc lấy lại) mã đối chiếu chuyển khoản của chính người gọi. POST /api/v1/BankAccounts/me/verification-code */
    issueMyBankAccountVerificationCode(): Observable<ApiResponse<BankAccountVerificationCode>> {
        return this._apiService.post<ApiResponse<BankAccountVerificationCode>>(`${this._bankAccountUrl}/me/verification-code`, {});
    }

    /** Ghi nhận xác thực thông tin ngân hàng của một tài khoản. PUT /api/v1/BankAccounts/{userId}/verification */
    verifyBankAccount(userId: string, request: VerifyBankAccountRequest): Observable<ApiResponse<BankAccount>> {
        return this._apiService.put<ApiResponse<BankAccount>>(`${this._bankAccountUrl}/${userId}/verification`, request);
    }

    /** Danh sách chi trả hoa hồng cho quản trị viên, lọc theo loại và trạng thái. GET /api/v1/Payouts */
    getPaged(query: PayoutQuery): Observable<PagedResponse<PayoutStatement>> {
        return this._apiService.get<PagedResponse<PayoutStatement>>(this._baseUrl, { ...query });
    }

    /**
     * Lịch sử chi trả của CHÍNH người gọi: lọc + phân trang phía máy chủ.
     * GET /api/v1/Payouts/my — API tự ép tài khoản hiện tại nên không gửi userId.
     */
    getMyPayouts(query: MyPayoutQuery): Observable<PagedResponse<PayoutStatement>> {
        // Chỉ gắn tham số khi thực sự có giá trị: HttpParams biến undefined/null thành chuỗi
        // "undefined"/"null" nên API báo lỗi dữ liệu không hợp lệ và danh sách luôn rỗng.
        const params: Record<string, string | number> = {
            page: query.page ?? 1,
            pageSize: query.pageSize ?? 10
        };
        if (query.search && query.search.trim()) params['search'] = query.search.trim();
        if (query.searchField) params['searchField'] = query.searchField;
        if (query.status != null) params['status'] = query.status;
        if (query.type != null) params['type'] = query.type;
        if (query.fromDate) params['fromDate'] = query.fromDate;
        if (query.toDate) params['toDate'] = query.toDate;

        return this._apiService.get<PagedResponse<PayoutStatement>>(`${this._baseUrl}/my`, params);
    }

    /** Duyệt một lần chi trả. POST /api/v1/Payouts/{id}/approve */
    approvePayout(id: string, note?: string): Observable<ApiResponse<PayoutStatement>> {
        return this._apiService.post<ApiResponse<PayoutStatement>>(`${this._baseUrl}/${id}/approve`, { note: note ?? null });
    }

    /** Từ chối một lần chi trả. POST /api/v1/Payouts/{id}/reject */
    rejectPayout(id: string, note?: string): Observable<ApiResponse<PayoutStatement>> {
        return this._apiService.post<ApiResponse<PayoutStatement>>(`${this._baseUrl}/${id}/reject`, { note: note ?? null });
    }

    /** Xác nhận đã chuyển khoản một lần chi trả. POST /api/v1/Payouts/{id}/paid */
    markPayoutPaid(id: string, note?: string): Observable<ApiResponse<PayoutStatement>> {
        return this._apiService.post<ApiResponse<PayoutStatement>>(`${this._baseUrl}/${id}/paid`, { note: note ?? null });
    }
}
