/** Bản ghi nhật ký thao tác dữ liệu (bảng AuditLog). */
export interface AuditLogEntry {
    id: string;
    entityName: string;
    entityId: string;
    action: string;
    actorId?: string;
    actorName?: string;
    ipAddress?: string;
    operatingSystem?: string;
    browserName?: string;
    deviceType?: string;
    timestamp: string;
    oldValues?: string;
    newValues?: string;
    changedProperties?: string;
}

/** Bản ghi nhật ký đăng nhập / xác thực (bảng AuthAuditLog). */
export interface AuthAuditLogEntry {
    id: string;
    userId?: string;
    username?: string;
    action: string;
    isSuccess: boolean;
    ipAddress?: string;
    userAgent?: string;
    operatingSystem?: string;
    browserName?: string;
    deviceType?: string;
    detail?: string;
    timestamp: string;
}

/** Tham số lọc nhật ký thao tác dữ liệu. */
export interface AuditLogQuery {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    entityName?: string;
    action?: string;
    actorId?: string;
    fromDate?: string;
    toDate?: string;
}

/** Tham số lọc nhật ký đăng nhập / xác thực. */
export interface AuthAuditLogQuery {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    username?: string;
    action?: string;
    isSuccess?: boolean;
    operatingSystem?: string;
    deviceType?: string;
    fromDate?: string;
    toDate?: string;
}
