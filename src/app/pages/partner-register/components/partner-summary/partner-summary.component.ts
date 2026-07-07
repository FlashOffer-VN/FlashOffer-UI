// components/partner-summary/partner-summary.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BUSINESS_TYPES, COMPANY_SIZES } from '../../../../core/models/partner.model';

@Component({
  selector: 'app-partner-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './partner-summary.component.html',
  styleUrls: ['./partner-summary.component.css']
})
export class PartnerSummaryComponent {
  @Input() formData: any = {};

  getBusinessTypeLabel(value: number): string {
    const found = BUSINESS_TYPES.find(t => t.value === value);
    return found ? found.label : '---';
  }

  getCompanySizeLabel(value: number): string {
    const found = COMPANY_SIZES.find((t: any) => t.value === value);
    return found ? found.label : '---';
  }
}