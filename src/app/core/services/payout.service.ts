import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { BankAccount, MyWallet } from '../models/payout.model';

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

    /** Thông tin ngân hàng nhận tiền của tôi; trả về rỗng khi chưa khai. GET /api/v1/BankAccounts/me */
    getMyBankAccount(): Observable<ApiResponse<BankAccount | null>> {
        return this._apiService.get<ApiResponse<BankAccount | null>>(`${this._bankAccountUrl}/me`);
    }
}
