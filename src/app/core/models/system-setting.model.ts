/** Cài đặt chung của hệ thống (màn quản trị). */
export interface SystemSetting {
    systemName: string;
    supportEmail?: string | null;
    supportPhone?: string | null;
    address?: string | null;
    workingHours?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    zaloUrl?: string | null;
    copyrightText?: string | null;

    defaultLanguage: string;
    timeZone: string;
    currencySymbol: string;
    dateFormat: string;

    allowRegistration: boolean;
    requireEmailVerification: boolean;
    minPasswordLength: number;
    accessTokenMinutes: number;
    refreshTokenDays: number;
    maxFailedLoginAttempts: number;
    lockoutMinutes: number;
    referralCodePrefix: string;
    referralCodeLength: number;
    commissionAttributionDays: number;

    maxUploadSizeMb: number;
    allowedImageExtensions?: string | null;
    allowedDocumentExtensions?: string | null;
    maxImagesPerPost: number;
    requirePostApproval: boolean;
    requireGroupApproval: boolean;
    auditLogRetentionDays: number;
    enableEmailNotification: boolean;
    notificationSenderName?: string | null;
    notificationReplyTo?: string | null;

    note?: string | null;
    updatedAt?: string | null;
    updatedBy?: string | null;
}

/** Phần cài đặt công khai cho giao diện người dùng. */
export interface PublicSystemSetting {
    systemName: string;
    supportEmail?: string | null;
    supportPhone?: string | null;
    address?: string | null;
    workingHours?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    zaloUrl?: string | null;
    copyrightText?: string | null;
    defaultLanguage: string;
    timeZone: string;
    currencySymbol: string;
    dateFormat: string;
    allowRegistration: boolean;
}

/** Dữ liệu gửi lên khi lưu cài đặt chung. */
export type SaveSystemSettingRequest = Omit<SystemSetting, 'updatedAt' | 'updatedBy'>;
