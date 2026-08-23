// step-sales/step-sales.component.ts

import { Component, Input, Output, EventEmitter, Signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { ProductFormComponent } from '../product-form/product-form.component';
import { COMMISSION_TYPES } from '@core/models/partner.model';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { AppService } from '@core/services/app.service';  // ✅ Thêm import

@Component({
  selector: 'app-step-sales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    ProductFormComponent,
    NgSelectWrapperComponent,
  ],
  templateUrl: './step-sales.component.html',
  styleUrls: ['./step-sales.component.css']
})
export class StepSalesComponent {
  @Input() formGroup!: FormGroup;
  @Output() addProductEvent = new EventEmitter<void>();
  @Output() removeProductEvent = new EventEmitter<number>();

  commissionTypes: Signal<any[]> = computed(() =>
    COMMISSION_TYPES.map(e =>
    ({
      ...e,
      label: this._appService.trans(e.label)
    })
    )
  );

  constructor(private _appService: AppService) { }  // ✅ Inject AppService

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

    // ✅ Thay hardcode bằng i18n
    if (errors['required']) {
      return this._appService.trans('VALIDATION.REQUIRED');
    }
    if (errors['min']) {
      return this._appService.trans('VALIDATION.MIN', {
        min: errors['min'].min
      });
    }
    if (errors['max']) {
      return this._appService.trans('VALIDATION.MAX', {
        max: errors['max'].max
      });
    }
    if (errors['minlength']) {
      return this._appService.trans('VALIDATION.MIN_LENGTH', {
        length: errors['minlength'].requiredLength
      });
    }

    return this._appService.trans('VALIDATION.INVALID');
  }
}