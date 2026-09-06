// components/partner-summary/partner-summary.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { COMPANY_SIZES } from '../../../../core/models/partner.model';
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

  getCompanySizeLabel(value: number): string {
    const found = COMPANY_SIZES.find((t: any) => t.value === value);
    return found ? this._appservice.trans(found.label) : '---';
  }
}