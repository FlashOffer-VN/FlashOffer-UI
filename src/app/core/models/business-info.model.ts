// src/app/core/models/business-info.model.ts
import { BusinessType, CompanySize } from './partner.model';

/**
 * Thông tin doanh nghiệp (normalized) — dùng cho card "Thông tin doanh nghiệp"
 * trên màn hình chi tiết admin của các entity mang dữ liệu doanh nghiệp
 * (Partner, Collaborator/CTV).
 *
 * === API CONTRACT ===
 * Backend trả về một object `businessInfo` lồng trong detail response:
 *
 * GET /api/v1/{resource}/{id}
 * {
 *   "success": true,
 *   "data": {
 *     "id": "...",
 *     "fullName": "...",
 *     "businessInfo": {
 *       "companyName": "Công ty ABC",
 *       "companyTax": "0312345678",
 *       "companyAddress": "123 Nguyễn Trãi, Q1",
 *       "companyWebsite": "https://abc.vn",
 *       "businessType": 1,
 *       "companySize": 2,
 *       "businessField": "Thương mại điện tử"
 *     }
 *   }
 * }
 *
 * Thực tế backend detail (CTV) có thể trả object lồng tên `companyInfo` và/hoặc
 * các field phẳng ở root (`companyName`, `companyTax`, `companyAddress`,
 * `companyWebsite`, `businessFieldName`). `toBusinessInfo()` nhận tất cả các
 * dạng: ưu tiên object lồng (`businessInfo` → `companyInfo`), fallback field
 * phẳng ở root.
 */
export interface BusinessInfo {
    companyName?: string;      // Partner.companyName / CTV.businessName
    companyTax?: string;       // Partner.companyTax (mã số thuế)
    companyAddress?: string;   // Partner.companyAddress / CTV.address
    companyWebsite?: string;   // Partner.companyWebsite / CTV.website
    businessType?: BusinessType;
    companySize?: CompanySize;
    businessField?: string;    // lĩnh vực kinh doanh (CTV.businessField)
}

// Nguồn dữ liệu linh hoạt (flat hoặc nested) — gộp vocabulary của Partner & CTV
export interface BusinessInfoSource {
    // Flat — vocabulary Partner
    companyName?: string;
    companyTax?: string;
    companyAddress?: string;
    companyWebsite?: string;
    businessType?: BusinessType;
    companySize?: CompanySize;
    businessField?: string;
    // Flat — vocabulary CTV (CreateCollaboratorRequest)
    businessName?: string;
    address?: string;
    website?: string;
    businessSize?: number;
    businessFieldName?: string | null;
    // Nested — backend bọc trong `businessInfo` (contract cũ) hoặc `companyInfo` (CTV)
    businessInfo?: BusinessInfoSource | null;
    companyInfo?: BusinessInfoSource | null;
}

/** Trả về giá trị đầu tiên không rỗng (`undefined` / `null` / `''` đều bị coi là thiếu). */
function firstFilled<T>(...values: (T | null | undefined)[]): T | undefined {
    for (const value of values) {
        if (value !== undefined && value !== null && (value as unknown) !== '') {
            return value;
        }
    }
    return undefined;
}

/**
 * Build một `BusinessInfo` từ nguồn linh hoạt, fallback theo TỪNG field qua 3 tầng:
 *
 *   1. `businessInfo` — object lồng theo contract cũ
 *   2. `companyInfo`  — object lồng backend CTV thực tế trả
 *   3. field phẳng ở root (`companyName`, `businessName`, `address`, ...)
 *
 * Ưu tiên từng field (không phải cả object) để trường hợp như
 * `businessInfo = { companyName }` + `companyInfo = { companyTax }` + root có
 * `companyAddress` vẫn gom đủ. Trả về `null` nếu cả 3 tầng đều không có gì.
 */
export function toBusinessInfo(src?: BusinessInfoSource | null): BusinessInfo | null {
    if (!src) return null;

    const info: BusinessInfo = {
        companyName: firstFilled(
            src.businessInfo?.companyName, src.companyInfo?.companyName,
            src.companyName, src.businessName
        ),
        companyTax: firstFilled(
            src.businessInfo?.companyTax, src.companyInfo?.companyTax,
            src.companyTax
        ),
        companyAddress: firstFilled(
            src.businessInfo?.companyAddress, src.companyInfo?.companyAddress,
            src.companyAddress, src.address
        ),
        companyWebsite: firstFilled(
            src.businessInfo?.companyWebsite, src.companyInfo?.companyWebsite,
            src.companyWebsite, src.website
        ),
        businessType: firstFilled(
            src.businessInfo?.businessType, src.companyInfo?.businessType,
            src.businessType
        ),
        companySize: firstFilled(
            src.businessInfo?.companySize, src.companyInfo?.companySize,
            src.companySize, src.businessSize as CompanySize | undefined
        ),
        businessField: firstFilled(
            src.businessInfo?.businessField, src.companyInfo?.businessField,
            src.businessField, src.businessFieldName ?? undefined
        )
    };

    const hasAny = Object.values(info).some(v => v !== undefined && v !== null && v !== '');
    return hasAny ? info : null;
}
