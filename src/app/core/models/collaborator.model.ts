export interface Collaborator {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    zalo?: string;
    email?: string;
    position?: string;
    skills?: string;
    interests?: string;
    goals?: string;
    salesChannel?: number;
    experience?: string;
    agreeTerms: boolean;
    parentCollaboratorId?: string;
    level: number;
    referralCode?: string;
    status: CollaboratorStatus;
    isApproved: boolean;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt?: string;
}

export enum CollaboratorStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Suspended = 4,
    Active = 5
}

export interface CreateCollaboratorRequest {
    fullName: string;
    phone: string;
    zalo?: string;
    email?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    position?: string;
    skills?: string;
    interests?: string;
    goals?: string;
    salesChannel?: number;
    experience?: string;
    agreeTerms: boolean;
    businessName?: string;
    businessField?: string;
    businessSize?: number;
    address?: string;
    website?: string;
    parentCollaboratorId?: string;
}

export interface UpdateCollaboratorRequest {
    fullName?: string;
    phone?: string;
    zalo?: string;
    email?: string;
    position?: string;
    skills?: string;
    interests?: string;
    goals?: string;
    salesChannel?: number;
    experience?: string;
}

export interface CollaboratorFilter {
    search?: string;
    status?: CollaboratorStatus;
    fromDate?: string;
    toDate?: string;
}

export const STATUS_LABEL: Record<CollaboratorStatus, string> = {
    [CollaboratorStatus.Pending]: 'Đang chờ duyệt',
    [CollaboratorStatus.Approved]: 'Đã duyệt',
    [CollaboratorStatus.Rejected]: 'Từ chối',
    [CollaboratorStatus.Suspended]: 'Tạm khóa',
    [CollaboratorStatus.Active]: 'Hoạt động'
};

export const STATUS_VARIANT: Record<CollaboratorStatus, string> = {
    [CollaboratorStatus.Pending]: 'warning',
    [CollaboratorStatus.Approved]: 'success',
    [CollaboratorStatus.Rejected]: 'danger',
    [CollaboratorStatus.Suspended]: 'secondary',
    [CollaboratorStatus.Active]: 'success'
};