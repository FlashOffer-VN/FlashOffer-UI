import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    CreateGroupBuyingRequest,
    GroupBuyingRequest,
    GroupBuyingResponse,
    GroupBuyingListResponse
} from '@core/models/group-buying-request.model';

@Injectable({
    providedIn: 'root'
})
export class GroupBuyingRequestService {
    private endpoint = 'GroupBuyingRequests';

    constructor(private apiService: ApiService) { }

    /**
     * Tạo yêu cầu mua chung mới
     * POST /api/v1/GroupBuyingRequests
     */
    create(request: CreateGroupBuyingRequest): Observable<GroupBuyingResponse> {
        return this.apiService.post<GroupBuyingResponse>(this.endpoint, request);
    }

    /**
     * Lấy danh sách tất cả yêu cầu mua chung
     * GET /api/v1/GroupBuyingRequests
     */
    getAll(): Observable<GroupBuyingListResponse> {
        return this.apiService.get<GroupBuyingListResponse>(this.endpoint);
    }

    /**
     * Lấy chi tiết yêu cầu mua chung theo ID
     * GET /api/v1/GroupBuyingRequests/{id}
     */
    getById(id: string): Observable<GroupBuyingResponse> {
        return this.apiService.get<GroupBuyingResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Cập nhật trạng thái yêu cầu mua chung (Admin)
     * PUT /api/v1/GroupBuyingRequests/{id}/status
     */
    updateStatus(id: string, status: number): Observable<GroupBuyingResponse> {
        return this.apiService.put<GroupBuyingResponse>(`${this.endpoint}/${id}/status`, { status });
    }

    /**
     * Hủy yêu cầu mua chung
     * DELETE /api/v1/GroupBuyingRequests/{id}
     */
    cancel(id: string): Observable<GroupBuyingResponse> {
        return this.apiService.delete<GroupBuyingResponse>(`${this.endpoint}/${id}`);
    }
}