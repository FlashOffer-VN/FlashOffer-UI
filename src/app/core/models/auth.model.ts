// src/app/core/models/auth.model.ts

export interface User {
    id: any;
    username: string;
    email: string;
    role: UserRole;
    fullName?: string;
    /** Mã tài khoản hiển thị cho thành viên (UserCode). */
    userCode?: string;
    phone?: string;
    zalo?: string;
    /** Thời điểm đăng nhập gần nhất. */
    lastLoginAt?: string;
    /** Tài khoản tạo tự động từ form công khai → bắt buộc đổi tên đăng nhập + mật khẩu ở lần đăng nhập đầu */
    mustChangeCredentials?: boolean;
    /** Mã quyền (P###) của tài khoản — pipe/directive quyền và menu dùng để ẩn/hiện */
    permissions?: string[];
    status?: UserStatus;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Vai trò tài khoản — giá trị số khớp enum UserRole của API:
 * User = 1 (khách hàng và cộng tác viên là một nhóm), Partner = 2 (đối tác chiến lược),
 * Admin = 3, SuperAdmin = 4 (tầng trên cùng, quản lý quyền).
 */
export enum UserRole {
    User = 1,
    Partner = 2,
    Admin = 3,
    SuperAdmin = 4
}

/** Vai trò quản trị (Admin hoặc SuperAdmin) — dùng chung cho menu, guard và điều hướng. */
export function isAdminRole(value: unknown): boolean {
    const role = toUserRole(value);
    return role === UserRole.Admin || role === UserRole.SuperAdmin;
}

/** Khoá i18n cho nhãn vai trò — nhận cả số 1/2/3/4 và chữ Admin/SuperAdmin/Partner. */
export function userRoleLabelKey(value: unknown): string {
    const role = toUserRole(value);
    if (role === UserRole.SuperAdmin) return 'USER_ROLE.SUPER_ADMIN';
    if (role === UserRole.Admin) return 'USER_ROLE.ADMIN';
    if (role === UserRole.Partner) return 'USER_ROLE.PARTNER';
    return 'USER_ROLE.USER';
}

/**
 * Chuẩn hoá vai trò về enum — API trả dạng chữ (Admin/Partner/User), token và dữ liệu cũ dạng số.
 * Giá trị 2 của dữ liệu cũ là cộng tác viên, nay gộp vào nhóm đối tác chiến lược.
 */
export function toUserRole(value: unknown): UserRole {
    const raw = String(value ?? '').trim().toUpperCase();
    if (raw === 'SUPERADMIN' || raw === 'SUPER_ADMIN' || raw === '4') return UserRole.SuperAdmin;
    if (raw === 'ADMIN' || raw === '3') return UserRole.Admin;
    if (raw === 'PARTNER' || raw === 'CTV' || raw === '2') return UserRole.Partner;
    return UserRole.User;
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BANNED = 'BANNED'
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

/** Đổi tên đăng nhập + mật khẩu (lần đăng nhập đầu hoặc ở trang người dùng) */
export interface ChangeCredentialsRequest {
    currentPassword: string;
    newUsername: string;
    newPassword: string;
    confirmNewPassword: string;
}

/** Thông tin cá nhân người dùng tự cập nhật ở khu vực thành viên. */
export interface UpdateMyProfileRequest {
    fullName?: string;
    phone?: string;
    email?: string;
    zalo?: string;
}

// ✅ AuthResponse có thể chứa data
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        id?: string;
        token: string;
        expiresAt: string;
        username: string;
        fullName: string;
        role: string;
        email?: string;
        mustChangeCredentials?: boolean;
        /** Mã quyền (P###) API trả kèm hồ sơ */
        permissions?: string[];
        /** Phiên bản quyền lúc cấp token */
        permissionsVersion?: number;
    };
    errors: string[] | null;
    timestamp: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    timestamp: string;
}