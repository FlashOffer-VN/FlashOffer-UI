import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    Partner,
    PartnerStatus,
    BusinessType,
    CompanySize,
    CommissionType,
    ProductCategory,
    getPartnerStatusLabel,
    getBusinessTypeLabel,
    getCompanySizeLabel,
    getCommissionTypeLabel,
    getProductCategoryLabel
} from '../models/partner.model';
import { ApiResponse, PagedResponse } from '../models/paged-response.model';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    private readonly _baseUrl = 'partners';

    constructor(private _apiService: ApiService) { }

    // ==============================
    // GET LIST
    // ==============================

    getData(
        pageNumber = 1,
        pageSize = 10,
        search = '',
        status?: PartnerStatus,
        fromDate?: string,
        toDate?: string
    ): Observable<PagedResponse<Partner>> {
        // Backend yêu cầu pageSize trong [1, 100]
        pageSize = this.clampPageSize(pageSize);
        const params: any = {
            pageNumber,
            pageSize,
            search: search || ''
        };
        if (status !== undefined && status !== null) {
            params.status = status;
        }
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return this._apiService.get<PagedResponse<Partner>>(this._baseUrl, params);
    }

    /**
     * Đảm bảo pageSize trong khoảng hợp lệ mà backend cho phép ([1, 100]).
     */
    private clampPageSize(pageSize: number): number {
        if (!pageSize || pageSize < 1) return 10;
        if (pageSize > 100) return 100;
        return pageSize;
    }

    // ==============================
    // GET DETAIL
    // ==============================

    getDetail(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.get<ApiResponse<Partner>>(`${this._baseUrl}/${id}`);
    }

    // ==============================
    // APPROVE
    // ==============================

    approve(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.post<ApiResponse<Partner>>(`${this._baseUrl}/${id}/approve`, {});
    }

    // ==============================
    // REJECT
    // ==============================

    reject(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.post<ApiResponse<Partner>>(`${this._baseUrl}/${id}/reject`, {});
    }

    // ==============================
    // ACTIVATE
    // ==============================

    activate(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.post<ApiResponse<Partner>>(`${this._baseUrl}/${id}/activate`, {});
    }
}