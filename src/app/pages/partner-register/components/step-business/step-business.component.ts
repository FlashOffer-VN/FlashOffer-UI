// step-business/step-business.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { SelectComponent } from '@shared/components/select/select.component';
import { BUSINESS_TYPES, COMPANY_SIZES } from '@core/models/partner.model';

@Component({
  selector: 'app-step-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './step-business.component.html',
  styleUrls: ['./step-business.component.css']
})
export class StepBusinessComponent {
  @Input() formGroup!: FormGroup;
  @Input() isReferralValid = false;

  businessTypes = BUSINESS_TYPES;
  companySizes = COMPANY_SIZES;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'Trường này là bắt buộc';
    if (errors['email']) return 'Email không hợp lệ';
    if (errors['minlength']) return `Tối thiểu ${errors['minlength'].requiredLength} ký tự`;
    if (errors['pattern']) {
      if (fieldName === 'companyTax') return 'Mã số thuế không hợp lệ (10-14 số)';
      if (fieldName === 'companyWebsite') return 'Website không hợp lệ (VD: https://example.com)';
      return 'Định dạng không hợp lệ';
    }
    return 'Dữ liệu không hợp lệ';
  }
}