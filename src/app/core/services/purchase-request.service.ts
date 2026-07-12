import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    CreatePurchaseRequestDto,
    UpdatePurchaseRequestStatusDto,
    PurchaseRequest,
    PurchaseRequestStatus
} from '@core/models/purchase-request.model';

// Interface cho response danh sách
export interface PurchaseRequestListResponse {
    success: boolean;
    message: string;
    data: PurchaseRequest[];
    errors: string[] | null;
    timestamp: string;
}

// Interface cho response chi tiết
export interface PurchaseRequestResponse {
    success: boolean;
    message: string;
    data: PurchaseRequest;
    errors: string[] | null;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class PurchaseRequestService {
    private readonly endpoint = 'PurchaseRequests';

    constructor(private apiService: ApiService) { }

    /**
     * Tạo yêu cầu tìm nhà cung cấp mới
     * POST /api/v1/PurchaseRequests
     */
    create(data: CreatePurchaseRequestDto): Observable<PurchaseRequestResponse> {
        return this.apiService.post<PurchaseRequestResponse>(this.endpoint, data);
    }

    /**
     * Lấy danh sách tất cả yêu cầu (Admin)
     * GET /api/v1/PurchaseRequests
     */
    getAll(): Observable<PurchaseRequestListResponse> {
        return this.apiService.get<PurchaseRequestListResponse>(this.endpoint);
    }

    /**
     * Lấy chi tiết yêu cầu theo ID
     * GET /api/v1/PurchaseRequests/{id}
     */
    getById(id: string): Observable<PurchaseRequestResponse> {
        return this.apiService.get<PurchaseRequestResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Cập nhật trạng thái yêu cầu (Admin)
     * PUT /api/v1/PurchaseRequests/{id}/status
     */
    updateStatus(id: string, status: PurchaseRequestStatus): Observable<PurchaseRequestResponse> {
        const payload: UpdatePurchaseRequestStatusDto = { status };
        return this.apiService.put<PurchaseRequestResponse>(`${this.endpoint}/${id}/status`, payload);
    }

    /**
     * Hủy yêu cầu (User)
     * PUT /api/v1/PurchaseRequests/{id}/cancel
     */
    cancel(id: string): Observable<PurchaseRequestResponse> {
        return this.apiService.put<PurchaseRequestResponse>(`${this.endpoint}/${id}/cancel`, {});
    }
}