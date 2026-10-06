import { AuditLogDeleteRequest } from '@core/models/audit-log.model';

/** Số dòng tối đa mỗi lần xoá theo lựa chọn — khớp AuditLogDeletionRules.MaxIdsPerRequest của API. */
export const MAX_DELETE_IDS = 1000;

export type DeleteScopeFailure = 'noCriteria' | 'invalidRange' | 'tooManyIds';

export type DeleteScopeResult =
    | { ok: true; mode: 'selection' | 'dateRange'; request: AuditLogDeleteRequest }
    | { ok: false; reason: DeleteScopeFailure };

export interface DeleteScopeInput {
    /** Id các dòng đang tick chọn. */
    ids: string[];
    fromDate: string | null;
    toDate: string | null;
}

/**
 * Dựng điều kiện xoá nhật ký gửi lên API: ưu tiên danh sách dòng được chọn, không chọn gì thì xoá theo
 * khoảng ngày. Chặn ngay trên UI các trường hợp API cũng chặn (thiếu điều kiện, khoảng ngày ngược,
 * quá nhiều dòng) để người dùng thấy thông báo rõ thay vì lỗi 400.
 */
export function buildDeleteScope(input: DeleteScopeInput): DeleteScopeResult {
    const ids = Array.from(new Set(input.ids.filter(id => !!id)));

    if (ids.length > MAX_DELETE_IDS) return { ok: false, reason: 'tooManyIds' };
    if (ids.length > 0) return { ok: true, mode: 'selection', request: { ids } };

    const fromDate = input.fromDate || null;
    const toDate = input.toDate || null;

    if (!fromDate && !toDate) return { ok: false, reason: 'noCriteria' };
    if (fromDate && toDate && fromDate > toDate) return { ok: false, reason: 'invalidRange' };

    return {
        ok: true,
        mode: 'dateRange',
        request: { ...(fromDate ? { fromDate } : {}), ...(toDate ? { toDate } : {}) }
    };
}
