import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { ApiResponse } from '@core/models/paged-response.model';
import { PurgeRequest, PurgeResult, TrashEntity } from '@core/models/trash.model';

/**
 * Xoá VĨNH VIỄN bản ghi đã xoá mềm — chỉ dùng ở màn "Đã xoá" của từng nghiệp vụ.
 * Điều kiện xoá: danh sách dòng được chọn (ids) HOẶC khoảng ngày xoá mềm (fromDate/toDate).
 * Mỗi nghiệp vụ có endpoint + quyền riêng.
 */
@Injectable({ providedIn: 'root' })
export class TrashService {
    constructor(private _apiService: ApiService) { }

    /**
     * Xoá vĩnh viễn bản ghi của một nghiệp vụ
     * DELETE /api/v1/admin/trash/{entity}
     */
    purge(entity: TrashEntity, body: PurgeRequest): Observable<ApiResponse<PurgeResult>> {
        return this._apiService.delete<ApiResponse<PurgeResult>>(`admin/trash/${entity}`, body);
    }
}
