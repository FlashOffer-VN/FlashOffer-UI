// src/app/pages/group-buying/group-buying.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { CreateGroupBuyingRequest } from '@core/models/group-buying-request.model';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-group-buying',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
    templateUrl: './group-buying.component.html',
    styleUrls: ['./group-buying.component.css']
})
export class GroupBuyingComponent {
    groupForm: FormGroup;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService
    ) {
        this.groupForm = this.fb.group({
            // Product info
            productName: ['', [Validators.required, Validators.minLength(3)]],
            productLink: [''],
            targetPrice: ['', [Validators.required, Validators.min(1000)]],
            targetPeopleCount: ['', [Validators.required, Validators.min(2)]],
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
        return this.groupForm.controls;
    }

    get formProgress(): number {
        const controls = this.groupForm.controls;
        const requiredFields = ['productName', 'targetPrice', 'targetPeopleCount', 'fullName', 'phone', 'email', 'agreeTerms'];
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
        const control = this.groupForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.groupForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            const fieldMap: Record<string, string> = {
                productName: this._appService.instant('GROUP_BUYING.ERROR.PRODUCT_NAME_REQUIRED'),
                targetPrice: this._appService.instant('GROUP_BUYING.ERROR.TARGET_PRICE_REQUIRED'),
                targetPeopleCount: this._appService.instant('GROUP_BUYING.ERROR.TARGET_PEOPLE_REQUIRED'),
                fullName: this._appService.instant('GROUP_BUYING.ERROR.FULL_NAME_REQUIRED'),
                phone: this._appService.instant('GROUP_BUYING.ERROR.PHONE_REQUIRED'),
                email: this._appService.instant('GROUP_BUYING.ERROR.EMAIL_REQUIRED'),
                agreeTerms: this._appService.instant('GROUP_BUYING.ERROR.AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.instant('GROUP_BUYING.ERROR.REQUIRED');
        }

        if (control.errors['requiredTrue']) {
            return this._appService.instant('GROUP_BUYING.ERROR.AGREE_TERMS_REQUIRED');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'productName') {
                return this._appService.instant('GROUP_BUYING.ERROR.PRODUCT_NAME_MINLENGTH');
            }
            if (fieldName === 'fullName') {
                return this._appService.instant('GROUP_BUYING.ERROR.FULL_NAME_MINLENGTH');
            }
            return this._appService.instant('GROUP_BUYING.ERROR.MINLENGTH');
        }

        if (control.errors['min']) {
            if (fieldName === 'targetPrice') {
                return this._appService.instant('GROUP_BUYING.ERROR.TARGET_PRICE_MIN');
            }
            if (fieldName === 'targetPeopleCount') {
                return this._appService.instant('GROUP_BUYING.ERROR.TARGET_PEOPLE_MIN');
            }
            return this._appService.instant('GROUP_BUYING.ERROR.MIN_VALUE');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.instant('GROUP_BUYING.ERROR.PHONE_INVALID');
            }
            return this._appService.instant('GROUP_BUYING.ERROR.INVALID');
        }

        if (control.errors['email']) {
            return this._appService.instant('GROUP_BUYING.ERROR.EMAIL_INVALID');
        }

        return '';
    }

    onSubmit(): void {
        if (this.groupForm.invalid) {
            this.groupForm.markAllAsTouched();
            this._appService.toast.error(this._appService.instant('GROUP_BUYING.ERROR.FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const formValue = this.groupForm.value;

        // Prepare request data
        const requestData: CreateGroupBuyingRequest = {
            productName: formValue.productName.trim(),
            productLink: formValue.productLink?.trim() || undefined,
            targetPeopleCount: Number(formValue.targetPeopleCount),
            targetPrice: Number(formValue.targetPrice),
            fullName: formValue.fullName.trim(),
            phone: formValue.phone.trim(),
            zalo: formValue.zalo?.trim() || undefined,
            email: formValue.email.trim().toLowerCase(),
            note: formValue.note?.trim() || undefined
        };

        this._appService.groupBuyingRequest.create(requestData)
            .pipe(finalize(() => {
                this.isSubmitting = false;
            }))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this._appService.toast.success(
                            this._appService.instant('GROUP_BUYING.SUCCESS.SUBMIT')
                        );
                        this.groupForm.reset();
                        this.groupForm.markAsPristine();
                    } else {
                        // Handle API errors
                        const errorMsg = response.errors?.[0] || this._appService.instant('GROUP_BUYING.ERROR.SUBMIT_FAILED');
                        this._appService.toast.error(errorMsg);

                        // Map errors to form fields
                        this.mapErrorsToForm(response.errors);
                    }
                },
                error: (error) => {
                    console.error('GroupBuying error:', error);

                    if (error.error?.errors) {
                        const errorMsg = error.error.errors[0] || this._appService.instant('GROUP_BUYING.ERROR.SUBMIT_FAILED');
                        this._appService.toast.error(errorMsg);
                        this.mapErrorsToForm(error.error.errors);
                    } else if (error.error?.message) {
                        this._appService.toast.error(error.error.message);
                    } else {
                        this._appService.toast.error(
                            this._appService.instant('GROUP_BUYING.ERROR.SUBMIT_FAILED')
                        );
                    }
                }
            });
    }

    private mapErrorsToForm(errors: string[] | null): void {
        if (!errors) return;

        const errorMap: Record<string, string[]> = {
            'Tên sản phẩm': ['productName'],
            'Giá mục tiêu': ['targetPrice'],
            'Số người tham gia': ['targetPeopleCount'],
            'Họ và tên': ['fullName'],
            'Số điện thoại': ['phone'],
            'Email': ['email']
        };

        errors.forEach(error => {
            for (const [key, fieldNames] of Object.entries(errorMap)) {
                if (error.includes(key)) {
                    fieldNames.forEach(fieldName => {
                        const control = this.groupForm.get(fieldName);
                        if (control) {
                            control.setErrors({ serverError: error });
                            control.markAsTouched();
                        }
                    });
                    break;
                }
            }
        });
    }
}