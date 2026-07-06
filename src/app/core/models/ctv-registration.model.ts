// src/app/core/models/ctv-registration.model.ts
export interface CtvRegistrationRequest {
    fullName: string;
    phone: string;
    zalo?: string;
    email: string;
    salesChannel: number;
    experience?: string;
}

export interface CtvRegistrationResponse {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    zalo?: string;
    email: string;
    salesChannel: number;
    experience?: string;
    status: string;
    isApproved: boolean;
    approvedAt?: string;
}

export enum SalesChannel {
    SALES_CHANNEL_RETAIL = 1,
    SALES_CHANNEL_WHOLESALE = 2,
    SALES_CHANNEL_ONLINE = 3,
    SALES_CHANNEL_OFFLINE = 4,
    SALES_CHANNEL_OTHER = 5
}