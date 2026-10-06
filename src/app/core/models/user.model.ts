// src/app/core/models/user.model.ts

/**
 * Người dùng trong màn quản trị — khớp DTO UserInfoResponse của API.
 */
export interface AdminUser {
    id: string;
    userCode?: string;
    username: string;
    fullName?: string;
    /** Email tạm sinh từ SĐT ({sđt}@temp.com) được API trả về rỗng */
    email?: string;
    phone?: string;
    /** Số Zalo liên hệ (khác SĐT nếu người dùng nhập khác). */
    zalo?: string | null;
    /** Mã chia sẻ của tài khoản */
    referralCode?: string | null;
    /** Mã chia sẻ của tài khoản đã mang người này vào hệ thống (API: AccountReferrerCode) */
    accountReferrerCode?: string | null;
    /** Vai trò: API trả dạng chữ (Admin/CTV/Customer), dữ liệu cũ có thể là số */
    role: string | number;
    isActive: boolean;
    mustChangeCredentials?: boolean;
    lastLoginAt?: string;
}

/** Hồ sơ CTV liên kết với tài khoản (rút gọn — khớp UserCollaboratorSummaryDto của API). */
export interface UserCollaboratorSummary {
    id: string;
    collaboratorCode?: string;
    referralCode?: string;
    position?: string;
    businessName?: string;
    businessFieldName?: string;
    website?: string;
    address?: string;
    isApproved: boolean;
    level: number;
    approvedAt?: string;
    rejectedAt?: string;
}

/** Hồ sơ đối tác liên kết với tài khoản (rút gọn — khớp UserPartnerSummaryDto của API). */
export interface UserPartnerSummary {
    id: string;
    partnerCode: string;
    position?: string;
    companyName: string;
    companyTax?: string;
    companyAddress?: string;
    companyWebsite?: string;
    status: string;
    approvedAt?: string;
}

/** Chi tiết một tài khoản ở màn quản lý: thông tin tài khoản + hồ sơ CTV/đối tác liên kết. */
export interface AdminUserDetail {
    user: AdminUser;
    collaborator?: UserCollaboratorSummary | null;
    partner?: UserPartnerSummary | null;
}

/** Tạo tài khoản quản trị từ màn quản lý người dùng. */
export interface CreateAdminUserRequest {
    username: string;
    fullName: string;
    email: string;
    phone?: string | null;
    password: string;
}

/** Sửa thông tin tài khoản ở màn quản lý (điểm ghi tập trung). */
export interface UpdateUserInfoRequest {
    fullName: string;
    phone?: string | null;
    email?: string | null;
    zalo?: string | null;
    isActive?: boolean;
}

/** Tab tài khoản ở màn quản lý người dùng (khớp tham số scope của API). */
export type UserAccountScope = 'Customer' | 'Admin';
