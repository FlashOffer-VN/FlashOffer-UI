// step-confirmation/step-confirmation.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { PartnerSummaryComponent } from '../partner-summary/partner-summary.component';

@Component({
  selector: 'app-step-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    PartnerSummaryComponent
  ],
  templateUrl: './step-confirmation.component.html',
  styleUrls: ['./step-confirmation.component.css']
})
export class StepConfirmationComponent {
  @Input() formGroup!: FormGroup;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'Trường này là bắt buộc';
    if (errors['requiredTrue']) return 'Bạn phải đồng ý với điều khoản';
    return 'Dữ liệu không hợp lệ';
  }
}