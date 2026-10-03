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
    /** Vai trò: API trả dạng chữ (Admin/CTV/Customer), dữ liệu cũ có thể là số */
    role: string | number;
    isActive: boolean;
    mustChangeCredentials?: boolean;
    lastLoginAt?: string;
}
