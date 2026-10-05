import { MyMembership } from './membership.model';

/** Loại chi trả hoa hồng. */
export enum PayoutType {
    /** Chi trả theo kỳ chốt sổ tháng. */
    Monthly = 1,
    /** Rút sớm trước kỳ chốt sổ. */
    Early = 2
}

/** Trạng thái một lần chi trả. */
export enum PayoutStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Paid = 4,
    Cancelled = 5
}

/** Trạng thái kỳ giải ngân. */
export enum PayoutPeriodStatus {
    Open = 1,
    Closed = 2,
    Paid = 3
}

/** Một kỳ giải ngân theo tháng. */
export interface PayoutPeriod {
    id: string;
    year: number;
    month: number;
    periodLabel: string;
    fromDate: string;
    toDate: string;
    status: PayoutPeriodStatus;
    closedAt?: string | null;
    paidAt?: string | null;
    payoutDate?: string | null;
    note?: string | null;
    payoutCount: number;
    totalNetAmount: number;
}

/** Một lần chi trả hoa hồng của tài khoản. */
export interface PayoutStatement {
    id: string;
    /** Tài khoản nhận hoa hồng (màn quản trị cần để đối chiếu). */
    userId?: string;
    username?: string | null;
    fullName?: string | null;
    /** Mã tài khoản (USR-…) */
    userCode?: string | null;
    type: PayoutType;
    /** Hoa hồng ghi nhận trong kỳ (hoặc số tiền yêu cầu khi rút sớm). */
    accruedAmount: number;
    /** Phí rút sớm áp dụng (%). */
    feeRate: number;
    feeAmount: number;
    /** Số tiền thực nhận. */
    netAmount: number;
    status: PayoutStatus;
    bankName?: string | null;
    bankBranch?: string | null;
    bankAccountNumber?: string | null;
    bankAccountHolder?: string | null;
    requestedAt?: string | null;
    processedAt?: string | null;
    processedBy?: string | null;
    note?: string | null;
    periodLabel: string;
    createdAt: string;
}

/** Ví hoa hồng của tài khoản đang đăng nhập. */
export interface MyWallet {
    /** Hoa hồng đã đối soát, chưa nằm trong kỳ chi trả nào — có thể rút sớm. */
    availableAmount: number;
    /** Hoa hồng đang chờ duyệt chi trả. */
    pendingAmount: number;
    /** Tổng hoa hồng đã chi trả. */
    paidAmount: number;
    /** Đã rút sớm trong tháng này. */
    withdrawnThisMonth: number;
    monthlyLimit?: number | null;
    remainingLimit?: number | null;
    /** Phí rút sớm đang áp (%). */
    earlyWithdrawalFeeRate: number;
    minEarlyWithdrawalFee?: number | null;
    maxEarlyWithdrawalFee?: number | null;
    minWithdrawalAmount: number;
    isEarlyWithdrawalEnabled: boolean;
    hasBankAccount: boolean;
    bankAccountVerified: boolean;
    membership: MyMembership;
    currentPeriod?: PayoutPeriod | null;
    recentPayouts: PayoutStatement[];
}

/** Thông tin ngân hàng nhận giải ngân của tài khoản. */
export interface SaveBankAccountRequest {
    bankName: string;
    branch?: string | null;
    accountNumber: string;
    accountHolder: string;
}

export interface PayoutQuery {
    pageNumber?: number;
    pageSize?: number;
    type?: PayoutType | null;
    status?: PayoutStatus | null;
    userId?: string | null;
    payoutPeriodId?: string | null;
    search?: string | null;
}

export interface BankAccount {
    id: string;
    /** Tài khoản sở hữu (màn xác thực cần để đối chiếu và gọi API). */
    userId?: string;
    username?: string | null;
    fullName?: string | null;
    /** Mã tài khoản (USR-…) */
    userCode?: string | null;
    bankName: string;
    branch?: string | null;
    accountNumber: string;
    accountHolder: string;
    isVerified: boolean;
    verifiedAt?: string | null;
    verifiedBy?: string | null;
    note?: string | null;
    /** Mã đối chiếu chuyển khoản để xác thực tài khoản. */
    verificationCode?: string | null;
    verificationCodeIssuedAt?: string | null;
    updatedAt: string;
}

/** Mã đối chiếu chuyển khoản để xác thực tài khoản ngân hàng. */
export interface BankAccountVerificationCode {
    verificationCode: string;
    /** Nội dung ghi khi chuyển khoản (chính là mã đối chiếu). */
    transferContent: string;
    /** Số tiền gợi ý chuyển khoản để xác thực. */
    amount: number;
    issuedAt?: string | null;
    expiresAt?: string | null;
}

/** Điều kiện lọc danh sách tài khoản ngân hàng chờ xác thực. */
export interface BankAccountQuery {
    pageNumber?: number;
    pageSize?: number;
    search?: string | null;
    isVerified?: boolean | null;
}

/** Ghi nhận xác thực thông tin ngân hàng của một tài khoản. */
export interface VerifyBankAccountRequest {
    isVerified: boolean;
    note?: string | null;
}

/** Nhãn trạng thái chi trả (khoá i18n). */
export function getPayoutStatusLabel(status: PayoutStatus): string {
    const labels: Record<PayoutStatus, string> = {
        [PayoutStatus.Pending]: 'USER.COMMISSION.STATUS_PENDING',
        [PayoutStatus.Approved]: 'USER.COMMISSION.STATUS_APPROVED',
        [PayoutStatus.Rejected]: 'USER.COMMISSION.STATUS_REJECTED',
        [PayoutStatus.Paid]: 'USER.COMMISSION.STATUS_PAID',
        [PayoutStatus.Cancelled]: 'USER.COMMISSION.STATUS_CANCELLED'
    };
    return labels[status] ?? '';
}

/** Nhãn loại chi trả (khoá i18n). */
export function getPayoutTypeLabel(type: PayoutType): string {
    const labels: Record<PayoutType, string> = {
        [PayoutType.Monthly]: 'USER.COMMISSION.TYPE_MONTHLY',
        [PayoutType.Early]: 'USER.COMMISSION.TYPE_EARLY'
    };
    return labels[type] ?? '';
}
