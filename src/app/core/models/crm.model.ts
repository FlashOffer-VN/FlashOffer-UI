// src/app/core/models/crm.model.ts
import { ApiResponse } from './auth.model';

/**
 * Thống kê CRM cho Admin.
 * Contract cho GET /api/v1/admin/crm (backend triển khai song song).
 */
export interface CrmSummary {
    totalOffers: number;                // Tổng đề nghị / offer-requests
    pendingOffers: number;
    totalPurchaseRequests: number;      // Tổng yêu cầu mua hàng
    pendingPurchaseRequests: number;
    totalGroupBuyingRequests: number;   // Tổng group-buying
    pendingGroupBuyingRequests: number;
    totalCtvRegistrations: number;      // Tổng đăng ký CTV
    pendingCtvRegistrations: number;
    totalPartners: number;              // Tổng đối tác
    pendingPartners: number;
    totalSocialPosts: number;           // Tổng bài viết social
}

export interface CrmTrendPoint {
    month: string;                      // '2026-01'
    offers: number;
    purchaseRequests: number;
    ctvRegistrations: number;
    partners: number;
    revenue: number;                    // 0 cho tới khi module doanh số ra mắt
}

export interface CrmDistributionSlice {
    entity: CrmEntityType;              // 'offer' | 'purchase' | 'ctv' | 'partner'
    status: number;                     // Giá trị enum numeric tương ứng model hiện có
    statusLabel: string;                // i18n key backend trả về (vd COMMON.STATUS.PENDING)
    count: number;
}

export interface CrmCategoryCount {
    name: string;                       // productCategory label
    count: number;
}

export interface CrmDashboardStats {
    summary: CrmSummary;
    trends: CrmTrendPoint[];            // ~12 tháng gần nhất
    distribution: CrmDistributionSlice[];
    topCategories: CrmCategoryCount[];  // top 5 theo count
}

export interface CrmDashboardResponse extends ApiResponse<CrmDashboardStats> { }

export type CrmEntityType = 'offer' | 'purchase' | 'ctv' | 'partner';