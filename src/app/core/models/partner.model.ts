// core/models/partner.model.ts

// ==============================
// 0. API RESPONSE
// ==============================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    timestamp: string;
}

// ==============================
// 1. ĐĂNG KÝ ĐỐI TÁC - REQUEST (GỬI LÊN API)
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
    businessType: number;        
    companyWebsite?: string;
    companySize: number;         

    // Step 3: Sales Info (flat, không gộp vào salesInfo)
    products: ProductInfoRequest[];
    commissionType: number;      
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
    category: number;           
    retailPrice: number;
    wholesalePrice: number;
    minOrderQuantity: number;
    images?: string[];
    sku?: string;
}

// ==============================
// 2. ĐĂNG KÝ ĐỐI TÁC - RESPONSE
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

export enum PartnerStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3,
    ACTIVE = 4
}

// ==============================
// 3. ENUMS (CHUYỂN SANG NUMBER)
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

export enum ProductCategory {
    Electronics = 1,
    Fashion = 2,
    Food = 3,
    Beauty = 4,
    Home = 5,
    Other = 6
}

export enum CommissionType {
    Percentage = 1,
    Fixed = 2,
    Tiered = 3
}

// ==============================
// 4. CONSTANTS (CẬP NHẬT THEO NUMBER)
// ==============================

export const BUSINESS_TYPES = [
    { value: BusinessType.SME, label: 'SME - Doanh nghiệp vừa và nhỏ' },
    { value: BusinessType.SoleProprietor, label: 'Hộ kinh doanh cá thể' },
    { value: BusinessType.Partnership, label: 'Công ty hợp danh' },
    { value: BusinessType.Corporation, label: 'Công ty cổ phần' },
    { value: BusinessType.Limited, label: 'Công ty TNHH' },
    { value: BusinessType.Other, label: 'Khác' }
];

export const COMPANY_SIZES = [
    { value: CompanySize.Size1_10, label: '1 - 10 nhân viên' },
    { value: CompanySize.Size11_50, label: '11 - 50 nhân viên' },
    { value: CompanySize.Size51_200, label: '51 - 200 nhân viên' },
    { value: CompanySize.Size200Plus, label: '200+ nhân viên' }
];

export const PRODUCT_CATEGORIES = [
    { value: ProductCategory.Electronics, label: 'Điện tử' },
    { value: ProductCategory.Fashion, label: 'Thời trang' },
    { value: ProductCategory.Food, label: 'Thực phẩm' },
    { value: ProductCategory.Beauty, label: 'Làm đẹp' },
    { value: ProductCategory.Home, label: 'Gia dụng' },
    { value: ProductCategory.Other, label: 'Khác' }
];

export const COMMISSION_TYPES = [
    { value: CommissionType.Percentage, label: 'Theo %' },
    { value: CommissionType.Fixed, label: 'Cố định (VNĐ)' },
    { value: CommissionType.Tiered, label: 'Theo cấp bậc' }
];