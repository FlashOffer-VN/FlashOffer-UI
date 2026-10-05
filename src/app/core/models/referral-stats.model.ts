export enum ReferralEventType {
    UserReferred = 1,
    GroupBuyingRequest = 2,
    GroupBuyingJoin = 3,
    PurchaseRequest = 4,
    OfferRequest = 5,
    GroupMemberJoin = 6,
    PartnerRegister = 7
}

export enum ReferralEventStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Cancelled = 5,
    Paid = 6
}

export interface ReferralStatsQuery {
    from?: string | null;
    to?: string | null;
    search?: string | null;
    page?: number;
    pageSize?: number;
}

export interface ReferralEventQuery {
    from?: string | null;
    to?: string | null;
    eventType?: number | null;
    /** Từ khoá tìm kiếm phát sinh (mã chia sẻ, mã đối tượng…). */
    search?: string | null;
    /** Cột tìm kiếm tương ứng với `search`; bỏ trống = tìm mọi trường. */
    searchField?: string | null;
    page?: number;
    pageSize?: number;
}

export interface ReferralStatsSummary {
    totalReferrers: number;
    totalReferredUsers: number;
    totalReferredGuestUsers: number;
    totalEvents: number;
    totalCancelledEvents: number;
    totalGroupBuyingRequests: number;
    totalGroupBuyingJoins: number;
    totalPurchaseRequests: number;
    totalOfferRequests: number;
    totalGroupMemberJoins: number;
    totalPartnerRegisters: number;
    totalAmount: number;
    totalCommissionAmount: number;
}

export interface ReferralStatsItem {
    /** Mã chia sẻ ghi nhận của phát sinh — khớp tên trường API `recordReferrerCode`. */
    recordReferrerCode: string;
    referrerName: string | null;
    referredUsers: number;
    referredGuestUsers: number;
    cancelledEvents: number;
    groupBuyingRequests: number;
    groupBuyingJoins: number;
    purchaseRequests: number;
    offerRequests: number;
    groupMemberJoins: number;
    partnerRegisters: number;
    totalEvents: number;
    totalAmount: number;
    totalCommissionAmount: number;
    lastEventAt: string | null;
}

export interface ReferralStatsTimelineItem {
    date: string;
    count: number;
}

export interface ReferralStatsOverview {
    from: string;
    to: string;
    summary: ReferralStatsSummary;
    timeline: ReferralStatsTimelineItem[];
}

export interface ReferralEventItem {
    id: string;
    referralEventCode: string | null;
    /** Mã chia sẻ ghi nhận của phát sinh — khớp tên trường API `recordReferrerCode`. */
    recordReferrerCode: string;
    referrerName: string | null;
    referredUserId: string;
    referredUserName: string | null;
    eventType: ReferralEventType;
    refEntityId: string | null;
    refEntityCode: string | null;
    amount: number | null;
    commissionAmount: number | null;
    status: ReferralEventStatus;
    isGuestAccount: boolean;
    createdAt: string;
}
