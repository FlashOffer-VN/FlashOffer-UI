/**
 * Xoá VĨNH VIỄN bản ghi đã xoá mềm (chỉ ở màn "Đã xoá") — khớp hợp đồng API /api/v1/admin/trash/*.
 */

/** Nghiệp vụ có màn "Đã xoá" hỗ trợ xoá vĩnh viễn (đúng đoạn route của API). */
export type TrashEntity =
    | 'collaborators'
    | 'partners'
    | 'purchase-requests'
    | 'offers'
    | 'group-buying'
    | 'groups'
    | 'social-posts'
    | 'commissions'
    | 'membership-tiers'
    | 'revenue-configs';

/** Điều kiện xoá vĩnh viễn: chọn dòng (ids) HOẶC khoảng ngày xoá mềm (fromDate/toDate) — không được để trống cả hai. */
export interface PurgeRequest {
    ids?: string[] | null;
    /** Ngày bắt đầu (yyyy-MM-dd) — mốc so là thời điểm xoá mềm. */
    fromDate?: string | null;
    /** Ngày kết thúc (yyyy-MM-dd) — tính hết ngày đó. */
    toDate?: string | null;
}

/** Kết quả một lần xoá vĩnh viễn. */
export interface PurgeResult {
    entityName: string;
    deletedCount: number;
}

/** Quyền xoá vĩnh viễn theo từng nghiệp vụ (khớp PermissionCode của API). */
export const TRASH_PERMISSION: Record<TrashEntity, string> = {
    collaborators: 'P157',
    partners: 'P158',
    'purchase-requests': 'P159',
    offers: 'P160',
    'group-buying': 'P161',
    groups: 'P162',
    'social-posts': 'P163',
    commissions: 'P164',
    'membership-tiers': 'P165',
    'revenue-configs': 'P166'
};
