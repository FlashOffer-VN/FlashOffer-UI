// src/app/pages/auth/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { ProvinceSelectComponent } from '@shared/components/province-select/province-select.component';
import { AccountCreatedNoticeComponent } from '@shared/components/account-created-notice/account-created-notice.component';
import { AppService } from '@core/services/app.service';
import { BusinessFieldOption, BusinessFieldService } from '@core/services/business-field.service';
import { isBrowser } from '@core/utils/platform';
import { focusFirstInvalid } from '@core/utils/form-invalid';
import { resolveReferralCode } from '@core/utils/share-link';
import { COMPANY_SIZES } from '@core/models/partner.model';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        RouterLink,
        InputComponent,
        ButtonComponent,
        NgSelectWrapperComponent,
        ProvinceSelectComponent,
        AccountCreatedNoticeComponent
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    isLoading = false;
    isSubmitted = false;
    currentStep = 1;
    /** Tài khoản trả về sau khi đăng ký thành công — hiện khối thông báo thay cho form */
    registerResult: {
        isNewAccount?: boolean;
        accountAlreadyExisted?: boolean;
        username?: string | null;
        passwordIsPhone?: boolean;
    } | null = null;
    totalSteps = 2;

    /** Danh sách lĩnh vực hoạt động lấy từ API (BusinessField — quản lý tập trung). */
    businessFields: BusinessFieldOption[] = [];

    /**
     * Quy mô doanh nghiệp — dùng đúng 4 mức của enum CompanySize bên API.
     * Mức thứ 5 chỉ có ở dữ liệu cũ, không hiện cho người đăng ký mới.
     */
    businessSizes: { value: number; label: string }[] = [];

    constructor(
        private fb: FormBuilder,
        private _appService: AppService,
        private businessFieldService: BusinessFieldService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)]],
            businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
            businessFieldId: [null, [Validators.required]],
            businessSize: [null, [Validators.required]],
            address: [null, [Validators.required]],
            //  Mã chia sẻ trên link (?ref=) — lấy sẵn khi khách mở link của CTV, gửi kèm khi đăng ký.
            accountReferrerCode: [resolveReferralCode() ?? ''],
            agreeTerms: [false, [Validators.requiredTrue]]
        });
    }

    ngOnInit(): void {
        this.businessSizes = COMPANY_SIZES.map(option => ({
            value: option.value,
            label: this._appService.trans(option.label)
        }));

        if (this._appService.isAuthenticated()) {
            this.router.navigate(['/']);
            return;
        }
        this.loadBusinessFields();
    }

    loadBusinessFields(): void {
        this.businessFieldService.getActive().subscribe(fields => {
            this.businessFields = fields;
        });
    }

    /** Tên lĩnh vực theo Id — gửi kèm lên API để hiển thị/đối chiếu. */
    getBusinessFieldName(id: string): string {
        return this.businessFields.find(f => f.value === id)?.label ?? '';
    }

    // ===== STEP NAVIGATION =====
    nextStep(): void {
        if (!this.isStep1Valid()) {
            // Bấm mà form còn lỗi: đưa người dùng tới đúng ô cần sửa thay vì đứng im
            focusFirstInvalid();
            return;
        }

        this.currentStep = 2;
        if (isBrowser()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            if (isBrowser()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    isStep1Valid(): boolean {
        const step1Fields = ['fullName', 'email', 'phone'];
        let valid = true;
        step1Fields.forEach(field => {
            const control = this.registerForm.get(field);
            if (control?.invalid) {
                valid = false;
            }
        });
        return valid;
    }

    // ===== FORM HELPERS =====
    get f() {
        return this.registerForm.controls;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.registerForm.get(fieldName);
        if (!control) return false;
        return control.invalid && (control.dirty || control.touched || this.isSubmitted);
    }

    getErrorMessage(fieldName: string): string {
        const control = this.registerForm.get(fieldName);
        if (!control || !control.errors) return '';

        const errorMessages: Record<string, Record<string, string>> = {
            fullName: {
                required: this._appService.trans('REGISTER.VALIDATION.FULL_NAME_REQUIRED'),
                minlength: this._appService.trans('REGISTER.VALIDATION.FULL_NAME_MINLENGTH'),
                maxlength: this._appService.trans('REGISTER.VALIDATION.FULL_NAME_MAXLENGTH')
            },
            email: {
                required: this._appService.trans('REGISTER.VALIDATION.EMAIL_REQUIRED'),
                email: this._appService.trans('REGISTER.VALIDATION.EMAIL_INVALID')
            },
            phone: {
                required: this._appService.trans('REGISTER.VALIDATION.PHONE_REQUIRED'),
                pattern: this._appService.trans('REGISTER.VALIDATION.PHONE_INVALID')
            },
            businessName: {
                required: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_REQUIRED'),
                minlength: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_MINLENGTH'),
                maxlength: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_MAXLENGTH')
            },
            businessFieldId: {
                required: this._appService.trans('REGISTER.VALIDATION.BUSINESS_FIELD_REQUIRED')
            },
            businessSize: {
                required: this._appService.trans('REGISTER.VALIDATION.BUSINESS_SIZE_REQUIRED')
            },
            address: {
                required: this._appService.trans('REGISTER.VALIDATION.ADDRESS_REQUIRED'),
            },
            agreeTerms: {
                required: this._appService.trans('REGISTER.VALIDATION.AGREE_TERMS_REQUIRED')
            }
        };

        const fieldErrors = errorMessages[fieldName];
        if (!fieldErrors) {
            return this._appService.trans('VALIDATION.INVALID');
        }

        const errorKey = Object.keys(control.errors)[0];
        return fieldErrors[errorKey as keyof typeof fieldErrors] || this._appService.trans('VALIDATION.INVALID');
    }

    /** Từ khối thông báo tài khoản → sang trang đăng nhập */
    goToLogin(): void {
        this.router.navigate(['/login']);
    }

    onSubmit(): void {
        this.isSubmitted = true;

        Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.updateValueAndValidity();
        });
        this.registerForm.updateValueAndValidity();

        if (this.registerForm.invalid) {

            this.registerForm.markAllAsTouched();
            if (!isBrowser()) return;

            focusFirstInvalid();
            return;
        }

        this.isLoading = true;
        const businessFieldId = this.registerForm.value.businessFieldId;
        const formData = {
            ...this.registerForm.value,
            businessFieldId,
            businessFieldName: this.getBusinessFieldName(businessFieldId)
        };

        this._appService.collaboratorService.register(formData).subscribe({
            next: (response: any) => {
                this.isLoading = false;

                // API trả kèm thông tin tài khoản (tên đăng nhập, mật khẩu khởi tạo) — hiện khối
                // thông báo dùng chung với luồng mua chung thay vì chuyển thẳng sang trang đăng nhập.
                // Chỉ giữ lại khi có nội dung để hiện (tài khoản mới, hoặc tài khoản đã tồn tại).
                const account = response?.data?.account;
                if (account && (account.isNewAccount === true || account.accountAlreadyExisted === true)) {
                    this.registerResult = account;
                    return;
                }

                this._appService.showSuccess(this._appService.trans('REGISTER.SUCCESS'));
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.isLoading = false;

                // 409: SĐT/email đã có tài khoản hoặc đã là CTV
                if (error?.status === 409) {
                    this._appService.showError(this._appService.trans('REGISTER.ALREADY_REGISTERED'));
                    return;
                }

                const errorMsg = this._appService.extractErrorMessage(error);
                if (errorMsg.includes('Email') || errorMsg.includes('Phone') || errorMsg.includes('duplicate')) {
                    this._appService.showError(this._appService.trans('REGISTER.CONTACT_EXISTS'));
                } else {
                    this._appService.showError(errorMsg);
                }
            }
        });
    }
}