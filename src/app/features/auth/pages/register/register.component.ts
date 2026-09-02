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
        NgSelectWrapperComponent
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

    provinces = [
        { value: 'An Giang', label: 'An Giang' },
        { value: 'Bà Rịa - Vũng Tàu', label: 'Bà Rịa - Vũng Tàu' },
        { value: 'Bắc Giang', label: 'Bắc Giang' },
        { value: 'Bắc Kạn', label: 'Bắc Kạn' },
        { value: 'Bạc Liêu', label: 'Bạc Liêu' },
        { value: 'Bắc Ninh', label: 'Bắc Ninh' },
        { value: 'Bến Tre', label: 'Bến Tre' },
        { value: 'Bình Định', label: 'Bình Định' },
        { value: 'Bình Dương', label: 'Bình Dương' },
        { value: 'Bình Phước', label: 'Bình Phước' },
        { value: 'Bình Thuận', label: 'Bình Thuận' },
        { value: 'Cà Mau', label: 'Cà Mau' },
        { value: 'Cao Bằng', label: 'Cao Bằng' },
        { value: 'Cần Thơ', label: 'Cần Thơ' },
        { value: 'Đà Nẵng', label: 'Đà Nẵng' },
        { value: 'Đắk Lắk', label: 'Đắk Lắk' },
        { value: 'Đắk Nông', label: 'Đắk Nông' },
        { value: 'Điện Biên', label: 'Điện Biên' },
        { value: 'Đồng Nai', label: 'Đồng Nai' },
        { value: 'Đồng Tháp', label: 'Đồng Tháp' },
        { value: 'Gia Lai', label: 'Gia Lai' },
        { value: 'Hà Giang', label: 'Hà Giang' },
        { value: 'Hà Nam', label: 'Hà Nam' },
        { value: 'Hà Nội', label: 'Hà Nội' },
        { value: 'Hà Tĩnh', label: 'Hà Tĩnh' },
        { value: 'Hải Dương', label: 'Hải Dương' },
        { value: 'Hải Phòng', label: 'Hải Phòng' },
        { value: 'Hậu Giang', label: 'Hậu Giang' },
        { value: 'Hòa Bình', label: 'Hòa Bình' },
        { value: 'Hưng Yên', label: 'Hưng Yên' },
        { value: 'Khánh Hòa', label: 'Khánh Hòa' },
        { value: 'Kiên Giang', label: 'Kiên Giang' },
        { value: 'Kon Tum', label: 'Kon Tum' },
        { value: 'Lai Châu', label: 'Lai Châu' },
        { value: 'Lâm Đồng', label: 'Lâm Đồng' },
        { value: 'Lạng Sơn', label: 'Lạng Sơn' },
        { value: 'Lào Cai', label: 'Lào Cai' },
        { value: 'Long An', label: 'Long An' },
        { value: 'Nam Định', label: 'Nam Định' },
        { value: 'Nghệ An', label: 'Nghệ An' },
        { value: 'Ninh Bình', label: 'Ninh Bình' },
        { value: 'Ninh Thuận', label: 'Ninh Thuận' },
        { value: 'Phú Thọ', label: 'Phú Thọ' },
        { value: 'Phú Yên', label: 'Phú Yên' },
        { value: 'Quảng Bình', label: 'Quảng Bình' },
        { value: 'Quảng Nam', label: 'Quảng Nam' },
        { value: 'Quảng Ngãi', label: 'Quảng Ngãi' },
        { value: 'Quảng Ninh', label: 'Quảng Ninh' },
        { value: 'Quảng Trị', label: 'Quảng Trị' },
        { value: 'Sóc Trăng', label: 'Sóc Trăng' },
        { value: 'Sơn La', label: 'Sơn La' },
        { value: 'Tây Ninh', label: 'Tây Ninh' },
        { value: 'Thái Bình', label: 'Thái Bình' },
        { value: 'Thái Nguyên', label: 'Thái Nguyên' },
        { value: 'Thanh Hóa', label: 'Thanh Hóa' },
        { value: 'Thừa Thiên Huế', label: 'Thừa Thiên Huế' },
        { value: 'Tiền Giang', label: 'Tiền Giang' },
        { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
        { value: 'Trà Vinh', label: 'Trà Vinh' },
        { value: 'Tuyên Quang', label: 'Tuyên Quang' },
        { value: 'Vĩnh Long', label: 'Vĩnh Long' },
        { value: 'Vĩnh Phúc', label: 'Vĩnh Phúc' },
        { value: 'Yên Bái', label: 'Yên Bái' }
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
            businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
            businessField: [null, [Validators.required]],
            businessSize: [null, [Validators.required]],
            address: [null, [Validators.required]],
            agreeTerms: [false, [Validators.requiredTrue]]
        });
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
            businessField: {
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
        const formData = {
            ...this.registerForm.value,
            businessFieldName: this.registerForm.value.businessField,
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