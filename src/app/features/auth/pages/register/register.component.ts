// src/app/features/auth/pages/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { AppService } from '@core/services/app.service';

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
        NgSelectWrapperComponent
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    isLoading = false;
    isSubmitted = false;
    showPassword = false;
    showConfirmPassword = false;

    currentStep = 1;
    totalSteps = 2;

    private readonly passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    businessFields = [
        { value: 'technology', label: 'Công nghệ thông tin' },
        { value: 'manufacturing', label: 'Sản xuất - Chế tạo' },
        { value: 'trade', label: 'Thương mại - Dịch vụ' },
        { value: 'agriculture', label: 'Nông nghiệp - Thực phẩm' },
        { value: 'construction', label: 'Xây dựng - Bất động sản' },
        { value: 'education', label: 'Giáo dục - Đào tạo' },
        { value: 'healthcare', label: 'Y tế - Chăm sóc sức khỏe' },
        { value: 'finance', label: 'Tài chính - Ngân hàng' },
        { value: 'logistics', label: 'Vận tải - Logistics' },
        { value: 'consulting', label: 'Tư vấn - Chiến lược' },
        { value: 'other', label: 'Lĩnh vực khác' }
    ];

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
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)]],
            username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(100),
                Validators.pattern(this.passwordPattern)
            ]],
            confirmPassword: ['', [Validators.required]],
            businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
            businessField: [null, [Validators.required]],
            businessFieldOther: [''],
            businessSize: [null, [Validators.required]],
            position: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
            website: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],
            interests: ['', Validators.maxLength(500)],
            goals: ['', Validators.maxLength(500)],
            skills: ['', Validators.maxLength(500)],
            agreeTerms: [false, [Validators.requiredTrue]]
        }, {
            validators: [
                this.passwordMatchValidator,
                this.businessFieldOtherValidator
            ]
        });

        this.registerForm.get('businessField')?.valueChanges.subscribe(value => {
            const otherControl = this.registerForm.get('businessFieldOther');
            if (value !== 'other') {
                otherControl?.reset('');
                otherControl?.clearValidators();
                otherControl?.updateValueAndValidity();
            } else {
                otherControl?.setValidators([Validators.required, Validators.minLength(2)]);
                otherControl?.updateValueAndValidity();
            }
        });
    }

    // ===== CUSTOM VALIDATORS =====
    businessFieldOtherValidator(group: FormGroup): any {
        const businessField = group.get('businessField')?.value;
        const businessFieldOther = group.get('businessFieldOther')?.value;

        if (businessField === 'other' && !businessFieldOther) {
            return { businessFieldOtherRequired: true };
        }
        return null;
    }

    passwordMatchValidator(group: FormGroup): any {
        const password = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        const confirmControl = group.get('confirmPassword');

        if (!password || !confirm) {
            if (confirmControl?.hasError('mismatch')) {
                const errors = { ...confirmControl.errors };
                delete errors['mismatch'];
                confirmControl?.setErrors(Object.keys(errors).length ? errors : null);
            }
            return null;
        }

        if (password !== confirm) {
            confirmControl?.setErrors({ mismatch: true });
            return { mismatch: true };
        }

        if (confirmControl?.hasError('mismatch')) {
            const errors = { ...confirmControl.errors };
            delete errors['mismatch'];
            confirmControl?.setErrors(Object.keys(errors).length ? errors : null);
        }
        return null;
    }

    ngOnInit(): void {
        if (this._appService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    // ===== STEP NAVIGATION =====
    nextStep(): void {
        if (this.isStep1Valid()) {
            this.currentStep = 2;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    isStep1Valid(): boolean {
        const step1Fields = ['fullName', 'email', 'phone', 'username', 'password', 'confirmPassword'];
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

        if (fieldName === 'businessFieldOther') {
            if (control.errors['required']) {
                return this._appService.trans('REGISTER.VALIDATION.BUSINESS_FIELD_OTHER_REQUIRED');
            }
            if (control.errors['minlength']) {
                return this._appService.trans('REGISTER.VALIDATION.BUSINESS_FIELD_OTHER_MINLENGTH');
            }
        }

        if (fieldName === 'businessField') {
            if (this.registerForm.errors?.['businessFieldOtherRequired']) {
                return this._appService.trans('REGISTER.VALIDATION.BUSINESS_FIELD_OTHER_REQUIRED');
            }
        }

        if (fieldName === 'password') {
            if (control.errors['required']) {
                return this._appService.trans('REGISTER.VALIDATION.PASSWORD_REQUIRED');
            }
            if (control.errors['minlength']) {
                return this._appService.trans('REGISTER.VALIDATION.PASSWORD_MINLENGTH');
            }
            if (control.errors['maxlength']) {
                return this._appService.trans('REGISTER.VALIDATION.PASSWORD_MAXLENGTH');
            }
            if (control.errors['pattern']) {
                return this._appService.trans('REGISTER.VALIDATION.PASSWORD_WEAK');
            }
        }

        if (fieldName === 'confirmPassword') {
            if (control.errors['required']) {
                return this._appService.trans('REGISTER.VALIDATION.CONFIRM_PASSWORD_REQUIRED');
            }
            if (this.registerForm.errors?.['mismatch']) {
                return this._appService.trans('REGISTER.VALIDATION.PASSWORD_MISMATCH');
            }
        }

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
            username: {
                required: this._appService.trans('REGISTER.VALIDATION.USERNAME_REQUIRED'),
                minlength: this._appService.trans('REGISTER.VALIDATION.USERNAME_MINLENGTH'),
                maxlength: this._appService.trans('REGISTER.VALIDATION.USERNAME_MAXLENGTH')
            },
            businessName: {
                required: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_REQUIRED'),
                minlength: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_MINLENGTH'),
                maxlength: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_MAXLENGTH')
            },
            businessField: {
                required: this._appService.trans('REGISTER.VALIDATION.BUSINESS_FIELD_REQUIRED')
            },
            businessSize: {
                required: this._appService.trans('REGISTER.VALIDATION.BUSINESS_SIZE_REQUIRED')
            },
            position: {
                required: this._appService.trans('REGISTER.VALIDATION.POSITION_REQUIRED'),
                minlength: this._appService.trans('REGISTER.VALIDATION.POSITION_MINLENGTH'),
                maxlength: this._appService.trans('REGISTER.VALIDATION.POSITION_MAXLENGTH')
            },
            address: {
                required: this._appService.trans('REGISTER.VALIDATION.ADDRESS_REQUIRED'),
                minlength: this._appService.trans('REGISTER.VALIDATION.ADDRESS_MINLENGTH'),
                maxlength: this._appService.trans('REGISTER.VALIDATION.ADDRESS_MAXLENGTH')
            },
            website: {
                pattern: this._appService.trans('REGISTER.VALIDATION.WEBSITE_INVALID')
            },
            interests: {
                maxlength: this._appService.trans('REGISTER.VALIDATION.INTERESTS_MAXLENGTH')
            },
            goals: {
                maxlength: this._appService.trans('REGISTER.VALIDATION.GOALS_MAXLENGTH')
            },
            skills: {
                maxlength: this._appService.trans('REGISTER.VALIDATION.SKILLS_MAXLENGTH')
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

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit(): void {
        this.isSubmitted = true;

        // Force validate businessFieldOther khi chọn Other
        if (this.registerForm.get('businessField')?.value === 'other') {
            this.registerForm.get('businessFieldOther')?.updateValueAndValidity();
        }

        // Force re-validate all fields
        Object.keys(this.registerForm.controls).forEach(key => {
            this.registerForm.get(key)?.updateValueAndValidity();
        });
        this.registerForm.updateValueAndValidity();

        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            const firstInvalid = document.querySelector('.is-invalid, .ng-invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Lấy giá trị businessField
        let businessFieldValue = this.registerForm.value.businessField;
        if (businessFieldValue === 'other') {
            businessFieldValue = this.registerForm.value.businessFieldOther;
        }

        this.isLoading = true;
        const formData = {
            ...this.registerForm.value,
            businessField: businessFieldValue,
            role: 'USER'
        };

        // Xóa businessFieldOther khỏi payload
        delete formData.businessFieldOther;

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