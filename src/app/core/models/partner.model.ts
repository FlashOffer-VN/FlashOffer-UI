// ==============================
// 1. ENUMS
// ==============================

export enum BusinessType {
    SME = 1,
    SoleProprietor = 2,
    Partnership = 3,
    Corporation = 4,
    Limited = 5,
    Other = 6
}

export enum CompanySize {
    Size1_10 = 1,
    Size11_50 = 2,
    Size51_200 = 3,
    Size200Plus = 4
}

export enum PartnerStatus {
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Active = 4
}

export enum CommissionType {
    Percentage = 1,
    Fixed = 2,
    Tiered = 3
}

export enum ProductCategory {
    Electronics = 1,
    Fashion = 2,
    Food = 3,
    Beauty = 4,
    Home = 5,
    Other = 6
}

// ==============================
// 2. API RESPONSE
// ==============================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    timestamp: string;
}

export interface PagedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    timestamp: string;
}

// ==============================
// 3. REQUEST MODELS (GỬI LÊN API)
// ==============================

export interface PartnerRegisterRequest {
    // Step 1: Personal Info
    fullName: string;
    email: string;
    phone: string;
    position: string;

    // Step 2: Business Info
    companyName: string;
    companyTax: string;
    companyAddress: string;
    businessType: BusinessType;
    companyWebsite?: string;
    companySize: CompanySize;

    // Step 3: Sales Info
    products: ProductInfoRequest[];
    commissionType: CommissionType;
    commissionRate: number;
    minOrderValue?: number;
    maxCommission?: number;
    specialConditions?: string;

    // Step 4: Additional
    referralCode?: string;
    note?: string;
    agreeTerms: boolean;
}

export interface ProductInfoRequest {
    name: string;
    description?: string;
    category: ProductCategory;
    retailPrice: number;
    wholesalePrice: number;
    minOrderQuantity: number;
    images?: string[];
    sku?: string;
}

// ==============================
// 4. RESPONSE MODELS (NHẬN TỪ API)
// ==============================

export interface PartnerRegisterResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        partnerCode: string;
        status: PartnerStatus;
        registeredAt: string;
    };
    errors: string[] | null;
    timestamp: string;
}

// ==============================
// 5. ENTITY MODELS (DÙNG TRONG UI)
// ==============================

export interface Partner {
    id: string;
    userId: string;
    partnerCode: string;
    fullName: string;
    phone: string;
    email: string;
    position: string;
    companyName: string;
    companyTax: string;
    companyAddress: string;
    businessType: BusinessType;
    companySize: CompanySize;
    companyWebsite?: string;
    referralCode?: string;
    note?: string;
    status: PartnerStatus;
    approvedAt?: string;
    createdAt: string;
    updatedAt?: string;
    user?: {
        id: string;
        username: string;
        email: string;
        fullName: string;
        phone?: string;
    };
    commission?: PartnerCommission;
    products?: PartnerProduct[];
}

export interface PartnerCommission {
    id: string;
    partnerId: string;
    type: CommissionType;
    rate: number;
    minOrderValue?: number;
    maxCommission?: number;
    specialConditions?: string;
}

export interface PartnerProduct {
    id: string;
    partnerId: string;
    name: string;
    description?: string;
    category: ProductCategory;
    retailPrice: number;
    wholesalePrice: number;
    minOrderQuantity: number;
}

// ==============================
// 6. CONSTANTS (CHO DROPDOWN)
// ==============================

export const BUSINESS_TYPES = [
    { value: BusinessType.SME, label: 'PARTNER.BUSINESS_TYPE_SME' },
    { value: BusinessType.SoleProprietor, label: 'PARTNER.BUSINESS_TYPE_SOLE_PROPRIETOR' },
    { value: BusinessType.Partnership, label: 'PARTNER.BUSINESS_TYPE_PARTNERSHIP' },
    { value: BusinessType.Corporation, label: 'PARTNER.BUSINESS_TYPE_CORPORATION' },
    { value: BusinessType.Limited, label: 'PARTNER.BUSINESS_TYPE_LIMITED' },
    { value: BusinessType.Other, label: 'PARTNER.BUSINESS_TYPE_OTHER' }
];

export const COMPANY_SIZES = [
    { value: CompanySize.Size1_10, label: 'PARTNER.COMPANY_SIZE_1_10' },
    { value: CompanySize.Size11_50, label: 'PARTNER.COMPANY_SIZE_11_50' },
    { value: CompanySize.Size51_200, label: 'PARTNER.COMPANY_SIZE_51_200' },
    { value: CompanySize.Size200Plus, label: 'PARTNER.COMPANY_SIZE_200_PLUS' }
];

export const PRODUCT_CATEGORIES = [
    { value: ProductCategory.Electronics, label: 'PARTNER.PRODUCT_CATEGORY_ELECTRONICS' },
    { value: ProductCategory.Fashion, label: 'PARTNER.PRODUCT_CATEGORY_FASHION' },
    { value: ProductCategory.Food, label: 'PARTNER.PRODUCT_CATEGORY_FOOD' },
    { value: ProductCategory.Beauty, label: 'PARTNER.PRODUCT_CATEGORY_BEAUTY' },
    { value: ProductCategory.Home, label: 'PARTNER.PRODUCT_CATEGORY_HOME' },
    { value: ProductCategory.Other, label: 'PARTNER.PRODUCT_CATEGORY_OTHER' }
];

export const COMMISSION_TYPES = [
    { value: CommissionType.Percentage, label: 'PARTNER.COMMISSION_TYPE_PERCENTAGE' },
    { value: CommissionType.Fixed, label: 'PARTNER.COMMISSION_TYPE_FIXED' },
    { value: CommissionType.Tiered, label: 'PARTNER.COMMISSION_TYPE_TIERED' }
];

// ==============================
// 7. HELPER FUNCTIONS
// ==============================

export function getBusinessTypeLabel(type: BusinessType): string {
    const labels: Record<BusinessType, string> = {
        [BusinessType.SME]: 'PARTNER.BUSINESS_TYPE_SME',
        [BusinessType.SoleProprietor]: 'PARTNER.BUSINESS_TYPE_SOLE_PROPRIETOR',
        [BusinessType.Partnership]: 'PARTNER.BUSINESS_TYPE_PARTNERSHIP',
        [BusinessType.Corporation]: 'PARTNER.BUSINESS_TYPE_CORPORATION',
        [BusinessType.Limited]: 'PARTNER.BUSINESS_TYPE_LIMITED',
        [BusinessType.Other]: 'PARTNER.BUSINESS_TYPE_OTHER'
    };
    return labels[type] || type.toString();
}

export function getCompanySizeLabel(size: CompanySize): string {
    const labels: Record<CompanySize, string> = {
        [CompanySize.Size1_10]: 'PARTNER.COMPANY_SIZE_1_10',
        [CompanySize.Size11_50]: 'PARTNER.COMPANY_SIZE_11_50',
        [CompanySize.Size51_200]: 'PARTNER.COMPANY_SIZE_51_200',
        [CompanySize.Size200Plus]: 'PARTNER.COMPANY_SIZE_200_PLUS'
    };
    return labels[size] || size.toString();
}

export function getPartnerStatusLabel(status: PartnerStatus): string {
    const labels: Record<PartnerStatus, string> = {
        [PartnerStatus.Pending]: 'COMMON.STATUS.PENDING',
        [PartnerStatus.Approved]: 'COMMON.STATUS.APPROVED',
        [PartnerStatus.Rejected]: 'COMMON.STATUS.REJECTED',
        [PartnerStatus.Active]: 'COMMON.STATUS.ACTIVE'
    };
    return labels[status] || status.toString();
}

export function getCommissionTypeLabel(type: CommissionType): string {
    const labels: Record<CommissionType, string> = {
        [CommissionType.Percentage]: 'PARTNER.COMMISSION_TYPE_PERCENTAGE',
        [CommissionType.Fixed]: 'PARTNER.COMMISSION_TYPE_FIXED',
        [CommissionType.Tiered]: 'PARTNER.COMMISSION_TYPE_TIERED'
    };
    return labels[type] || type.toString();
}

export function getProductCategoryLabel(category: ProductCategory): string {
    const labels: Record<ProductCategory, string> = {
        [ProductCategory.Electronics]: 'PARTNER.PRODUCT_CATEGORY_ELECTRONICS',
        [ProductCategory.Fashion]: 'PARTNER.PRODUCT_CATEGORY_FASHION',
        [ProductCategory.Food]: 'PARTNER.PRODUCT_CATEGORY_FOOD',
        [ProductCategory.Beauty]: 'PARTNER.PRODUCT_CATEGORY_BEAUTY',
        [ProductCategory.Home]: 'PARTNER.PRODUCT_CATEGORY_HOME',
        [ProductCategory.Other]: 'PARTNER.PRODUCT_CATEGORY_OTHER'
    };
    return labels[category] || category.toString();
}

// Get status badge variant
export function getPartnerStatusVariant(status: PartnerStatus): string {
    const variants: Record<PartnerStatus, string> = {
        [PartnerStatus.Pending]: 'warning',
        [PartnerStatus.Approved]: 'success',
        [PartnerStatus.Rejected]: 'danger',
        [PartnerStatus.Active]: 'success'
    };
    return variants[status] || 'secondary';
}