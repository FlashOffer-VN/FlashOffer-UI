// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardResponse } from '@core/models/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly endpoint = 'admin';

    constructor(private apiService: ApiService) { }

    /**
     * Thống kê tổng quan cho Admin
     * GET /api/v1/admin
     */
    getStats(): Observable<DashboardResponse> {
        return this.apiService.get<DashboardResponse>(this.endpoint);
    }
}