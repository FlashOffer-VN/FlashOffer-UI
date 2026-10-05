/**
 * Lĩnh vực hoạt động (BusinessField) — màn quản trị.
 * Khớp DTO BusinessFieldAdminDto / BusinessFieldRelatedDto của API.
 */
export interface BusinessFieldAdmin {
    id: string;
    businessFieldCode?: string | null;
    name: string;
    /** Chuỗi JSON các tên gọi khác, ví dụ ["CNTT","IT"]. */
    aliases?: string | null;
    isActive: boolean;
    /** Số công ty thuộc lĩnh vực. */
    companyCount: number;
    /** Số tài khoản thuộc lĩnh vực (CTV + đối tác). */
    userCount: number;
}

export interface BusinessFieldCompany {
    id: string;
    companyCode?: string | null;
    name: string;
    taxCode?: string | null;
    address?: string | null;
    collaboratorCount: number;
    partnerCount: number;
}

export interface BusinessFieldUser {
    userId: string;
    userCode?: string | null;
    fullName?: string | null;
    phone?: string | null;
    /** Collaborator hoặc Partner. */
    role: string;
    companyId?: string | null;
    companyName?: string | null;
}

export interface BusinessFieldRelated {
    id: string;
    businessFieldCode?: string | null;
    name: string;
    isActive: boolean;
    companies: BusinessFieldCompany[];
    users: BusinessFieldUser[];
}

export interface BusinessFieldFormValue {
    name: string;
    aliases?: string | null;
    isActive: boolean;
}
