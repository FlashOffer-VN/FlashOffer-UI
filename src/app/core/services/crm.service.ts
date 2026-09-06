// src/app/core/services/crm.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CrmDashboardResponse } from '../models/crm.model';

@Injectable({ providedIn: 'root' })
export class CrmService {
    private readonly endpoint = 'admin/crm';

    constructor(private apiService: ApiService) { }

    /**
     * Thống kê CRM cho Admin
     * GET /api/v1/admin/crm
     */
    getStats(): Observable<CrmDashboardResponse> {
        return this.apiService.get<CrmDashboardResponse>(this.endpoint);
    }
}