// pages/partner-register/services/partner-register.service.ts

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
    PartnerRegisterRequest,
    PartnerRegisterResponse,
    PartnerStatus
} from '../models/partner.model';

@Injectable({
    providedIn: 'root'
})
export class PartnerRegisterService {
    constructor(private api: ApiService) { }

    register(data: PartnerRegisterRequest): Observable<PartnerRegisterResponse> {
        // ✅ Giả lập API call
        console.log('📝 Register partner with sales info:', data);

        return of({
            success: true,
            message: 'Đăng ký đối tác thành công!',
            data: {
                id: Date.now().toString(),
                partnerCode: 'KINDI-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                status: PartnerStatus.PENDING,
                registeredAt: new Date().toISOString()
            }
        }).pipe(delay(1500));
    }

    checkReferralCode(code: string): Observable<{ valid: boolean; message: string }> {
        const validCodes = ['KINDI-ABC123', 'KINDI-DEF456'];
        const isValid = validCodes.includes(code.toUpperCase());

        return of({
            valid: isValid,
            message: isValid ? 'Mã giới thiệu hợp lệ!' : 'Mã giới thiệu không tồn tại!'
        }).pipe(delay(300));
    }

    getBusinessTypes(): any[] {
        return [
            { value: 'sme', label: 'SME - Doanh nghiệp vừa và nhỏ' },
            { value: 'ctv', label: 'CTV - Cộng tác viên' },
            { value: 'supplier', label: 'Nhà cung cấp' },
            { value: 'distributor', label: 'Nhà phân phối' }
        ];
    }

    getCompanySizes(): any[] {
        return [
            { value: '1-10', label: '1 - 10 nhân viên' },
            { value: '11-50', label: '11 - 50 nhân viên' },
            { value: '51-200', label: '51 - 200 nhân viên' },
            { value: '200+', label: '200+ nhân viên' }
        ];
    }

    // ✅ Thêm: Lấy danh sách sản phẩm mẫu
    getProductCategories(): any[] {
        return [
            { value: 'electronics', label: 'Điện tử' },
            { value: 'fashion', label: 'Thời trang' },
            { value: 'food', label: 'Thực phẩm' },
            { value: 'beauty', label: 'Làm đẹp' },
            { value: 'home', label: 'Gia dụng' },
            { value: 'other', label: 'Khác' }
        ];
    }
}