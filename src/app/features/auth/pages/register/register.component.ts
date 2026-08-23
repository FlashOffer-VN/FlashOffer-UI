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
    showPassword = false;
    showConfirmPassword = false;

    // Options cho select
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
            // Thông tin cơ bản
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)]],
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],

            // Thông tin doanh nhân
            businessName: ['', [Validators.required, Validators.minLength(2)]],
            businessField: [null, [Validators.required]],
            businessSize: [null, [Validators.required]],
            position: ['', [Validators.required]],
            address: ['', [Validators.required, Validators.minLength(5)]],
            website: [''],

            // Mục tiêu - Sở thích
            interests: [''],
            goals: [''],
            skills: [''],

            // Đồng thuận
            agreeTerms: [false, [Validators.requiredTrue]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    ngOnInit(): void {
        if (this._appService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    passwordMatchValidator(group: FormGroup): any {
        const password = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return password === confirm ? null : { mismatch: true };
    }

    get f() {
        return this.registerForm.controls;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.registerForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.registerForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            const fieldMap: Record<string, string> = {
                fullName: this._appService.trans('REGISTER.VALIDATION.FULL_NAME_REQUIRED'),
                email: this._appService.trans('REGISTER.VALIDATION.EMAIL_REQUIRED'),
                phone: this._appService.trans('REGISTER.VALIDATION.PHONE_REQUIRED'),
                username: this._appService.trans('REGISTER.VALIDATION.USERNAME_REQUIRED'),
                password: this._appService.trans('REGISTER.VALIDATION.PASSWORD_REQUIRED'),
                confirmPassword: this._appService.trans('REGISTER.VALIDATION.CONFIRM_PASSWORD_REQUIRED'),
                businessName: this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_REQUIRED'),
                businessField: this._appService.trans('REGISTER.VALIDATION.BUSINESS_FIELD_REQUIRED'),
                businessSize: this._appService.trans('REGISTER.VALIDATION.BUSINESS_SIZE_REQUIRED'),
                position: this._appService.trans('REGISTER.VALIDATION.POSITION_REQUIRED'),
                address: this._appService.trans('REGISTER.VALIDATION.ADDRESS_REQUIRED'),
                agreeTerms: this._appService.trans('REGISTER.VALIDATION.AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.trans('VALIDATION.REQUIRED');
        }

        if (control.errors['email']) {
            return this._appService.trans('REGISTER.VALIDATION.EMAIL_INVALID');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.trans('REGISTER.VALIDATION.PHONE_INVALID');
            }
            return this._appService.trans('VALIDATION.PATTERN');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'fullName') {
                return this._appService.trans('REGISTER.VALIDATION.FULL_NAME_MINLENGTH');
            }
            if (fieldName === 'username') {
                return this._appService.trans('REGISTER.VALIDATION.USERNAME_MINLENGTH');
            }
            if (fieldName === 'password') {
                return this._appService.trans('REGISTER.VALIDATION.PASSWORD_MINLENGTH');
            }
            if (fieldName === 'businessName') {
                return this._appService.trans('REGISTER.VALIDATION.BUSINESS_NAME_MINLENGTH');
            }
            if (fieldName === 'position') {
                return this._appService.trans('REGISTER.VALIDATION.POSITION_MINLENGTH');
            }
            if (fieldName === 'address') {
                return this._appService.trans('REGISTER.VALIDATION.ADDRESS_MINLENGTH');
            }
            return this._appService.trans('VALIDATION.MIN_LENGTH', { length: control.errors['minlength'].requiredLength });
        }

        if (control.errors['mismatch']) {
            return this._appService.trans('REGISTER.VALIDATION.PASSWORD_MISMATCH');
        }

        return this._appService.trans('VALIDATION.INVALID');
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onSubmit(): void {

        console.log(this.registerForm)

        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;

        const formData = {
            ...this.registerForm.value,
            role: 'USER'
        };

        this._appService.partnerRegister.register(formData).subscribe({
            next: (response) => {
                this.isLoading = false;
                this._appService.showSuccess(this._appService.trans('REGISTER.SUCCESS'));
                this.router.navigate(['/login']);
            },
            error: (error) => {
                this.isLoading = false;
                const errorMsg = this._appService.extractErrorMessage(error);
                this._appService.showError(errorMsg);
            }
        });
    }
}