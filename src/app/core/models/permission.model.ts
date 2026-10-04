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
    /** P012 */
    ViewMyReferralStats = 'P012',
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
    /** P028 */
    ViewMyGroupBuying = 'P028',
    /** P029 */
    ViewMyRequests = 'P029',
    /** P030 */
    ViewMyPosts = 'P030',
    /** P031 */
    ViewMyGroups = 'P031',
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
    /** P104 */
    UpdateUserPermissions = 'P104',
    /** P105 */
    ViewCommissionConfigs = 'P105',
    /** P106 */
    UpdateCommissionConfigs = 'P106',
    /** P013 */
    ViewMyCommission = 'P013',
    /** P014 */
    UpdateMyBankAccount = 'P014',
    /** P015 */
    RequestCommissionWithdrawal = 'P015',
    /** P107 */
    ViewPayouts = 'P107',
    /** P108 */
    ProcessPayouts = 'P108',
    /** P109 */
    ManageMembershipTiers = 'P109',
    /** P110 */
    VerifyBankAccounts = 'P110',
    /** P111 */
    UpdateSystemSettings = 'P111',
    /** P112 */
    ManageTransactionRevenue = 'P112',
    /** P113 */
    ViewTransactionRevenue = 'P113',
    /** P114 */
    ManageRevenueConfig = 'P114',
}

/** Nhóm quyền (bảng PermissionGroups): mã, tên hiển thị và thứ tự. */
export interface PermissionGroupItem {
    code: string;
    /** Tên nhóm tiếng Việt. */
    name: string;
    /** Tên nhóm tiếng Anh. */
    nameEn: string;
    sortOrder: number;
}

/** Một quyền trong danh mục API trả về. */
export interface PermissionItem {
    code: string;
    name: string;
    /** Nhóm chức năng theo enum: System | User | Partner | Purchase | Group | Community | Referral | SuperAdmin */
    module: string;
    /** Mã nhóm quyền dùng để gom nhóm trên màn phân quyền (SYSTEM, USER, MEMBER…). */
    parentCode?: string | null;
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
    /** Danh sách nhóm quyền kèm tên và thứ tự (đọc từ DB). */
    groups?: PermissionGroupItem[];
    roles: RolePermission[];
}

/** Tài khoản chọn được ở màn cấu hình quyền riêng. */
export interface UserPermissionCandidate {
    id: string;
    username: string;
    fullName: string;
    /** Giá trị số của vai trò (1 User, 2 Partner, 3 Admin). */
    role: string;
    roleName: string;
}

/** Quyền của một tài khoản: theo vai trò, phần bật thêm, phần tắt riêng và quyền hiệu lực. */
export interface UserPermissionDetail {
    userId: string;
    username: string;
    fullName: string;
    role: string;
    roleName: string;
    rolePermissionCodes: string[];
    grantedCodes: string[];
    deniedCodes: string[];
    effectiveCodes: string[];
}

/** Kết quả áp quyền cho nhiều tài khoản. */
export interface UpdateUsersPermissionsResult {
    updatedUsers: number;
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
