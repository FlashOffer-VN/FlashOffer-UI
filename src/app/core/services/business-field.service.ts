import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { PagedResponse } from '@core/models/paged-response.model';
import {
    BusinessFieldAdmin,
    BusinessFieldCompany,
    BusinessFieldFormValue,
    BusinessFieldRelated,
    BusinessFieldUser
} from '@core/models/business-field.model';

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

    // ---------------------------------------------------------------------
    // Màn quản trị lĩnh vực hoạt động
    // ---------------------------------------------------------------------

    /** Toàn bộ lĩnh vực (kể cả đang tắt) kèm số công ty/tài khoản. */
    getAllForAdmin(): Observable<BusinessFieldAdmin[]> {
        return this.api
            .get<{ data: BusinessFieldAdmin[] }>('business-fields')
            .pipe(map(res => res?.data ?? []));
    }

    /** Công ty và tài khoản thuộc một lĩnh vực. */
    getRelated(id: string): Observable<BusinessFieldRelated | null> {
        return this.api
            .get<{ data: BusinessFieldRelated }>(`business-fields/${id}/related`)
            .pipe(map(res => res?.data ?? null));
    }

    /**
     * Công ty thuộc một lĩnh vực — phân trang phía server (màn chi tiết lĩnh vực).
     * GET /api/v1/business-fields/{id}/companies?page=&pageSize=&search=
     * search khớp mã công ty / tên / mã số thuế.
     */
    getFieldCompanies(
        id: string,
        page = 1,
        pageSize = 10,
        search?: string
    ): Observable<PagedResponse<BusinessFieldCompany>> {
        // `any` như các list khác trong repo: tham số tùy chọn thêm dần, tránh lỗi index-signature.
        const params: any = { page, pageSize };
        if (search) params.search = search;
        return this.api.get<PagedResponse<BusinessFieldCompany>>(`business-fields/${id}/companies`, params);
    }

    /**
     * Tài khoản (CTV + đối tác) thuộc một lĩnh vực — phân trang phía server (màn chi tiết lĩnh vực).
     * GET /api/v1/business-fields/{id}/users?page=&pageSize=&search=&role=
     * search khớp mã tài khoản / họ tên / SĐT / tên công ty; role = 'Collaborator' | 'Partner'.
     */
    getFieldUsers(
        id: string,
        page = 1,
        pageSize = 10,
        search?: string,
        role?: string
    ): Observable<PagedResponse<BusinessFieldUser>> {
        const params: any = { page, pageSize };
        if (search) params.search = search;
        if (role) params.role = role;
        return this.api.get<PagedResponse<BusinessFieldUser>>(`business-fields/${id}/users`, params);
    }

    create(payload: BusinessFieldFormValue): Observable<BusinessFieldAdmin | null> {
        return this.api
            .post<{ data: BusinessFieldAdmin }>('business-fields', payload)
            .pipe(map(res => res?.data ?? null), tap(() => this.refresh()));
    }

    update(id: string, payload: BusinessFieldFormValue): Observable<BusinessFieldAdmin | null> {
        return this.api
            .put<{ data: BusinessFieldAdmin }>(`business-fields/${id}`, payload)
            .pipe(map(res => res?.data ?? null), tap(() => this.refresh()));
    }

    remove(id: string): Observable<unknown> {
        return this.api.delete(`business-fields/${id}`).pipe(tap(() => this.refresh()));
    }
}
