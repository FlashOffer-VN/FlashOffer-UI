// Enums từ C# chuyển sang TypeScript
export enum SalesChannel {
    Retail = 1,
    Wholesale = 2,
    Online = 3,
    Offline = 4,
    Other = 5
}

export enum CTVRegistrationStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3
}

export interface CtvRegistration {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    zalo?: string;
    email?: string;
    salesChannel?: SalesChannel;
    experience?: string;
    status: CTVRegistrationStatus;
    isApproved: boolean;
    approvedAt?: string;
    createdAt: string;
    updatedAt?: string;
    user?: {
        id: string;
        username: string;
        email: string;
        fullName: string;
        phone?: string;
    };
}

// Helper function để lấy tên hiển thị của SalesChannel
export function getSalesChannelLabel(channel: SalesChannel): string {
    const labels: Record<SalesChannel, string> = {
        [SalesChannel.Retail]: 'FIND_SUPPLIER.SALES_CHANNEL_RETAIL',
        [SalesChannel.Wholesale]: 'FIND_SUPPLIER.SALES_CHANNEL_WHOLESALE',
        [SalesChannel.Online]: 'FIND_SUPPLIER.SALES_CHANNEL_ONLINE',
        [SalesChannel.Offline]: 'FIND_SUPPLIER.SALES_CHANNEL_OFFLINE',
        [SalesChannel.Other]: 'FIND_SUPPLIER.SALES_CHANNEL_OTHER'
    };
    return labels[channel] || channel.toString();
}

// Helper function để lấy tên hiển thị của CTVRegistrationStatus
export function getCTVStatusLabel(status: CTVRegistrationStatus): string {
    const labels: Record<CTVRegistrationStatus, string> = {
        [CTVRegistrationStatus.Pending]: 'COMMON.STATUS.PENDING',
        [CTVRegistrationStatus.Approved]: 'COMMON.STATUS.APPROVED',
        [CTVRegistrationStatus.Rejected]: 'COMMON.STATUS.REJECTED'
    };
    return labels[status] || status.toString();
}