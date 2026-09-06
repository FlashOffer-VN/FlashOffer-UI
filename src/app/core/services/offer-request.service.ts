// src/app/core/services/offer-request.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    CreateOfferRequest,
    OfferRequest,
    OfferRequestListResponse,
    OfferRequestPagedResponse,
    OfferRequestResponse,
    OfferRequestStatusResponse,
    OfferStatus
} from '@core/models/offer-request.model';

@Injectable({
    providedIn: 'root'
})
export class OfferRequestService {
    private endpoint = 'OfferRequests';

    constructor(private apiService: ApiService) { }

    /**
     * Tạo yêu cầu nhận offer mới (Public - không cần đăng nhập)
     * POST /api/v1/OfferRequests
     */
    create(request: CreateOfferRequest): Observable<OfferRequestResponse> {
        return this.apiService.post<OfferRequestResponse>(`${this.endpoint}`, request);
    }

    /**
     * Lấy danh sách tất cả yêu cầu nhận offer (Admin)
     * GET /api/v1/OfferRequests
     */
    getAll(): Observable<OfferRequestListResponse> {
        return this.apiService.get<OfferRequestListResponse>(`${this.endpoint}`);
    }

    /**
     * Lấy danh sách phân trang yêu cầu nhận offer (Admin)
     * GET /api/v1/OfferRequests?pageNumber=&pageSize=&search=&status=
     */
    getData(
        pageNumber = 1,
        pageSize = 10,
        search = '',
        status?: OfferStatus,
        isOfferSent?: boolean
    ): Observable<OfferRequestPagedResponse> {
        const params: any = {
            pageNumber,
            pageSize,
            search: search || ''
        };
        if (status !== undefined && status !== null) {
            params.status = status;
        }
        if (isOfferSent !== undefined && isOfferSent !== null) {
            params.isOfferSent = isOfferSent;
        }
        return this.apiService.get<OfferRequestPagedResponse>(this.endpoint, params);
    }

    /**
     * Lấy chi tiết yêu cầu nhận offer theo ID (Admin)
     * GET /api/v1/OfferRequests/{id}
     */
    getById(id: string): Observable<OfferRequestResponse> {
        return this.apiService.get<OfferRequestResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Cập nhật trạng thái yêu cầu nhận offer (Admin)
     * PATCH /api/v1/OfferRequests/{id}/status
     */
    updateStatus(id: string, status: OfferStatus): Observable<OfferRequestStatusResponse> {
        return this.apiService.patch<OfferRequestStatusResponse>(`${this.endpoint}/${id}/status`, { status });
    }

    /**
     * Xóa mềm yêu cầu nhận offer (Admin)
     * DELETE /api/v1/OfferRequests/{id}
     */
    delete(id: string): Observable<OfferRequestResponse> {
        return this.apiService.delete<OfferRequestResponse>(`${this.endpoint}/${id}`);
    }
}