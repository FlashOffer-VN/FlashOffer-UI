// src/app/core/models/group-buying-request.model.ts
import { ApiResponse } from './auth.model';
import { PagedResponse as Paged } from './paged-response.model';

export interface GroupBuyingRequest {
    id: string;
    groupBuyingRequestCode?: string | null;
    productName: string;
    productLink: string | null;
    targetPeopleCount: number;
    currentPeopleCount: number;
    neededPeopleCount?: number;
    targetPrice: number;
    fullName: string;
    phone: string;
    zalo: string | null;
    email: string;
    note: string | null;
    status: GroupBuyingStatus;
    businessFieldId?: string | null;
    businessFieldName?: string | null;
    /** Ai mang BẢN GHI này tới — chụp lúc tạo (khớp API recordReferrerCode) */
    recordReferrerCode?: string | null;
    /** Tên chủ mã giới thiệu bản ghi (khớp API recordReferrerName) */
    recordReferrerName?: string | null;
    createdAt: string;
    approvedAt?: string | null;
    closedReason?: string | null;
    /** Ai mang TÀI KHOẢN vào app — ghi lần đầu, không ghi đè (khớp API accountReferrerCode) */
    accountReferrerCode?: string | null;
    /** Tên chủ mã giới thiệu tài khoản */
    accountReferrerName?: string | null;
    /** Bản ghi đã xoá mềm (có khi lọc danh sách "Đã xóa"). */
    isDeleted?: boolean;
    /** Thời điểm xoá mềm. */
    deletedAt?: string | null;
    /** Mã tài khoản người tạo đơn */
    userCode?: string | null;
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
    /** Mã chia sẻ riêng của người tạo — có khi người tạo mở form từ link chia sẻ */
    referralCode?: string;
}

// ===== Tab "Mua chung" trên trang social =====

/** Item trên feed mua chung (chỉ thông tin cơ bản + tiến độ số người). */
export interface GroupBuyingFeedItem {
    id: string;
    groupBuyingRequestCode: string | null;
    productName: string;
    productLink: string | null;
    targetPrice: number | null;
    targetPeopleCount: number;
    currentPeopleCount: number;
    neededPeopleCount: number;
    status: GroupBuyingStatus;
    note: string | null;
    businessFieldName: string | null;
    creatorName: string;
    createdAt: string;
    isMine: boolean;
    isJoinedByMe: boolean;
    canJoin: boolean;
    /** Tên người đã tham gia (đã rút gọn) */
    participants: string[];
}

export interface GroupBuyingParticipant {
    id: string;
    userId: string;
    userCode: string | null;
    collaboratorCode: string | null;
    fullName: string;
    phone: string;
    zalo: string | null;
    email: string | null;
    note: string | null;
    /** Ai mang BẢN GHI (người tham gia) này tới — chụp lúc tạo (khớp API recordReferrerCode) */
    recordReferrerCode?: string | null;
    /** Tên chủ mã giới thiệu bản ghi */
    recordReferrerName?: string | null;
    isCreator: boolean;
    isGuestAccount: boolean;
    status: number;
    isMe: boolean;
    createdAt: string;
    /** Ai mang TÀI KHOẢN vào app — ghi lần đầu, không ghi đè (khớp API accountReferrerCode) */
    accountReferrerCode?: string | null;
    /** Tên chủ mã giới thiệu tài khoản */
    accountReferrerName?: string | null;
}

/** Chi tiết một yêu cầu mua chung (bấm vào item trên tab Mua chung). */
export interface GroupBuyingDetail {
    id: string;
    groupBuyingRequestCode: string | null;
    productName: string;
    productLink: string | null;
    targetPrice: number | null;
    targetPeopleCount: number;
    currentPeopleCount: number;
    neededPeopleCount: number;
    status: GroupBuyingStatus;
    note: string | null;
    businessFieldId: string | null;
    businessFieldName: string | null;
    createdAt: string;
    approvedAt: string | null;
    closedReason: string | null;
    creatorName: string;
    creatorPhone: string;
    creatorZalo: string | null;
    creatorEmail: string | null;
    /** Ai mang BẢN GHI (đơn mua chung) này tới — chụp lúc tạo (khớp API recordReferrerCode) */
    recordReferrerCode?: string | null;
    /** Tên chủ mã giới thiệu bản ghi */
    recordReferrerName?: string | null;
    isMine: boolean;
    isJoinedByMe: boolean;
    canJoin: boolean;
    joinBlockedReason: string | null;
    participants: GroupBuyingParticipant[];
    /** Ai mang TÀI KHOẢN vào app — ghi lần đầu, không ghi đè (khớp API accountReferrerCode) */
    accountReferrerCode?: string | null;
    /** Tên chủ mã giới thiệu tài khoản */
    accountReferrerName?: string | null;
}

/** Khách chưa đăng nhập phải gửi họ tên + SĐT; người đã đăng nhập chỉ cần ghi chú. */
export interface JoinGroupBuyingPayload {
    fullName?: string;
    phone?: string;
    zalo?: string;
    email?: string;
    note?: string;
    /** Mã chia sẻ riêng trên link người dùng mở (?ref=) — ghi nhận cho người đã chia sẻ */
    referralCode?: string;
}

export interface JoinGroupBuyingResult {
    participantId: string;
    currentPeopleCount: number;
    targetPeopleCount: number;
    neededPeopleCount: number;
    isGroupFull: boolean;
    isNewAccount: boolean;
    username: string | null;
    passwordIsPhone: boolean;
    accountAlreadyExisted: boolean;
    message: string;
}

export interface GetPublicGroupBuyingQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    /** true = chỉ lấy nhóm do chính mình mở (mọi trạng thái, kể cả đã hoàn thành/đã hủy). */
    mineOnly?: boolean;
    /** Lọc theo trạng thái (tab trong khu vực thành viên); bỏ trống = tất cả. */
    status?: GroupBuyingStatus;
    /** Cột tìm kiếm (khớp RequestSearchField của API); bỏ trống = tìm mọi trường. */
    searchField?: string;
    /** Lọc theo ngày tạo (từ ngày) — định dạng YYYY-MM-DD. */
    fromDate?: string;
    /** Lọc theo ngày tạo (đến ngày) — định dạng YYYY-MM-DD. */
    toDate?: string;
}

export interface GetAdminGroupBuyingQuery {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField?: string;
    /** true = chỉ lấy bản ghi đã xoá mềm (tab "Đã xóa"). */
    includeDeleted?: boolean;
}

export interface UpdateGroupBuyingStatusPayload {
    status: number;
    reason?: string;
}

export interface UpdateGroupBuyingPayload {
    productName?: string;
    productLink?: string;
    targetPeopleCount?: number;
    targetPrice?: number;
    note?: string;
}

export interface GroupBuyingResponse extends ApiResponse<GroupBuyingRequest> { }
export interface GroupBuyingListResponse extends ApiResponse<GroupBuyingRequest[]> { }
export interface GroupBuyingFeedResponse extends Paged<GroupBuyingFeedItem> { }
export interface GroupBuyingDetailResponse extends ApiResponse<GroupBuyingDetail> { }
export interface JoinGroupBuyingResponse extends ApiResponse<JoinGroupBuyingResult> { }
export interface AdminGroupBuyingListResponse extends Paged<GroupBuyingRequest> { }
