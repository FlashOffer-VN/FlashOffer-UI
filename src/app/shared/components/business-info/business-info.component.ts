// src/app/shared/components/business-info/business-info.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { BusinessInfo } from '@core/models/business-info.model';
import {
    BusinessType,
    CompanySize,
    getBusinessTypeLabel as businessTypeLabel,
    getCompanySizeLabel as companySizeLabel
} from '@core/models/partner.model';

@Component({
    selector: 'app-business-info',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './business-info.component.html',
    styleUrls: ['./business-info.component.css']
})
export class BusinessInfoComponent {
    @Input() data: BusinessInfo | null = null;
    @Input() title = '';

    getTitle(): string {
        return this.title || 'ADMIN.BUSINESS_INFO.TITLE';
    }

    getBusinessTypeLabel(type?: BusinessType): string {
        if (type === undefined || type === null) return '';
        return businessTypeLabel(type);
    }

    getCompanySizeLabel(size?: CompanySize): string {
        if (size === undefined || size === null) return '';
        return companySizeLabel(size);
    }
}
