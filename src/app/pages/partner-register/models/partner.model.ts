// core/models/partner.model.ts

// ==============================
// 1. ĐĂNG KÝ ĐỐI TÁC
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
    salesInfo?: SalesInfo;

    // Step 4: Additional
    referralCode?: string;
    note?: string;
    agreeTerms: boolean;
}

export interface PartnerRegisterResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        partnerCode: string;
        status: PartnerStatus;
        registeredAt: string;
    };
}

export enum PartnerStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ACTIVE = 'ACTIVE'
}


// ==============================
// 2. THÔNG TIN ĐỐI TÁC
// ==============================

export interface Partner {
    id: number;
    userId: number;
    partnerCode: string;
    fullName: string;
    phone: string;
    email: string;
    level: PartnerLevel;
    status: PartnerStatus;
    commissionRate: number;
    totalCommission: number;
    pendingCommission: number;
    availableCommission: number;
    referralCount: number;
    referralCode: string;
    joinedAt: string;
    droppiiAccount?: string;
    bankAccount?: BankAccount;
    salesInfo?: SalesInfo;
}

export enum PartnerLevel {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
    PLATINUM = 'PLATINUM',
    DIAMOND = 'DIAMOND'
}


// ==============================
// 3. DOANH NGHIỆP / BÁN HÀNG
// ==============================

export enum BusinessType {
    SME = 'sme',
    CTV = 'ctv',
    SUPPLIER = 'supplier',
    DISTRIBUTOR = 'distributor'
}

export enum CompanySize {
    SIZE_1_10 = '1-10',
    SIZE_11_50 = '11-50',
    SIZE_51_200 = '51-200',
    SIZE_200_PLUS = '200+'
}

export interface SalesInfo {
    products: ProductInfo[];
    commissionPolicy: CommissionPolicy;
}


// ==============================
// 4. SẢN PHẨM
// ==============================

export interface ProductInfo {
    name: string;
    description?: string;
    category: ProductCategory;
    retailPrice: number;        // Giá bán lẻ
    wholesalePrice: number;     // Giá bán sỉ (chiết khấu)
    minOrderQuantity: number;   // Số lượng đặt hàng tối thiểu
    images?: string[];
    sku?: string;
}

export enum ProductCategory {
    ELECTRONICS = 'electronics',
    FASHION = 'fashion',
    FOOD = 'food',
    BEAUTY = 'beauty',
    HOME = 'home',
    OTHER = 'other'
}


// ==============================
// 5. HOA HỒNG
// ==============================

export interface CommissionPolicy {
    type: CommissionType;
    rate: number;               // Tỷ lệ hoa hồng (%)
    tiers?: CommissionTier[];   // Bảng hoa hồng theo cấp bậc
    minOrderValue?: number;     // Giá trị đơn hàng tối thiểu
    maxCommission?: number;     // Hoa hồng tối đa
    specialConditions?: string;
}

export enum CommissionType {
    PERCENTAGE = 'percentage',   // Theo %
    FIXED = 'fixed',             // Cố định (VNĐ)
    TIERED = 'tiered'            // Theo cấp bậc
}

export interface CommissionTier {
    from: number;    // Từ (VNĐ)
    to: number;      // Đến (VNĐ)
    rate: number;    // Tỷ lệ %
    label: string;   // Nhãn hiển thị
}


// ==============================
// 6. LỊCH SỬ HOA HỒNG
// ==============================

export interface CommissionHistory {
    id: string;
    partnerId: number;
    orderId: string;
    amount: number;
    source: CommissionSource;
    status: CommissionStatus;
    description: string;
    createdAt: string;
    paidAt?: string;
}

export enum CommissionSource {
    DROPPII = 'DROPPII',
    KINDI = 'KINDI'
}

export enum CommissionStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED'
}


// ==============================
// 7. NGÂN HÀNG
// ==============================

export interface BankAccount {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch?: string;
}


// ==============================
// 8. ĐƠN HÀNG DROPPII
// ==============================

export interface DroppiiOrder {
    id: string;
    productName: string;
    productImage: string;
    price: number;
    commission: number;
    status: DroppiiOrderStatus;
    createdAt: string;
    orderCode: string;
}

export enum DroppiiOrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}


// ==============================
// 9. CONSTANTS
// ==============================

export const BUSINESS_TYPES = [
    { value: BusinessType.SME, label: 'SME - Doanh nghiệp vừa và nhỏ' },
    { value: BusinessType.CTV, label: 'CTV - Cộng tác viên' },
    { value: BusinessType.SUPPLIER, label: 'Nhà cung cấp' },
    { value: BusinessType.DISTRIBUTOR, label: 'Nhà phân phối' }
];

export const COMPANY_SIZES = [
    { value: CompanySize.SIZE_1_10, label: '1 - 10 nhân viên' },
    { value: CompanySize.SIZE_11_50, label: '11 - 50 nhân viên' },
    { value: CompanySize.SIZE_51_200, label: '51 - 200 nhân viên' },
    { value: CompanySize.SIZE_200_PLUS, label: '200+ nhân viên' }
];

export const PRODUCT_CATEGORIES = [
    { value: ProductCategory.ELECTRONICS, label: 'Điện tử' },
    { value: ProductCategory.FASHION, label: 'Thời trang' },
    { value: ProductCategory.FOOD, label: 'Thực phẩm' },
    { value: ProductCategory.BEAUTY, label: 'Làm đẹp' },
    { value: ProductCategory.HOME, label: 'Gia dụng' },
    { value: ProductCategory.OTHER, label: 'Khác' }
];

export const COMMISSION_TYPES = [
    { value: CommissionType.PERCENTAGE, label: 'Theo %' },
    { value: CommissionType.FIXED, label: 'Cố định (VNĐ)' },
    { value: CommissionType.TIERED, label: 'Theo cấp bậc' }
];

export const PARTNER_LEVEL_LABELS: Record<PartnerLevel, string> = {
    [PartnerLevel.BRONZE]: 'Đồng',
    [PartnerLevel.SILVER]: 'Bạc',
    [PartnerLevel.GOLD]: 'Vàng',
    [PartnerLevel.PLATINUM]: 'Bạch Kim',
    [PartnerLevel.DIAMOND]: 'Kim Cương'
};

export const PARTNER_LEVEL_COLORS: Record<PartnerLevel, string> = {
    [PartnerLevel.BRONZE]: '#CD7F32',
    [PartnerLevel.SILVER]: '#C0C0C0',
    [PartnerLevel.GOLD]: '#FFD700',
    [PartnerLevel.PLATINUM]: '#E5E4E2',
    [PartnerLevel.DIAMOND]: '#B9F2FF'
};

export const PARTNER_LEVEL_MIN_COMMISSION: Record<PartnerLevel, number> = {
    [PartnerLevel.BRONZE]: 0,
    [PartnerLevel.SILVER]: 1000000,
    [PartnerLevel.GOLD]: 5000000,
    [PartnerLevel.PLATINUM]: 10000000,
    [PartnerLevel.DIAMOND]: 50000000
};