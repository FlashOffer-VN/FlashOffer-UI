// src/app/pages/get-offer/get-offer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-get-offer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
    templateUrl: './get-offer.component.html',
    styleUrls: ['./get-offer.component.css']
})
export class GetOfferComponent {
    offerForm: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService
    ) {
        this.offerForm = this.fb.group({
            // Product info
            productName: ['', [Validators.required, Validators.minLength(3)]],
            productLink: [''],
            currentPrice: ['', [Validators.required, Validators.pattern(/^[0-9,.\s]+$/)]],
            expectedPrice: [''],
            quantity: ['', [Validators.required, Validators.min(1)]],
            unit: ['', [Validators.required, Validators.minLength(1)]],
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
        return this.offerForm.controls;
    }

    get formProgress(): number {
        const controls = this.offerForm.controls;
        const requiredFields = ['productName', 'currentPrice', 'quantity', 'unit', 'fullName', 'phone', 'email', 'agreeTerms'];
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
        const control = this.offerForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.offerForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            const fieldMap: Record<string, string> = {
                productName: this._appService.instant('GET_OFFER.ERROR.PRODUCT_NAME_REQUIRED'),
                currentPrice: this._appService.instant('GET_OFFER.ERROR.CURRENT_PRICE_REQUIRED'),
                quantity: this._appService.instant('GET_OFFER.ERROR.QUANTITY_REQUIRED'),
                unit: this._appService.instant('GET_OFFER.ERROR.UNIT_REQUIRED'),
                fullName: this._appService.instant('GET_OFFER.ERROR.FULL_NAME_REQUIRED'),
                phone: this._appService.instant('GET_OFFER.ERROR.PHONE_REQUIRED'),
                email: this._appService.instant('GET_OFFER.ERROR.EMAIL_REQUIRED'),
                agreeTerms: this._appService.instant('GET_OFFER.ERROR.AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.instant('GET_OFFER.ERROR.REQUIRED');
        }

        if (control.errors['requiredTrue']) {
            return this._appService.instant('GET_OFFER.ERROR.AGREE_TERMS_REQUIRED');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'productName') {
                return this._appService.instant('GET_OFFER.ERROR.PRODUCT_NAME_MINLENGTH');
            }
            if (fieldName === 'fullName') {
                return this._appService.instant('GET_OFFER.ERROR.FULL_NAME_MINLENGTH');
            }
            return this._appService.instant('GET_OFFER.ERROR.MINLENGTH');
        }

        if (control.errors['min']) {
            if (fieldName === 'quantity') {
                return this._appService.instant('GET_OFFER.ERROR.QUANTITY_MIN');
            }
            return this._appService.instant('GET_OFFER.ERROR.MIN_VALUE');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.instant('GET_OFFER.ERROR.PHONE_INVALID');
            }
            if (fieldName === 'currentPrice') {
                return this._appService.instant('GET_OFFER.ERROR.PRICE_INVALID');
            }
            return this._appService.instant('GET_OFFER.ERROR.INVALID');
        }

        if (control.errors['email']) {
            return this._appService.instant('GET_OFFER.ERROR.EMAIL_INVALID');
        }

        return '';
    }

    onSubmit(): void {
        if (this.offerForm.invalid) {
            this.offerForm.markAllAsTouched();
            this._appService.showError(this._appService.instant('GET_OFFER.ERROR.FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const formValue = this.offerForm.value;

        const cleanPrice = (val: string) => Number(String(val).replace(/[,.\s]/g, ''));

        const requestData = {
            productName: formValue.productName.trim(),
            productLink: formValue.productLink?.trim() || undefined,
            currentPrice: cleanPrice(formValue.currentPrice),
            expectedPrice: formValue.expectedPrice ? cleanPrice(formValue.expectedPrice) : undefined,
            quantity: Number(formValue.quantity),
            unit: formValue.unit.trim(),
            fullName: formValue.fullName.trim(),
            phone: formValue.phone.trim(),
            zalo: formValue.zalo?.trim() || undefined,
            email: formValue.email.trim().toLowerCase(),
            note: formValue.note?.trim() || undefined
        };

        this._appService.offerRequest.create(requestData)
            .pipe(finalize(() => {
                this.isSubmitting = false;
            }))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this._appService.showSuccess(
                            this._appService.instant('GET_OFFER.SUCCESS.SUBMIT')
                        );
                        this.offerForm.reset();
                        this.offerForm.markAsPristine();
                    } else {
                        // Hiển thị lỗi đầu tiên từ API
                        const errorMsg = response.errors?.[0] ||
                            this._appService.instant('GET_OFFER.ERROR.SUBMIT_FAILED');
                        this._appService.showError(errorMsg);
                    }
                },
                error: (error) => {
                    console.error('GetOffer error:', error);
                    if (error.error?.errors) {
                        const errorMsg = error.error.errors[0] ||
                            this._appService.instant('GET_OFFER.ERROR.SUBMIT_FAILED');
                        this._appService.showError(errorMsg);
                    } else if (error.error?.message) {
                        this._appService.showError(error.error.message);
                    } else {
                        this._appService.showError(
                            this._appService.instant('GET_OFFER.ERROR.SUBMIT_FAILED')
                        );
                    }
                }
            });
    }
}