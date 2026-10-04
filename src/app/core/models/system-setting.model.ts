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
    tiktokUrl?: string | null;
    instagramUrl?: string | null;
    xUrl?: string | null;
    threadsUrl?: string | null;
    linkedinUrl?: string | null;
    copyrightText?: string | null;
    privacyPolicy?: string | null;
    termsOfService?: string | null;

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
    /** Tỷ lệ thuế doanh thu (%) áp cho mọi bản khai. */
    revenueTaxPercent: number;
    /** Số doanh thu nhập vào đã gồm thuế hay chưa. */
    revenueTaxIncluded: boolean;

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
    tiktokUrl?: string | null;
    instagramUrl?: string | null;
    xUrl?: string | null;
    threadsUrl?: string | null;
    linkedinUrl?: string | null;
    copyrightText?: string | null;
    privacyPolicy?: string | null;
    termsOfService?: string | null;
    defaultLanguage: string;
    timeZone: string;
    currencySymbol: string;
    dateFormat: string;
    allowRegistration: boolean;
}

/** Dữ liệu gửi lên khi lưu cài đặt chung. */
export type SaveSystemSettingRequest = Omit<SystemSetting, 'updatedAt' | 'updatedBy'>;
