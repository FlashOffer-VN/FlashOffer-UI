// components/partner-summary/partner-summary.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { BUSINESS_TYPES, COMPANY_SIZES } from '../../models/partner.model';

@Component({
    selector: 'app-partner-summary',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: 'partner-summary.component.html',
    styles: [`
    .summary-box {
      background: #f8fafc;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .summary-box h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #1F2937;
      margin-bottom: 1rem;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .summary-item:last-child {
      border-bottom: none;
    }

    .summary-item.full-width {
      grid-column: 1 / -1;
    }

    .summary-label {
      font-size: 0.75rem;
      color: #6B7280;
      font-weight: 500;
    }

    .summary-value {
      font-size: 0.875rem;
      color: #1F2937;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PartnerSummaryComponent {
    @Input() formData: any = {};

    getBusinessTypeLabel(value: string): string {
        const found = BUSINESS_TYPES.find(t => t.value === value);
        return found ? found.label : '---';
    }

    getCompanySizeLabel(value: string): string {
        const found = COMPANY_SIZES.find(t => t.value === value);
        return found ? found.label : '---';
    }
}