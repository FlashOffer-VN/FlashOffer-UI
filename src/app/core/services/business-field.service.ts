import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

/** Option cho app-ng-select-wrapper: value = BusinessField.Id, label = tên lĩnh vực. */
export interface BusinessFieldOption {
    value: string;
    label: string;
}

interface BusinessFieldDto {
    id: string;
    name: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessFieldService {
    private api = inject(ApiService);

    /**
     * Danh sách lĩnh vực hoạt động đang hoạt động (BusinessField — quản lý tập trung).
     * GET /api/v1/business-fields/active → { success, message, data: [{ id, name }] }
     */
    getActive(): Observable<BusinessFieldOption[]> {
        return this.api
            .get<{ data: BusinessFieldDto[] }>('business-fields/active')
            .pipe(
                map(res => (res?.data ?? []).map(f => ({ value: f.id, label: f.name }))),
                catchError(() => of<BusinessFieldOption[]>([]))
            );
    }
}
