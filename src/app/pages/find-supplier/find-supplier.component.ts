import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import {
    UNIT_OPTIONS,
    PRODUCT_CATEGORY_OPTIONS,
    CreatePurchaseRequestDto
} from '@core/models/purchase-request.model';

@Component({
    selector: 'app-find-supplier',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        RouterLink
    ],
    templateUrl: './find-supplier.component.html',
    styleUrls: ['./find-supplier.component.css']
})
export class FindSupplierComponent implements OnInit {
    findForm: FormGroup;
    isSubmitting = false;
    submitted = false;

    // Options from model
    unitOptions = UNIT_OPTIONS;
    productCategoryOptions = PRODUCT_CATEGORY_OPTIONS;

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

    ngOnInit(): void {
        // Set default unit
        // this.findForm.patchValue({ unit: 'kg' });
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
        return !!(control && control.invalid && (control.dirty || control.touched || this.submitted));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.findForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            const fieldMap: Record<string, string> = {
                productName: this._appService.trans('FIND_SUPPLIER.ERROR.PRODUCT_NAME_REQUIRED'),
                quantity: this._appService.trans('FIND_SUPPLIER.ERROR.QUANTITY_REQUIRED'),
                unit: this._appService.trans('FIND_SUPPLIER.ERROR.UNIT_REQUIRED'),
                fullName: this._appService.trans('FIND_SUPPLIER.ERROR.FULL_NAME_REQUIRED'),
                phone: this._appService.trans('FIND_SUPPLIER.ERROR.PHONE_REQUIRED'),
                email: this._appService.trans('FIND_SUPPLIER.ERROR.EMAIL_REQUIRED'),
                agreeTerms: this._appService.trans('FIND_SUPPLIER.ERROR.AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.trans('FIND_SUPPLIER.ERROR.REQUIRED');
        }

        if (control.errors['requiredTrue']) {
            return this._appService.trans('FIND_SUPPLIER.ERROR.AGREE_TERMS_REQUIRED');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'productName') {
                return this._appService.trans('FIND_SUPPLIER.ERROR.PRODUCT_NAME_MINLENGTH');
            }
            if (fieldName === 'fullName') {
                return this._appService.trans('FIND_SUPPLIER.ERROR.FULL_NAME_MINLENGTH');
            }
            return this._appService.trans('FIND_SUPPLIER.ERROR.MINLENGTH');
        }

        if (control.errors['min']) {
            if (fieldName === 'quantity') {
                return this._appService.trans('FIND_SUPPLIER.ERROR.QUANTITY_MIN');
            }
            return this._appService.trans('FIND_SUPPLIER.ERROR.MIN_VALUE');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.trans('FIND_SUPPLIER.ERROR.PHONE_INVALID');
            }
            return this._appService.trans('FIND_SUPPLIER.ERROR.INVALID');
        }

        if (control.errors['email']) {
            return this._appService.trans('FIND_SUPPLIER.ERROR.EMAIL_INVALID');
        }

        return '';
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.findForm.invalid) {
            // Mark all fields as touched to show errors
            Object.keys(this.findForm.controls).forEach(key => {
                const control = this.findForm.get(key);
                control?.markAsTouched();
            });

            this._appService.showError(this._appService.trans('FIND_SUPPLIER.ERROR.FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const formValue = this.findForm.value;

        // Prepare data for API
        const requestData: CreatePurchaseRequestDto = {
            productName: formValue.productName.trim(),
            productCategory: formValue.productCategory || null,
            quantity: Number(formValue.quantity),
            unit: formValue.unit,
            expectedPrice: formValue.expectedPrice ? Number(formValue.expectedPrice) : null,
            fullName: formValue.fullName.trim(),
            phone: formValue.phone.trim(),
            zalo: formValue.zalo?.trim() || null,
            email: formValue.email.trim().toLowerCase(),
            note: formValue.note?.trim() || null
        };

        // Call API
        this._appService.purchaseRequest.create(requestData).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                if (response.success) {
                    this._appService.showSuccess(
                        this._appService.trans('FIND_SUPPLIER.SUCCESS.SUBMIT')
                    );
                    this.findForm.reset();
                    this.findForm.markAsPristine();
                    this.submitted = false;
                    // Reset default unit
                    this.findForm.patchValue({ unit: 'kg' });
                } else {
                    const errorMsg = response.message || this._appService.trans('FIND_SUPPLIER.ERROR.SUBMIT_FAILED');
                    this._appService.showError(errorMsg);
                }
            },
            error: (error) => {
                this.isSubmitting = false;
                console.error('Submit error:', error);

                // Dùng extractErrorMessage từ AppService
                const errorMessage = this._appService.extractErrorMessage(error);
                this._appService.showError(errorMessage);
            }
        });
    }

    // Helper method to check if field has specific error
    hasError(fieldName: string, errorType: string): boolean {
        const control = this.findForm.get(fieldName);
        return !!(control && control.hasError(errorType) && (control.dirty || control.touched || this.submitted));
    }
}