// step-business/step-business.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { BUSINESS_TYPES, COMPANY_SIZES } from '@core/models/partner.model';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { AppService } from '@core/services/app.service';

@Component({
  selector: 'app-step-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    NgSelectWrapperComponent
  ],
  templateUrl: './step-business.component.html',
  styleUrls: ['./step-business.component.css']
})
export class StepBusinessComponent {
  @Input() formGroup!: FormGroup;
  @Input() isReferralValid = false;

  businessTypes = BUSINESS_TYPES;
  companySizes = COMPANY_SIZES;

  constructor(private _appService: AppService) { }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    // ✅ Dùng AppService để dịch
    if (errors['required']) {
      return this._appService.instant('VALIDATION.REQUIRED');
    }
    if (errors['email']) {
      return this._appService.instant('VALIDATION.EMAIL');
    }
    if (errors['minlength']) {
      return this._appService.instant('VALIDATION.MIN_LENGTH', {
        length: errors['minlength'].requiredLength
      });
    }
    if (errors['maxlength']) {
      return this._appService.instant('VALIDATION.MAX_LENGTH', {
        length: errors['maxlength'].requiredLength
      });
    }
    if (errors['pattern']) {
      // Pattern specific messages
      if (fieldName === 'companyTax') {
        return this._appService.instant('VALIDATION.PATTERN_TAX');
      }
      if (fieldName === 'companyWebsite') {
        return this._appService.instant('VALIDATION.PATTERN_WEBSITE');
      }
      return this._appService.instant('VALIDATION.PATTERN');
    }
    if (errors['min']) {
      return this._appService.instant('VALIDATION.MIN', { min: errors['min'].min });
    }
    if (errors['max']) {
      return this._appService.instant('VALIDATION.MAX', { max: errors['max'].max });
    }

    return this._appService.instant('VALIDATION.INVALID');
  }
}