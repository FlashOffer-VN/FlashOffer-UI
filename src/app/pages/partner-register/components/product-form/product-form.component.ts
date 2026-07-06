// product-form/product-form.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from '@shared/components/select/select.component';
import { InputComponent } from '@shared/components/input/input.component';
import { PRODUCT_CATEGORIES } from '@core/models/partner.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent {
  @Input() productForm!: FormGroup;
  @Input() index = 0;
  @Input() canRemove = false;
  @Output() onRemove = new EventEmitter<number>();

  categories = PRODUCT_CATEGORIES;

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'Trường này là bắt buộc';
    if (errors['min']) return `Giá trị tối thiểu là ${errors['min'].min}`;
    if (errors['max']) return `Giá trị tối đa là ${errors['max'].max}`;
    return 'Dữ liệu không hợp lệ';
  }
}