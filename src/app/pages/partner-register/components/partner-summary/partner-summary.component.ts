// components/partner-summary/partner-summary.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BUSINESS_TYPES, COMPANY_SIZES } from '../../../../core/models/partner.model';
import { AppService } from '@core/services/app.service';

@Component({
  selector: 'app-partner-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './partner-summary.component.html',
  styleUrls: ['./partner-summary.component.css']
})
export class PartnerSummaryComponent {
  @Input() formData: any = {};

  constructor(private _appservice: AppService) { }

  getBusinessTypeLabel(value: number): string {
    const found = BUSINESS_TYPES.find(t => t.value === value);
    return found ? this._appservice.instant(found.label) : '---';
  }

  getCompanySizeLabel(value: number): string {
    const found = COMPANY_SIZES.find((t: any) => t.value === value);
    return found ? this._appservice.instant(found.label) : '---';
  }
}