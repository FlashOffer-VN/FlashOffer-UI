// src/app/core/models/permission.model.ts

/**
 * Mã quyền của hệ thống — giá trị khớp enum PermissionCode của API (mã = "P" + số 3 chữ số).
 * Dùng hằng số này thay vì viết chuỗi 'P020' trong code.
 */
export enum Permission {
    /** P001 */
    ViewDashboard = 'P001',
    /** P002 */
    ViewCrmDashboard = 'P002',
    /** P003 */
    ViewReportOverview = 'P003',
    /** P004 */
    ViewReportMembers = 'P004',
    /** P005 */
    ViewReportRequests = 'P005',
    /** P006 */
    ViewReportSocial = 'P006',
    /** P007 */
    ViewReportTrend = 'P007',
    /** P008 */
    ViewAuthAuditLogs = 'P008',
    /** P009 */
    ViewEntityAuditLogs = 'P009',
    /** P010 */
    ViewSystemSettings = 'P010',
    /** P011 */
    ViewReferralStats = 'P011',
    /** P020 */
    ViewUsers = 'P020',
    /** P021 */
    ResetUserPassword = 'P021',
    /** P022 */
    AssignUserRole = 'P022',
    /** P023 */
    ViewCollaborators = 'P023',
    /** P024 */
    ApproveCollaborator = 'P024',
    /** P025 */
    RejectCollaborator = 'P025',
    /** P026 */
    DeleteCollaborator = 'P026',
    /** P027 */
    RestoreCollaborator = 'P027',
    /** P040 */
    ViewPartners = 'P040',
    /** P041 */
    ApprovePartner = 'P041',
    /** P042 */
    RejectPartner = 'P042',
    /** P043 */
    ActivatePartner = 'P043',
    /** P044 */
    UpdatePartner = 'P044',
    /** P045 */
    DeletePartner = 'P045',
    /** P046 */
    ManagePartnerProducts = 'P046',
    /** P047 */
    ViewCompanies = 'P047',
    /** P048 */
    ManageCompanies = 'P048',
    /** P060 */
    ViewPurchaseRequests = 'P060',
    /** P061 */
    UpdatePurchaseRequestStatus = 'P061',
    /** P062 */
    ExportPurchaseRequests = 'P062',
    /** P063 */
    ViewOfferRequests = 'P063',
    /** P064 */
    UpdateOfferRequestStatus = 'P064',
    /** P065 */
    DeleteOfferRequest = 'P065',
    /** P066 */
    ViewGroupBuyingRequests = 'P066',
    /** P067 */
    UpdateGroupBuyingRequest = 'P067',
    /** P068 */
    UpdateGroupBuyingRequestStatus = 'P068',
    /** P070 */
    ViewGroups = 'P070',
    /** P071 */
    ManageGroups = 'P071',
    /** P072 */
    ApproveCommunityGroup = 'P072',
    /** P073 */
    ViewGroupPrivateRequests = 'P073',
    /** P074 */
    UpdateGroupPost = 'P074',
    /** P080 */
    ViewSocialPosts = 'P080',
    /** P081 */
    ApproveSocialPost = 'P081',
    /** P082 */
    RejectSocialPost = 'P082',
    /** P083 */
    PinSocialPost = 'P083',
    /** P084 */
    RestoreSocialPost = 'P084',
    /** P100 */
    ViewPermissions = 'P100',
    /** P101 */
    UpdateRolePermissions = 'P101',
    /** P102 */
    ViewSuperAdminAccount = 'P102',
    /** P103 */
    ViewFullAuditLogs = 'P103',
}

/** Một quyền trong danh mục API trả về. */
export interface PermissionItem {
    code: string;
    name: string;
    /** Nhóm chức năng: System | User | Partner | Purchase | Group | Community | SuperAdmin */
    module: string;
    /** View (màn hình) hoặc Action (thao tác) */
    kind: string;
    route?: string | null;
    endpoints?: string | null;
}

/** Quyền đang bật của một vai trò. */
export interface RolePermission {
    role: string;
    isSuperAdmin: boolean;
    permissionCodes: string[];
}

/** Ma trận phân quyền: danh mục quyền + quyền của từng vai trò. */
export interface PermissionMatrix {
    permissions: PermissionItem[];
    roles: RolePermission[];
}

/** Chuẩn hoá một mã quyền về dạng P### (nhận cả 'p20', 'P020', số 20). */
export function toPermissionCode(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return `P${String(value).padStart(3, '0')}`;

    const raw = String(value).trim().toUpperCase();
    if (!raw) return null;
    if (/^P[0-9]{1,3}$/.test(raw)) return `P${raw.slice(1).padStart(3, '0')}`;
    if (/^[0-9]{1,3}$/.test(raw)) return `P${raw.padStart(3, '0')}`;
    return null;
}
