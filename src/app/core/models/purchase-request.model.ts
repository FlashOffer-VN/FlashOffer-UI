/**
 * Purchase Request Model
 * Dùng cho chức năng tìm nhà cung cấp (Find Supplier)
 */

// ============ INTERFACES ============

export interface PurchaseRequest {
    id: string;
    userId: string | null;
    productName: string;
    productCategory: string | null;
    quantity: number;
    unit: string;
    expectedPrice: number | null;
    fullName: string;
    phone: string;
    zalo: string | null;
    email: string;
    note: string | null;
    status: PurchaseRequestStatus;
    createdAt: string;
}

export interface CreatePurchaseRequestDto {
    productName: string;
    productCategory?: string | null;
    quantity: number;
    unit: string;
    expectedPrice?: number | null;
    fullName: string;
    phone: string;
    zalo?: string | null;
    email: string;
    note?: string | null;
}

export interface UpdatePurchaseRequestStatusDto {
    status: PurchaseRequestStatus;
}

// ============ ENUMS ============

export enum PurchaseRequestStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3,
    COMPLETED = 4,
    CANCELLED = 5
}

// ============ CONSTANTS - DÙNG KEY DỊCH ============

export const PurchaseRequestStatusLabels: Record<PurchaseRequestStatus, string> = {
    [PurchaseRequestStatus.PENDING]: 'PURCHASE_REQUEST.STATUS.PENDING',
    [PurchaseRequestStatus.APPROVED]: 'PURCHASE_REQUEST.STATUS.APPROVED',
    [PurchaseRequestStatus.REJECTED]: 'PURCHASE_REQUEST.STATUS.REJECTED',
    [PurchaseRequestStatus.COMPLETED]: 'PURCHASE_REQUEST.STATUS.COMPLETED',
    [PurchaseRequestStatus.CANCELLED]: 'PURCHASE_REQUEST.STATUS.CANCELLED'
};

export const PurchaseRequestStatusColors: Record<PurchaseRequestStatus, string> = {
    [PurchaseRequestStatus.PENDING]: 'warning',
    [PurchaseRequestStatus.APPROVED]: 'success',
    [PurchaseRequestStatus.REJECTED]: 'danger',
    [PurchaseRequestStatus.COMPLETED]: 'info',
    [PurchaseRequestStatus.CANCELLED]: 'gray'
};

// ============ OPTIONS ============

export const UNIT_OPTIONS = [
    { value: 'kg', label: 'FIND_SUPPLIER.UNIT_KG' },
    { value: 'gram', label: 'FIND_SUPPLIER.UNIT_GRAM' },
    { value: 'ton', label: 'FIND_SUPPLIER.UNIT_TON' },
    { value: 'piece', label: 'FIND_SUPPLIER.UNIT_PIECE' },
    { value: 'box', label: 'FIND_SUPPLIER.UNIT_BOX' },
    { value: 'package', label: 'FIND_SUPPLIER.UNIT_PACKAGE' },
    { value: 'liter', label: 'FIND_SUPPLIER.UNIT_LITER' },
    { value: 'meter', label: 'FIND_SUPPLIER.UNIT_METER' },
    { value: 'set', label: 'FIND_SUPPLIER.UNIT_SET' },
    { value: 'pair', label: 'FIND_SUPPLIER.UNIT_PAIR' },
];

export const PRODUCT_CATEGORY_OPTIONS = [
    { value: 'food', label: 'FIND_SUPPLIER.CATEGORY_FOOD' },
    { value: 'electronics', label: 'FIND_SUPPLIER.CATEGORY_ELECTRONICS' },
    { value: 'furniture', label: 'FIND_SUPPLIER.CATEGORY_FURNITURE' },
    { value: 'clothing', label: 'FIND_SUPPLIER.CATEGORY_CLOTHING' },
    { value: 'machinery', label: 'FIND_SUPPLIER.CATEGORY_MACHINERY' },
    { value: 'chemicals', label: 'FIND_SUPPLIER.CATEGORY_CHEMICALS' },
    { value: 'agriculture', label: 'FIND_SUPPLIER.CATEGORY_AGRICULTURE' },
    { value: 'seafood', label: 'FIND_SUPPLIER.CATEGORY_SEAFOOD' },
    { value: 'other', label: 'FIND_SUPPLIER.CATEGORY_OTHER' },
];