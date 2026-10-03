// src/app/core/models/membership.model.ts

/** Một hạng thành viên và quyền lợi kèm theo. */
export interface MembershipTier {
    id: string;
    /** Thứ tự hạng — số lớn là hạng cao hơn. */
    level: number;
    name: string;
    /** Doanh số/hoa hồng tích luỹ tối thiểu để đạt hạng. */
    minAccumulatedValue: number;
    /** Phí rút sớm riêng của hạng (%); trống là dùng mức chung. */
    earlyWithdrawalFeeRate?: number | null;
    /** Hạn mức rút sớm trong một tháng; trống là không giới hạn riêng. */
    monthlyWithdrawalLimit?: number | null;
    /** Thứ tự ưu tiên duyệt — số nhỏ được duyệt trước. */
    approvalPriority: number;
    isActive: boolean;
    description?: string | null;
}

/** Hạng hiện tại của tài khoản kèm tiến độ tới hạng kế tiếp. */
export interface MyMembership {
    tier?: MembershipTier | null;
    /** Doanh số/hoa hồng tích luỹ dùng để xét hạng. */
    accumulatedValue: number;
    /** Doanh số cần thêm để lên hạng kế tiếp; trống khi đã ở hạng cao nhất. */
    nextTierRequirement?: number | null;
    nextTier?: MembershipTier | null;
    evaluatedAt?: string | null;
    /** Phí rút sớm đang áp cho tài khoản (%). */
    effectiveEarlyWithdrawalFeeRate: number;
    /** Toàn bộ hạng đang áp dụng, xếp từ thấp tới cao. */
    tiers: MembershipTier[];
}
