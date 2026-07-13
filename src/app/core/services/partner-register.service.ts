// pages/partner-register/services/partner-register.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
    PartnerRegisterRequest,
    PartnerRegisterResponse,
    PartnerStatus
} from '../models/partner.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class PartnerRegisterService {
    private api = inject(ApiService);
    private endpoint = 'Partner';
    private translate = inject(TranslateService);

    register(data: PartnerRegisterRequest): Observable<PartnerRegisterResponse> {
        return this.api.post<PartnerRegisterResponse>(this.endpoint + '/register', data);
    }

    checkReferralCode(code: string): Observable<{ success: boolean; message: string }> {
        return this.api.get<{ success: boolean; message: string }>(this.endpoint + `/check-referral/${code}`);
    }

    getBusinessTypes(): any[] {
        return [
            { value: 1, label: this.translate.instant('PARTNER.BUSINESS_TYPE_SME') },
            { value: 2, label: this.translate.instant('PARTNER.BUSINESS_TYPE_SOLE_PROPRIETOR') },
            { value: 3, label: this.translate.instant('PARTNER.BUSINESS_TYPE_PARTNERSHIP') },
            { value: 4, label: this.translate.instant('PARTNER.BUSINESS_TYPE_CORPORATION') },
            { value: 5, label: this.translate.instant('PARTNER.BUSINESS_TYPE_LIMITED') },
            { value: 6, label: this.translate.instant('PARTNER.BUSINESS_TYPE_OTHER') }
        ];
    }

    getCompanySizes(): any[] {
        return [
            { value: 1, label: this.translate.instant('PARTNER.COMPANY_SIZE_1_10') },
            { value: 2, label: this.translate.instant('PARTNER.COMPANY_SIZE_11_50') },
            { value: 3, label: this.translate.instant('PARTNER.COMPANY_SIZE_51_200') },
            { value: 4, label: this.translate.instant('PARTNER.COMPANY_SIZE_200_PLUS') }
        ];
    }

    getProductCategories(): any[] {
        return [
            { value: 1, label: this.translate.instant('PARTNER.PRODUCT_CATEGORY_ELECTRONICS') },
            { value: 2, label: this.translate.instant('PARTNER.PRODUCT_CATEGORY_FASHION') },
            { value: 3, label: this.translate.instant('PARTNER.PRODUCT_CATEGORY_FOOD') },
            { value: 4, label: this.translate.instant('PARTNER.PRODUCT_CATEGORY_BEAUTY') },
            { value: 5, label: this.translate.instant('PARTNER.PRODUCT_CATEGORY_HOME') },
            { value: 6, label: this.translate.instant('PARTNER.PRODUCT_CATEGORY_OTHER') }
        ];
    }

    getCommissionTypes(): any[] {
        return [
            { value: 1, label: this.translate.instant('PARTNER.COMMISSION_TYPE_PERCENTAGE') },
            { value: 2, label: this.translate.instant('PARTNER.COMMISSION_TYPE_FIXED') },
            { value: 3, label: this.translate.instant('PARTNER.COMMISSION_TYPE_TIERED') }
        ];
    }
}