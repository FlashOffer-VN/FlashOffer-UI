import { CommissionType } from './partner.model';

/** Bên nhận hoa hồng của một cấu hình. */
export enum CommissionBeneficiary {
    /** Người giới thiệu — tài khoản sở hữu mã chia sẻ. */
    Referrer = 1,
    /** Đối tác của đơn/bài phát sinh. */
    Partner = 2
}

/** Nhãn bên nhận hoa hồng. */
export function getCommissionBeneficiaryLabel(beneficiary: CommissionBeneficiary): string {
    const labels: Record<CommissionBeneficiary, string> = {
        [CommissionBeneficiary.Referrer]: 'COMMISSION.BENEFICIARY_REFERRER',
        [CommissionBeneficiary.Partner]: 'COMMISSION.BENEFICIARY_PARTNER'
    };
    return labels[beneficiary];
}

/** Một bậc của cấu hình hoa hồng theo bậc thang. */
export interface CommissionTier {
    id?: string;
    fromValue: number;
    toValue?: number | null;
    rate: number;
}

/** Cấu hình hoa hồng: bản chung khi userId trống, ngược lại là bản riêng của một tài khoản. */
export interface CommissionConfig {
    id: string;
    beneficiary: CommissionBeneficiary;
    userId?: string | null;
    userFullName?: string | null;
    username?: string | null;
    isGlobal: boolean;
    isPersonal: boolean;
    type: CommissionType;
    rate: number;
    minOrderValue?: number | null;
    maxCommission?: number | null;
    isActive: boolean;
    note?: string | null;
    tiers: CommissionTier[];
    updatedAt: string;
}

/** Yêu cầu lưu cấu hình hoa hồng cho bản chung hoặc cho một/nhiều tài khoản được chọn. */
export interface SaveCommissionConfigRequest {
    beneficiary: CommissionBeneficiary;
    isGlobal: boolean;
    userIds: string[];
    type: CommissionType;
    rate: number;
    minOrderValue?: number | null;
    maxCommission?: number | null;
    isActive: boolean;
    note?: string | null;
    tiers: CommissionTier[];
}

/** Mức hoa hồng đang áp cho chính tài khoản đang đăng nhập. */
export interface MyCommission {
    referrer?: CommissionConfig | null;
    partner?: CommissionConfig | null;
}
