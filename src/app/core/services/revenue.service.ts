// core/services/revenue.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/paged-response.model';
import {
    RevenueQuery,
    RevenueStats,
    RevenueStatsQuery,
    RevenueTransactionType,
    SaveTransactionRevenueRequest,
    TransactionRevenue
} from '../models/revenue.model';

/** Khai doanh thu từng giao dịch và thống kê doanh thu theo kỳ. */
@Injectable({ providedIn: 'root' })
export class RevenueService {
    private readonly _baseUrl = 'Revenues';

    constructor(private _apiService: ApiService) { }

    /** Bản khai của một giao dịch; chưa khai thì máy chủ trả về rỗng để màn hình mở form trắng. GET /api/v1/Revenues/by-reference */
    getByReference(type: RevenueTransactionType, referenceId: string): Observable<ApiResponse<TransactionRevenue | null>> {
        return this._apiService.get<ApiResponse<TransactionRevenue | null>>(`${this._baseUrl}/by-reference`, { type, referenceId });
    }

    /** Một bản khai theo id. GET /api/v1/Revenues/{id} */
    getById(id: string): Observable<ApiResponse<TransactionRevenue>> {
        return this._apiService.get<ApiResponse<TransactionRevenue>>(`${this._baseUrl}/${id}`);
    }

    /** Danh sách bản khai, lọc theo mã giao dịch, loại và trạng thái. GET /api/v1/Revenues */
    getPaged(query: RevenueQuery): Observable<PagedResponse<TransactionRevenue>> {
        return this._apiService.get<PagedResponse<TransactionRevenue>>(this._baseUrl, query as Record<string, any>);
    }

    /** Thống kê theo khoảng thời gian, gộp theo ngày/tuần/tháng/năm; chỉ tính bản đã chốt. GET /api/v1/Revenues/stats */
    getStats(query: RevenueStatsQuery): Observable<ApiResponse<RevenueStats>> {
        return this._apiService.get<ApiResponse<RevenueStats>>(`${this._baseUrl}/stats`, query as Record<string, any>);
    }

    /** Lưu bản khai (máy chủ tính lại toàn bộ số liệu). POST /api/v1/Revenues */
    save(request: SaveTransactionRevenueRequest): Observable<ApiResponse<TransactionRevenue>> {
        return this._apiService.post<ApiResponse<TransactionRevenue>>(this._baseUrl, request);
    }

    /** Chốt số liệu và khoá bản khai. POST /api/v1/Revenues/{id}/confirm */
    confirm(id: string): Observable<ApiResponse<TransactionRevenue>> {
        return this._apiService.post<ApiResponse<TransactionRevenue>>(`${this._baseUrl}/${id}/confirm`, {});
    }
}
