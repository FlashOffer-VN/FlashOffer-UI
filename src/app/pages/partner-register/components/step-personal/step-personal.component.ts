// step-personal/step-personal.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InputComponent } from '../../../../shared/components/input/input.component';

@Component({
  selector: 'app-step-personal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent
  ],
  templateUrl: './step-personal.component.html',
  styleUrls: ['./step-personal.component.css']
})
export class StepPersonalComponent {
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
    if (errors['email']) return 'Email không hợp lệ';
    if (errors['minlength']) return `Tối thiểu ${errors['minlength'].requiredLength} ký tự`;
    if (errors['maxlength']) return `Tối đa ${errors['maxlength'].requiredLength} ký tự`;
    if (errors['pattern']) {
      if (fieldName === 'phone') return 'Số điện thoại không hợp lệ (VD: 0912345678)';
      return 'Định dạng không hợp lệ';
    }
    return 'Dữ liệu không hợp lệ';
  }
}