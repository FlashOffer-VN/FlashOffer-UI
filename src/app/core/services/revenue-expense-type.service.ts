// core/services/revenue-expense-type.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import {
    AssignRevenueExpenseTypesRequest,
    RevenueConfig,
    RevenueExpenseType,
    RevenueExpenseTypeOption,
    RevenueTransactionType,
    SaveRevenueExpenseTypeRequest
} from '../models/revenue.model';

/** Quản lý loại chi phí dùng khi khai doanh thu và cách gắn chúng cho từng loại giao dịch. */
@Injectable({ providedIn: 'root' })
export class RevenueExpenseTypeService {
    private readonly _baseUrl = 'RevenueExpenseTypes';

    constructor(private _apiService: ApiService) { }

    /** Cấu hình doanh thu mặc định (thuế). GET /api/v1/RevenueExpenseTypes/config */
    getConfig(): Observable<ApiResponse<RevenueConfig>> {
        return this._apiService.get<ApiResponse<RevenueConfig>>(`${this._baseUrl}/config`);
    }

    /** Lưu cấu hình doanh thu mặc định (thuế). PUT /api/v1/RevenueExpenseTypes/config */
    saveConfig(request: RevenueConfig): Observable<ApiResponse<RevenueConfig>> {
        return this._apiService.put<ApiResponse<RevenueConfig>>(`${this._baseUrl}/config`, request);
    }

    /** Toàn bộ loại chi phí đã cấu hình. GET /api/v1/RevenueExpenseTypes */
    getAll(): Observable<ApiResponse<RevenueExpenseType[]>> {
        return this._apiService.get<ApiResponse<RevenueExpenseType[]>>(this._baseUrl);
    }

    /** Loại chi phí đang áp dụng cho một loại giao dịch (có cấu hình riêng thì theo riêng, không thì theo mặc định). GET /api/v1/RevenueExpenseTypes/resolve */
    resolve(type: RevenueTransactionType): Observable<ApiResponse<RevenueExpenseTypeOption[]>> {
        return this._apiService.get<ApiResponse<RevenueExpenseTypeOption[]>>(`${this._baseUrl}/resolve`, { type });
    }

    /** Thêm một loại chi phí. POST /api/v1/RevenueExpenseTypes */
    create(request: SaveRevenueExpenseTypeRequest): Observable<ApiResponse<RevenueExpenseType>> {
        return this._apiService.post<ApiResponse<RevenueExpenseType>>(this._baseUrl, request);
    }

    /** Sửa một loại chi phí. PUT /api/v1/RevenueExpenseTypes/{id} */
    update(id: string, request: SaveRevenueExpenseTypeRequest): Observable<ApiResponse<RevenueExpenseType>> {
        return this._apiService.put<ApiResponse<RevenueExpenseType>>(`${this._baseUrl}/${id}`, request);
    }

    /** Xóa một loại chi phí. DELETE /api/v1/RevenueExpenseTypes/{id} */
    remove(id: string): Observable<ApiResponse<boolean>> {
        return this._apiService.delete<ApiResponse<boolean>>(`${this._baseUrl}/${id}`);
    }

    /** Gán hàng loạt loại chi phí cho các loại giao dịch; mảng rỗng nghĩa là về mặc định. PUT /api/v1/RevenueExpenseTypes/assign */
    assign(request: AssignRevenueExpenseTypesRequest): Observable<ApiResponse<boolean>> {
        return this._apiService.put<ApiResponse<boolean>>(`${this._baseUrl}/assign`, request);
    }
}
