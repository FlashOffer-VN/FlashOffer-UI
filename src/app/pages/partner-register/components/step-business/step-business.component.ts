// step-business/step-business.component.ts

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { COMPANY_SIZES } from '@core/models/partner.model';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { ProvinceSelectComponent } from '@shared/components/province-select/province-select.component';
import { AppService } from '@core/services/app.service';

@Component({
  selector: 'app-step-business',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    InputComponent,
    NgSelectWrapperComponent,
    ProvinceSelectComponent
  ],
  templateUrl: './step-business.component.html',
  styleUrls: ['./step-business.component.css']
})
export class StepBusinessComponent implements OnInit {
  @Input() formGroup!: FormGroup;
  /** Danh sách lĩnh vực hoạt động — lấy từ API (BusinessField). */
  @Input() businessFields: { value: string; label: string }[] = [];
  @Output() addProductEvent = new EventEmitter<void>();
  @Output() removeProductEvent = new EventEmitter<number>();

  companySizes: any[] = [];

  constructor(private _appService: AppService) { }

  ngOnInit(): void {
    this.companySizes = COMPANY_SIZES.map(e => ({
      ...e,
      label: this._appService.trans(e.label)
    }));
  }

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

  isProductInvalid(group: any, fieldName: string): boolean {
    const control = group?.get(fieldName);
    return !!(control?.invalid && (control?.touched || control?.dirty));
  }

  getProductErrorMessage(group: any, fieldName: string): string {
    const control = group?.get(fieldName);
    if (!control || !control.errors) return '';
    const errors = control.errors;
    if (errors['required']) {
      return this._appService.trans('VALIDATION.REQUIRED');
    }
    if (errors['minlength']) {
      return this._appService.trans('VALIDATION.MIN_LENGTH', {
        length: errors['minlength'].requiredLength
      });
    }
    return this._appService.trans('VALIDATION.INVALID');
  }

  getErrorMessage(fieldName: string): string {
    const control = this.formGroup.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    // ✅ Dùng AppService để dịch
    if (errors['required']) {
      return this._appService.trans('VALIDATION.REQUIRED');
    }
    if (errors['email']) {
      return this._appService.trans('VALIDATION.EMAIL');
    }
    if (errors['minlength']) {
      return this._appService.trans('VALIDATION.MIN_LENGTH', {
        length: errors['minlength'].requiredLength
      });
    }
    if (errors['maxlength']) {
      return this._appService.trans('VALIDATION.MAX_LENGTH', {
        length: errors['maxlength'].requiredLength
      });
    }
    if (errors['pattern']) {
      return this._appService.trans('VALIDATION.PATTERN');
    }
    if (errors['min']) {
      return this._appService.trans('VALIDATION.MIN', { min: errors['min'].min });
    }
    if (errors['max']) {
      return this._appService.trans('VALIDATION.MAX', { max: errors['max'].max });
    }

    return this._appService.trans('VALIDATION.INVALID');
  }
}