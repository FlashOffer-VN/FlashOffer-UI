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
        status?: PartnerStatus
    ): Observable<PagedResponse<Partner>> {
        const params: any = {
            pageNumber,
            pageSize,
            search: search || ''
        };
        if (status !== undefined && status !== null) {
            params.status = status;
        }
        return this._apiService.get<PagedResponse<Partner>>(this._baseUrl, params);
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