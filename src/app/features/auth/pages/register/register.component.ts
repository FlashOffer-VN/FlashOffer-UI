// src/app/features/auth/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { ProvinceSelectComponent } from '@shared/components/province-select/province-select.component';
import { AppService } from '@core/services/app.service';
import { BusinessFieldOption, BusinessFieldService } from '@core/services/business-field.service';
import { isBrowser } from '@core/utils/platform';

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
        ProvinceSelectComponent
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    isLoading = false;
    isSubmitted = false;
    currentStep = 1;
    totalSteps = 2;

    /** Danh sách lĩnh vực hoạt động lấy từ API (BusinessField — quản lý tập trung). */
    businessFields: BusinessFieldOption[] = [];

    businessSizes = [
        { value: 1, label: '1 - 10 nhân viên' },
        { value: 2, label: '11 - 50 nhân viên' },
        { value: 3, label: '51 - 200 nhân viên' },
        { value: 4, label: '201 - 500 nhân viên' },
        { value: 5, label: '500+ nhân viên' }
    ];

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
            agreeTerms: [false, [Validators.requiredTrue]]
        });
    }

    ngOnInit(): void {
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
        if (this.isStep1Valid()) {
            this.currentStep = 2;
            if (isBrowser()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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

    onSubmit(): void {
        this.isSubmitted = true;

        Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.updateValueAndValidity();
        });
        this.registerForm.updateValueAndValidity();

        if (this.registerForm.invalid) {

            this.registerForm.markAllAsTouched();
            if (!isBrowser()) return;

            const firstInvalid = document.querySelector('.is-invalid,.ng-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        this.isLoading = true;
        const businessFieldId = this.registerForm.value.businessFieldId;
        const formData = {
            ...this.registerForm.value,
            businessFieldId,
            businessFieldName: this.getBusinessFieldName(businessFieldId),
            role: 'USER'
        };

        this._appService.collaboratorService.register(formData).subscribe({
            next: () => {
                this.isLoading = false;
                this._appService.showSuccess(this._appService.trans('REGISTER.SUCCESS'));
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.isLoading = false;
                const errorMsg = this._appService.extractErrorMessage(error);
                if (errorMsg.includes('Email') || errorMsg.includes('Phone') || errorMsg.includes('duplicate')) {
                    this._appService.showError('Thông tin đăng ký đã tồn tại, vui lòng kiểm tra lại');
                } else {
                    this._appService.showError(errorMsg);
                }
            }
        });
    }
}