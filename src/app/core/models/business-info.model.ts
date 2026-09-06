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
 * Frontend fallback: nếu backend chưa trả `businessInfo`, `toBusinessInfo()`
 * sẽ build từ các field phẳng (Partner giữ field cũ nên vẫn hiển thị).
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
    companyName?: string;
    companyTax?: string;
    companyAddress?: string;
    companyWebsite?: string;
    businessType?: BusinessType;
    companySize?: CompanySize;
    businessField?: string;
    // Vocabulary CTV (CreateCollaboratorRequest)
    businessName?: string;
    address?: string;
    website?: string;
    businessSize?: number;
}

/**
 * Build một `BusinessInfo` từ nguồn linh hoạt (flat fields hoặc nested object).
 * Trả về `null` nếu không có bất kỳ trường doanh nghiệp nào.
 */
export function toBusinessInfo(src?: BusinessInfoSource | null): BusinessInfo | null {
    if (!src) return null;

    const info: BusinessInfo = {
        companyName: src.companyName ?? src.businessName,
        companyTax: src.companyTax,
        companyAddress: src.companyAddress ?? src.address,
        companyWebsite: src.companyWebsite ?? src.website,
        businessType: src.businessType,
        companySize: src.companySize ?? (src.businessSize as CompanySize),
        businessField: src.businessField
    };

    const hasAny = Object.values(info).some(v => v !== undefined && v !== null && v !== '');
    return hasAny ? info : null;
}
