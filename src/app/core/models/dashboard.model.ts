// src/app/core/models/dashboard.model.ts
import { ApiResponse } from './auth.model';

export interface DashboardStats {
    totalPurchaseRequests: number;
    pendingPurchaseRequests: number;
    totalGroupBuyingRequests: number;
    pendingGroupBuyingRequests: number;
    totalOfferRequests: number;
    pendingOfferRequests: number;
    totalCTVRegistrations: number;
    pendingCTVRegistrations: number;
    recentActivities: RecentActivity[];
}

export interface RecentActivity {
    type: RecentActivityType;
    action: RecentActivityAction;
    userName: string;
    timestamp: string;
}

export enum RecentActivityType {
    OFFER_REQUEST = 'offer_request',
    PURCHASE_REQUEST = 'purchase_request',
    GROUP_BUYING_REQUEST = 'group_buying_request',
    CTV_REGISTRATION = 'ctv_registration'
}

export enum RecentActivityAction {
    CREATED = 'created',
    REGISTERED = 'registered',
    UPDATED = 'updated'
}

export interface DashboardResponse extends ApiResponse<DashboardStats> { }