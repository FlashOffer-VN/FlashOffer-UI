// src/app/pages/find-supplier/find-supplier.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';

@Component({
    selector: 'app-find-supplier',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
    templateUrl: './find-supplier.component.html',
    styleUrls: ['./find-supplier.component.css']
})
export class FindSupplierComponent {
    findForm: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService
    ) {
        this.findForm = this.fb.group({
            // Product info
            productName: ['', [Validators.required, Validators.minLength(3)]],
            productCategory: [''],
            quantity: ['', [Validators.required, Validators.min(1)]],
            unit: ['', [Validators.required]],
            expectedPrice: [''],
            // User info
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)]],
            zalo: [''],
            email: ['', [Validators.required, Validators.email]],
            // Additional
            note: [''],
            agreeTerms: [false, [Validators.requiredTrue]]
        });
    }

    get f() {
        return this.findForm.controls;
    }

    get formProgress(): number {
        const controls = this.findForm.controls;
        const requiredFields = ['productName', 'quantity', 'unit', 'fullName', 'phone', 'email', 'agreeTerms'];
        let total = requiredFields.length;
        let filled = 0;

        requiredFields.forEach(key => {
            const control = controls[key];
            if (control) {
                const value = control.value;
                if (key === 'agreeTerms') {
                    if (value === true) filled++;
                } else if (value && value !== '' && value !== null) {
                    filled++;
                }
            }
        });

        return Math.round((filled / total) * 100);
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.findForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.findForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            const fieldMap: Record<string, string> = {
                productName: this._appService.instant('FIND_SUPPLIER.ERROR.PRODUCT_NAME_REQUIRED'),
                quantity: this._appService.instant('FIND_SUPPLIER.ERROR.QUANTITY_REQUIRED'),
                unit: this._appService.instant('FIND_SUPPLIER.ERROR.UNIT_REQUIRED'),
                fullName: this._appService.instant('FIND_SUPPLIER.ERROR.FULL_NAME_REQUIRED'),
                phone: this._appService.instant('FIND_SUPPLIER.ERROR.PHONE_REQUIRED'),
                email: this._appService.instant('FIND_SUPPLIER.ERROR.EMAIL_REQUIRED'),
                agreeTerms: this._appService.instant('FIND_SUPPLIER.ERROR.AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.instant('FIND_SUPPLIER.ERROR.REQUIRED');
        }

        if (control.errors['requiredTrue']) {
            return this._appService.instant('FIND_SUPPLIER.ERROR.AGREE_TERMS_REQUIRED');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'productName') {
                return this._appService.instant('FIND_SUPPLIER.ERROR.PRODUCT_NAME_MINLENGTH');
            }
            if (fieldName === 'fullName') {
                return this._appService.instant('FIND_SUPPLIER.ERROR.FULL_NAME_MINLENGTH');
            }
            return this._appService.instant('FIND_SUPPLIER.ERROR.MINLENGTH');
        }

        if (control.errors['min']) {
            if (fieldName === 'quantity') {
                return this._appService.instant('FIND_SUPPLIER.ERROR.QUANTITY_MIN');
            }
            return this._appService.instant('FIND_SUPPLIER.ERROR.MIN_VALUE');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.instant('FIND_SUPPLIER.ERROR.PHONE_INVALID');
            }
            return this._appService.instant('FIND_SUPPLIER.ERROR.INVALID');
        }

        if (control.errors['email']) {
            return this._appService.instant('FIND_SUPPLIER.ERROR.EMAIL_INVALID');
        }

        return '';
    }

    onSubmit(): void {
        if (this.findForm.invalid) {
            this.findForm.markAllAsTouched();
            this._appService.showError(this._appService.instant('FIND_SUPPLIER.ERROR.FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const formData = this.findForm.value;

        // TODO: Call API
        console.log('Form data:', formData);

        // Simulate API call
        setTimeout(() => {
            this.isSubmitting = false;
            this._appService.showSuccess(this._appService.instant('FIND_SUPPLIER.SUCCESS.SUBMIT'));
            this.findForm.reset();
            this.findForm.markAsPristine();
        }, 1500);
    }
}