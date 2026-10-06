// src/app/pages/group-buying/group-buying.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { MoneyInputDirective } from '@shared/directives/money-input.directive';
import { resolveReferralCode } from '@core/utils/share-link';
import { CreateGroupBuyingRequest } from '@core/models/group-buying-request.model';
import { finalize } from 'rxjs/operators';
import { TextareaComponent } from '@shared/components/textarea/textarea.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { InputComponent } from '@shared/components/input/input.component';

@Component({
    selector: 'app-group-buying',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink, MoneyInputDirective,
        TextareaComponent,
        CheckboxComponent,
        InputComponent
    ],
    templateUrl: './group-buying.component.html',
    styleUrls: ['./group-buying.component.css']
})
export class GroupBuyingComponent {
    groupForm: FormGroup;
    isSubmitting = false;

    /** Mã chia sẻ riêng trên link (?ref=) khi người dùng mở form từ link được chia sẻ */
    private _referralCode: string | null = null;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService,
        private _route: ActivatedRoute
    ) {
        // Mã chia sẻ của CTV: lấy mã đã ghi nhận trong máy (từ link ?ref=) hoặc mã trên link đang mở
        this._referralCode = resolveReferralCode() ?? this._route.snapshot.queryParamMap.get('ref');

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

        // Người đã đăng nhập không phải nhập lại thông tin liên hệ — service tự lấy từ tài khoản
        this.applyGuestValidators();
    }

    get isAuthenticated(): boolean {
        return this._appService.isAuthenticated();
    }

    /** Khách chưa đăng nhập bắt buộc nhập họ tên + SĐT + email (để tạo tài khoản và liên hệ) */
    private applyGuestValidators(): void {
        const guest = !this.isAuthenticated;
        const fullName = this.groupForm.get('fullName');
        const phone = this.groupForm.get('phone');
        const email = this.groupForm.get('email');

        fullName?.setValidators(guest ? [Validators.required, Validators.minLength(2)] : []);
        phone?.setValidators(guest ? [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)] : []);
        email?.setValidators(guest ? [Validators.required, Validators.email] : []);

        fullName?.updateValueAndValidity();
        phone?.updateValueAndValidity();
        email?.updateValueAndValidity();
    }

    get f() {
        return this.groupForm.controls;
    }

    get formProgress(): number {
        const controls = this.groupForm.controls;
        const requiredFields = ['productName', 'targetPrice', 'targetPeopleCount',
            ...(this.isAuthenticated ? [] : ['fullName', 'phone', 'email']), 'agreeTerms'];
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
                productName: this._appService.trans('GROUP_BUYING.ERROR.PRODUCT_NAME_REQUIRED'),
                targetPrice: this._appService.trans('GROUP_BUYING.ERROR.TARGET_PRICE_REQUIRED'),
                targetPeopleCount: this._appService.trans('GROUP_BUYING.ERROR.TARGET_PEOPLE_REQUIRED'),
                fullName: this._appService.trans('GROUP_BUYING.ERROR.FULL_NAME_REQUIRED'),
                phone: this._appService.trans('GROUP_BUYING.ERROR.PHONE_REQUIRED'),
                email: this._appService.trans('GROUP_BUYING.ERROR.EMAIL_REQUIRED'),
                agreeTerms: this._appService.trans('GROUP_BUYING.ERROR.AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.trans('GROUP_BUYING.ERROR.REQUIRED');
        }

        if (control.errors['requiredTrue']) {
            return this._appService.trans('GROUP_BUYING.ERROR.AGREE_TERMS_REQUIRED');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'productName') {
                return this._appService.trans('GROUP_BUYING.ERROR.PRODUCT_NAME_MINLENGTH');
            }
            if (fieldName === 'fullName') {
                return this._appService.trans('GROUP_BUYING.ERROR.FULL_NAME_MINLENGTH');
            }
            return this._appService.trans('GROUP_BUYING.ERROR.MINLENGTH');
        }

        if (control.errors['min']) {
            if (fieldName === 'targetPrice') {
                return this._appService.trans('GROUP_BUYING.ERROR.TARGET_PRICE_MIN');
            }
            if (fieldName === 'targetPeopleCount') {
                return this._appService.trans('GROUP_BUYING.ERROR.TARGET_PEOPLE_MIN');
            }
            return this._appService.trans('GROUP_BUYING.ERROR.MIN_VALUE');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.trans('GROUP_BUYING.ERROR.PHONE_INVALID');
            }
            return this._appService.trans('GROUP_BUYING.ERROR.INVALID');
        }

        if (control.errors['email']) {
            return this._appService.trans('GROUP_BUYING.ERROR.EMAIL_INVALID');
        }

        return '';
    }

    onSubmit(): void {
        if (this.groupForm.invalid) {
            this.groupForm.markAllAsTouched();
            this._appService.toast.error(this._appService.trans('GROUP_BUYING.ERROR.FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const formValue = this.groupForm.value;

        // Prepare request data
        // Người đã đăng nhập: để trống thông tin liên hệ, service tự bù từ hồ sơ tài khoản
        const contact = this.isAuthenticated ? null : {
            fullName: formValue.fullName.trim(),
            phone: formValue.phone.trim(),
            zalo: formValue.zalo?.trim() || undefined,
            email: formValue.email.trim().toLowerCase()
        };

        const requestData: CreateGroupBuyingRequest = {
            productName: formValue.productName.trim(),
            productLink: formValue.productLink?.trim() || undefined,
            targetPeopleCount: Number(formValue.targetPeopleCount),
            targetPrice: Number(formValue.targetPrice),
            fullName: contact?.fullName ?? '',
            phone: contact?.phone ?? '',
            zalo: contact?.zalo,
            email: contact?.email ?? '',
            note: formValue.note?.trim() || undefined,
            // Đơn tạo từ link được chia sẻ: ghi nhận mã chia sẻ của người đã gửi link
            recordReferrerCode: this._referralCode ?? ''
        };

        this._appService.groupBuyingRequest.create(requestData)
            .pipe(finalize(() => {
                this.isSubmitting = false;
            }))
            .subscribe({
                next: (response) => {
                    if (response.success) {
                        this._appService.toast.success(
                            this._appService.trans('GROUP_BUYING.SUCCESS.SUBMIT')
                        );
                        this.groupForm.reset();
                        this.groupForm.markAsPristine();
                    } else {
                        // Handle API errors
                        const errorMsg = response.errors?.[0] || this._appService.trans('GROUP_BUYING.ERROR.SUBMIT_FAILED');
                        this._appService.toast.error(errorMsg);

                        // Map errors to form fields
                        this.mapErrorsToForm(response.errors);
                    }
                },
                error: (error) => {
                    console.error('GroupBuying error:', error);

                    if (error.error?.errors) {
                        const errorMsg = error.error.errors[0] || this._appService.trans('GROUP_BUYING.ERROR.SUBMIT_FAILED');
                        this._appService.toast.error(errorMsg);
                        this.mapErrorsToForm(error.error.errors);
                    } else if (error.error?.message) {
                        this._appService.toast.error(error.error.message);
                    } else {
                        this._appService.toast.error(
                            this._appService.trans('GROUP_BUYING.ERROR.SUBMIT_FAILED')
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