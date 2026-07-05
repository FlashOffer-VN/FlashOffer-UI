// step-sales/step-sales.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { SelectComponent } from '../../../../shared/components/select/select.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { COMMISSION_TYPES } from '../../../../core/models/partner.model';

@Component({
  selector: 'app-step-sales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    SelectComponent,
    ProductFormComponent
  ],
  templateUrl: './step-sales.component.html',
  styleUrls: ['./step-sales.component.css']
})
export class StepSalesComponent {
  @Input() formGroup!: FormGroup;
  @Output() addProductEvent = new EventEmitter<void>();
  @Output() removeProductEvent = new EventEmitter<number>();

  commissionTypes = COMMISSION_TYPES;

  get products(): FormArray {
    return this.formGroup.get('products') as FormArray;
  }

  addProduct(): void {
    this.addProductEvent.emit();
  }

  removeProduct(index: number): void {
    this.removeProductEvent.emit(index);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'Trường này là bắt buộc';
    if (errors['min']) return `Giá trị tối thiểu là ${errors['min'].min}`;
    if (errors['max']) return `Giá trị tối đa là ${errors['max'].max}`;
    return 'Dữ liệu không hợp lệ';
  }
}