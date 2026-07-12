// src/app/core/models/group-buying-request.model.ts
import { ApiResponse } from './auth.model';

export interface GroupBuyingRequest {
    id: string;
    productName: string;
    productLink: string | null;
    targetPeopleCount: number;
    currentPeopleCount: number;
    targetPrice: number;
    fullName: string;
    phone: string;
    zalo: string | null;
    email: string;
    note: string | null;
    status: GroupBuyingStatus;
    createdAt: string;
}

export enum GroupBuyingStatus {
    PENDING = 1,    // Chờ duyệt
    ACTIVE = 2,     // Đang hoạt động (đã duyệt)
    COMPLETED = 3,  // Hoàn thành
    CANCELLED = 4   // Đã hủy (bao gồm cả reject và cancel)
}

// Helper để lấy tên status hiển thị
export const GroupBuyingStatusLabel: Record<GroupBuyingStatus, string> = {
    [GroupBuyingStatus.PENDING]: 'GROUP_BUYING.STATUS.PENDING',
    [GroupBuyingStatus.ACTIVE]: 'GROUP_BUYING.STATUS.ACTIVE',
    [GroupBuyingStatus.COMPLETED]: 'GROUP_BUYING.STATUS.COMPLETED',
    [GroupBuyingStatus.CANCELLED]: 'GROUP_BUYING.STATUS.CANCELLED'
};

// Helper để lấy màu badge
export const GroupBuyingStatusColor: Record<GroupBuyingStatus, string> = {
    [GroupBuyingStatus.PENDING]: 'warning',
    [GroupBuyingStatus.ACTIVE]: 'info',
    [GroupBuyingStatus.COMPLETED]: 'success',
    [GroupBuyingStatus.CANCELLED]: 'danger'
};

export interface CreateGroupBuyingRequest {
    productName: string;
    productLink?: string;
    targetPeopleCount: number;
    targetPrice: number;
    fullName: string;
    phone: string;
    zalo?: string;
    email: string;
    note?: string;
}

export interface GroupBuyingResponse extends ApiResponse<GroupBuyingRequest> { }

export interface GroupBuyingListResponse extends ApiResponse<GroupBuyingRequest[]> { }