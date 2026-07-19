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
        status?: CTVRegistrationStatus
    ): Observable<PagedResponse<CtvRegistration>> {
        const params: any = {
            pageNumber,
            pageSize,
            search,
        };
        if (status !== undefined) {
            params.status = status;
        }
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
}