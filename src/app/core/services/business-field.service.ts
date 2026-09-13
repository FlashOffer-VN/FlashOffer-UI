import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
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
     * Cache danh sách lĩnh vực — nhiều component cùng gọi `getActive()` (form đăng ký,
     * form sửa partner/CTV...) nhưng chỉ tốn ĐÚNG 1 request.
     * Gọi `refresh()` khi cần lấy lại dữ liệu mới.
     */
    private cache$: Observable<BusinessFieldOption[]> | null = null;

    /**
     * Danh sách lĩnh vực hoạt động đang hoạt động (BusinessField — quản lý tập trung).
     * GET /api/v1/business-fields/active → { success, message, data: [{ id, name }] }
     */
    getActive(): Observable<BusinessFieldOption[]> {
        if (!this.cache$) {
            this.cache$ = this.api
                .get<{ data: BusinessFieldDto[] }>('business-fields/active')
                .pipe(
                    map(res => (res?.data ?? []).map(f => ({ value: f.id, label: f.name }))),
                    catchError(() => of<BusinessFieldOption[]>([])),
                    // Giữ 1 bản, không refCount → request không bị gọi lại khi
                    // các subscriber cũ unsubscribe (đổi trang, đóng modal...).
                    shareReplay({ bufferSize: 1, refCount: false })
                );
        }

        return this.cache$;
    }

    /** Xoá cache — lần `getActive()` kế tiếp sẽ gọi lại API. */
    refresh(): void {
        this.cache$ = null;
    }
}
