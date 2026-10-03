// src/app/core/models/auth.model.ts

export interface User {
    id: any;
    username: string;
    email: string;
    role: UserRole;
    fullName?: string;
    /** Tài khoản tạo tự động từ form công khai → bắt buộc đổi tên đăng nhập + mật khẩu ở lần đăng nhập đầu */
    mustChangeCredentials?: boolean;
    status?: UserStatus;
    createdAt?: string;
    updatedAt?: string;
}

/** Vai trò tài khoản — giá trị số khớp enum UserRole của API (Customer = 1, CTV = 2, Admin = 3). */
export enum UserRole {
    Customer = 1,
    CTV = 2,
    Admin = 3
}

/** Khoá i18n cho nhãn vai trò — nhận cả số 1/2/3 và chữ Admin/CTV/Customer. */
export function userRoleLabelKey(value: unknown): string {
    const role = toUserRole(value);
    if (role === UserRole.Admin) return 'USER_ROLE.ADMIN';
    if (role === UserRole.CTV) return 'USER_ROLE.CTV';
    return 'USER_ROLE.CUSTOMER';
}

/** Chuẩn hoá vai trò về enum — API trả dạng chữ (Admin/CTV/Customer), token và dữ liệu cũ dạng số. */
export function toUserRole(value: unknown): UserRole {
    const raw = String(value ?? '').trim().toUpperCase();
    if (raw === 'ADMIN' || raw === '3') return UserRole.Admin;
    if (raw === 'CTV' || raw === '2') return UserRole.CTV;
    return UserRole.Customer;
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

// ✅ AuthResponse có thể chứa data
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        id?: string;
        token: string;
        refreshToken?: string;
        expiresAt: string;
        username: string;
        fullName: string;
        role: string;
        email?: string;
        mustChangeCredentials?: boolean;
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