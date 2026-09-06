import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
    CtvRegistration,
    CTVRegistrationStatus,
} from '../models/ctv.model';
import { ApiResponse, PagedResponse } from '../models/paged-response.model';

@Injectable({
    providedIn: 'root'
})
export class CtvService {
    private readonly _baseUrl = 'Ctv';

    constructor(private _apiService: ApiService) { }

    getData(
        pageNumber = 1,
        pageSize = 10,
        search = '',
        status?: CTVRegistrationStatus,
        fromDate?: string,
        toDate?: string
    ): Observable<PagedResponse<CtvRegistration>> {
        const params: any = {
            pageNumber,
            pageSize,
            search,
        };
        if (status !== undefined) {
            params.status = status;
        }
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return this._apiService.get<PagedResponse<CtvRegistration>>(
            this._baseUrl,
            params
        );
    }

    getDetail(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.get<ApiResponse<CtvRegistration>>(
            `${this._baseUrl}/${id}`
        );
    }

    approve(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.post<ApiResponse<CtvRegistration>>(
            `${this._baseUrl}/${id}/approve`,
            {}
        );
    }

    reject(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.post<ApiResponse<CtvRegistration>>(
            `${this._baseUrl}/${id}/reject`,
            {}
        );
    }

    /**
     * Danh sách CTV đã xóa (Admin)
     * GET /api/v1/Ctv/deleted?pageNumber=&pageSize=&search=
     */
    getDeletedData(pageNumber = 1, pageSize = 10, search = '', fromDate?: string, toDate?: string): Observable<PagedResponse<CtvRegistration>> {
        const params: any = { pageNumber, pageSize, search };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        return this._apiService.get<PagedResponse<CtvRegistration>>(
            `${this._baseUrl}/deleted`,
            params
        );
    }

    /**
     * Xóa mềm CTV (Admin)
     * DELETE /api/v1/Ctv/{id}
     */
    delete(id: string): Observable<any> {
        return this._apiService.delete<any>(`${this._baseUrl}/${id}`);
    }

    /**
     * Khôi phục CTV đã xóa (Admin)
     * POST /api/v1/Ctv/{id}/restore
     */
    restore(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.post<ApiResponse<CtvRegistration>>(
            `${this._baseUrl}/${id}/restore`,
            {}
        );
    }
}