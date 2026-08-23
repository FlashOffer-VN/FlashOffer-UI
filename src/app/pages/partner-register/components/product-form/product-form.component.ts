// product-form/product-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { PRODUCT_CATEGORIES } from '@core/models/partner.model';
import { NgSelectWrapperComponent } from "@shared/components/select/ng-select-wrapper.component";
import { AppService } from '@core/services/app.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    NgSelectWrapperComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent {
  @Input() productForm!: FormGroup;
  @Input() index = 0;
  @Input() canRemove = false;
  @Output() onRemove = new EventEmitter<number>();

  touched = false;

  categories: Signal<any[]> = computed(() =>
    PRODUCT_CATEGORIES.map(e => ({
      ...e,
      label: this._appService.trans(e.label)
    }))
  );

  constructor(
    private _appService: AppService
  ) { }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    if (!control) return false;
    // ✅ Chỉ true khi invalid và đã touched/dirty
    return !!(control.invalid && (control.touched || control.dirty));
  }

  isFieldTouched(fieldName: string): boolean {
    const control = this.productForm.get(fieldName);
    return !!(control?.touched || control?.dirty);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    if (errors['required']) {
      return this._appService.trans('VALIDATION.REQUIRED');
    }
    if (errors['min']) {
      return this._appService.trans('VALIDATION.MIN', { min: errors['min'].min });
    }
    if (errors['max']) {
      return this._appService.trans('VALIDATION.MAX', { max: errors['max'].max });
    }
    if (errors['minlength']) {
      return this._appService.trans('VALIDATION.MIN_LENGTH', { length: errors['minlength'].requiredLength });
    }
    if (errors['maxlength']) {
      return this._appService.trans('VALIDATION.MAX_LENGTH', { length: errors['maxlength'].requiredLength });
    }
    if (errors['email']) {
      return this._appService.trans('VALIDATION.EMAIL');
    }
    if (errors['pattern']) {
      return this._appService.trans('VALIDATION.PATTERN');
    }

    return this._appService.trans('VALIDATION.INVALID');
  }
}