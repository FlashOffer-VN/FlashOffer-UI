import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PagedResponse } from '@core/models/paged-response.model';
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
     * Lấy danh sách phân trang (Admin)
     * GET /api/v1/PurchaseRequests?pageNumber=&pageSize=&search=&status=
     */
    getData(
        pageNumber = 1,
        pageSize = 10,
        search = '',
        status?: PurchaseRequestStatus
    ): Observable<PagedResponse<PurchaseRequest>> {
        const params: any = {
            pageNumber,
            pageSize,
            search: search || ''
        };
        if (status !== undefined && status !== null) {
            params.status = status;
        }
        return this.apiService.get<PagedResponse<PurchaseRequest>>(this.endpoint, params);
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
     * PATCH /api/v1/PurchaseRequests/{id}/status
     */
    updateStatus(id: string, status: PurchaseRequestStatus): Observable<PurchaseRequestResponse> {
        const payload: UpdatePurchaseRequestStatusDto = { status };
        return this.apiService.patch<PurchaseRequestResponse>(`${this.endpoint}/${id}/status`, payload);
    }
}