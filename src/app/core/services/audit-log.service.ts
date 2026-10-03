import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/services/api.service';
import { AuditLogEntry, AuditLogQuery, AuthAuditLogEntry, AuthAuditLogQuery } from '@core/models/audit-log.model';
import { PagedResponse } from '@core/models/paged-response.model';

/**
 * Nhật ký hoạt động đầy đủ (không che dữ liệu) — chỉ tài khoản có quyền P103 gọi được,
 * dùng cho màn hình nhật ký trong mục Cài đặt.
 */
@Injectable({ providedIn: 'root' })
export class AuditLogService {
    private readonly _baseUrl = 'admin/audit-logs';

    constructor(private readonly _api: ApiService) { }

    /** Nhật ký thao tác dữ liệu (thêm/sửa/xoá trên các bảng nghiệp vụ). */
    getFullEntityLogs(query: AuditLogQuery): Observable<PagedResponse<AuditLogEntry>> {
        return this._api.get<PagedResponse<AuditLogEntry>>(`${this._baseUrl}/full/entity`, { ...query });
    }

    /** Nhật ký đăng nhập, đổi mật khẩu, làm mới token. */
    getFullAuthLogs(query: AuthAuditLogQuery): Observable<PagedResponse<AuthAuditLogEntry>> {
        return this._api.get<PagedResponse<AuthAuditLogEntry>>(`${this._baseUrl}/full/auth`, { ...query });
    }
}
