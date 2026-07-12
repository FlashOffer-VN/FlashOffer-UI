// src/app/core/services/offer-request.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    CreateOfferRequest,
    OfferRequest,
    OfferRequestResponse,
    OfferRequestListResponse
} from '@core/models/offer-request.model';

@Injectable({
    providedIn: 'root'
})
export class OfferRequestService {
    private endpoint = 'OfferRequests';

    constructor(private apiService: ApiService) { }

    /**
     * Tạo yêu cầu nhận offer mới (Public - không cần đăng nhập)
     * POST /api/v1/OfferRequests/offer-requests
     */
    create(request: CreateOfferRequest): Observable<OfferRequestResponse> {
        return this.apiService.post<OfferRequestResponse>(`${this.endpoint}`, request);
    }

    /**
     * Lấy danh sách tất cả yêu cầu nhận offer (Chỉ Admin)
     * GET /api/v1/OfferRequests/offer-requests
     */
    getAll(): Observable<OfferRequestListResponse> {
        return this.apiService.get<OfferRequestListResponse>(`${this.endpoint}`);
    }

    /**
     * Lấy chi tiết yêu cầu nhận offer theo ID
     * GET /api/v1/OfferRequests/{id}
     */
    getById(id: string): Observable<OfferRequestResponse> {
        return this.apiService.get<OfferRequestResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Cập nhật trạng thái yêu cầu nhận offer (Admin)
     * PUT /api/v1/OfferRequests/{id}/status
     */
    updateStatus(id: string, status: number): Observable<OfferRequestResponse> {
        return this.apiService.put<OfferRequestResponse>(`${this.endpoint}/${id}/status`, { status });
    }

    /**
     * Xóa mềm yêu cầu nhận offer (Admin)
     * DELETE /api/v1/OfferRequests/{id}
     */
    delete(id: string): Observable<OfferRequestResponse> {
        return this.apiService.delete<OfferRequestResponse>(`${this.endpoint}/${id}`);
    }
}