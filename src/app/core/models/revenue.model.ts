// core/models/revenue.model.ts

/** Bên nhận hoa hồng của một bản khai doanh thu. */
export enum CommissionBeneficiary {
    /** Người giới thiệu — tài khoản sở hữu mã chia sẻ. */
    Referrer = 1,
    /** Đối tác của đơn. */
    Partner = 2
}

/** Loại giao dịch được khai doanh thu. */
export enum RevenueTransactionType {
    /** Yêu cầu mua hàng gửi cho đối tác. */
    PurchaseRequest = 1,
    /** Yêu cầu mua chung. */
    GroupBuyingRequest = 2
}

/** Trạng thái một bản khai doanh thu. */
export enum RevenueRecordStatus {
    /** Đang nhập, còn sửa được và chưa ghi vào sổ hoa hồng. */
    Draft = 1,
    /** Đã chốt, số liệu được khoá. */
    Confirmed = 2
}

/** Một bên nhận hoa hồng kèm số tiền đã chia. */
export interface TransactionCommission {
    beneficiary: CommissionBeneficiary;
    userId?: string | null;
    ratePercent: number;
    amount: number;
}

/** Bản khai doanh thu của một giao dịch, kèm số đã bóc tách. */
export interface TransactionRevenue {
    id: string;
    type: RevenueTransactionType;
    referenceId: string;
    referenceCode: string;
    grossRevenue: number;
    taxIncluded: boolean;
    taxPercent: number;
    taxAmount: number;
    netRevenue: number;
    commissions: TransactionCommission[];
    totalCommission: number;
    extraCost: number;
    extraCostNote?: string | null;
    actualRevenue: number;
    status: RevenueRecordStatus;
    confirmedBy?: string | null;
    confirmedAt?: string | null;
    createdAt: string;
    updatedAt?: string | null;
}

/** Một bên nhận hoa hồng khi lưu bản khai. */
export interface TransactionCommissionRequest {
    beneficiary: CommissionBeneficiary;
    userId?: string | null;
    ratePercent: number;
}

/** Số liệu gửi lên khi lưu bản khai doanh thu của một giao dịch. */
export interface SaveTransactionRevenueRequest {
    type: RevenueTransactionType;
    referenceId: string;
    referenceCode: string;
    grossRevenue: number;
    taxIncluded?: boolean;
    taxPercent?: number;
    extraCost: number;
    extraCostNote?: string | null;
    commissions: TransactionCommissionRequest[];
}

/** Lọc danh sách bản khai doanh thu. */
export interface RevenueQuery {
    keyword?: string;
    type?: RevenueTransactionType | null;
    status?: RevenueRecordStatus | null;
    page?: number;
    pageSize?: number;
}

/** Khoảng thời gian và cách gộp nhóm cho thống kê doanh thu. */
export interface RevenueStatsQuery {
    from?: string;
    to?: string;
    groupBy?: 'day' | 'week' | 'month' | 'year';
}

/** Một mốc trong thống kê doanh thu. */
export interface RevenueStatsPoint {
    period: string;
    grossRevenue: number;
    taxAmount: number;
    totalCommission: number;
    extraCost: number;
    actualRevenue: number;
}

/** Thống kê doanh thu trong một khoảng thời gian, chỉ tính bản khai đã chốt. */
export interface RevenueStats {
    from: string;
    to: string;
    confirmedCount: number;
    draftCount: number;
    grossRevenue: number;
    taxAmount: number;
    netRevenue: number;
    totalCommission: number;
    extraCost: number;
    actualRevenue: number;
    points: RevenueStatsPoint[];
}
