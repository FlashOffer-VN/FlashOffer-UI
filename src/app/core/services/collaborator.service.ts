import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    Collaborator,
    CreateCollaboratorRequest,
    UpdateCollaboratorRequest,
    CollaboratorFilter
} from '../models/collaborator.model';
import { PagedResponse } from '@core/models/paged-response.model';

@Injectable({ providedIn: 'root' })
export class CollaboratorService {
    private readonly _baseUrl = 'Collaborators';

    constructor(private _apiService: ApiService) { }

    /**
     * Đăng ký CTV mới
     */
    register(data: CreateCollaboratorRequest): Observable<{ success: boolean; message: string; data: Collaborator }> {
        return this._apiService.post<{ success: boolean; message: string; data: Collaborator }>(this._baseUrl, data);
    }

    /**
     * Lấy danh sách CTV phân trang
     */
    getPaged(pageNumber: number = 1, pageSize: number = 10, filter?: CollaboratorFilter): Observable<PagedResponse<Collaborator>> {
        const params: any = {
            page: pageNumber,
            size: pageSize
        };
        if (filter?.search) params.search = filter.search;
        if (filter?.status) params.status = filter.status;
        if (filter?.fromDate) params.fromDate = filter.fromDate;
        if (filter?.toDate) params.toDate = filter.toDate;

        return this._apiService.get<PagedResponse<Collaborator>>(this._baseUrl, params);
    }

    /**
     * Lấy CTV theo Id
     */
    getById(id: string): Observable<{ success: boolean; message: string; data: Collaborator }> {
        return this._apiService.get<{ success: boolean; message: string; data: Collaborator }>(`${this._baseUrl}/${id}`);
    }

    /**
     * Cập nhật CTV
     */
    update(id: string, data: UpdateCollaboratorRequest): Observable<{ success: boolean; message: string; data: Collaborator }> {
        return this._apiService.put<{ success: boolean; message: string; data: Collaborator }>(`${this._baseUrl}/${id}`, data);
    }

    /**
     * Duyệt CTV
     */
    approve(id: string): Observable<{ success: boolean; message: string }> {
        return this._apiService.post<{ success: boolean; message: string }>(`${this._baseUrl}/${id}/approve`, {});
    }

    /**
     * Từ chối CTV
     */
    reject(id: string, reason?: string): Observable<{ success: boolean; message: string }> {
        return this._apiService.post<{ success: boolean; message: string }>(`${this._baseUrl}/${id}/reject`, { reason });
    }

    /**
     * Xóa CTV
     */
    delete(id: string): Observable<{ success: boolean; message: string }> {
        return this._apiService.delete<{ success: boolean; message: string }>(`${this._baseUrl}/${id}`);
    }

    /**
     * Khôi phục CTV
     */
    restore(id: string): Observable<{ success: boolean; message: string }> {
        return this._apiService.post<{ success: boolean; message: string }>(`${this._baseUrl}/${id}/restore`, {});
    }
}