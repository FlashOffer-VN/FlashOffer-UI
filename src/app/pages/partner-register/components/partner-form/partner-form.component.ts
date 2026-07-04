// pages/partner-register/components/partner-form/partner-form.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { InputComponent } from '../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { PartnerSummaryComponent } from '../partner-summary/partner-summary.component';
import {
    BUSINESS_TYPES,
    COMPANY_SIZES,
    PRODUCT_CATEGORIES,
    COMMISSION_TYPES,
    CommissionType,
    CommissionTier
} from '../../models/partner.model';
import { PartnerRegisterService } from '../../services/partner-register.service';

@Component({
    selector: 'app-partner-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        InputComponent,
        ButtonComponent,
        PartnerSummaryComponent
    ],
    templateUrl: './partner-form.component.html',
    styleUrls: ['./partner-form.component.css']
})
export class PartnerFormComponent implements OnInit {
    @Input() currentStep = 1;
    @Input() totalSteps = 4;  // ✅ Đổi thành 4
    @Input() isLoading = false;
    @Output() stepChange = new EventEmitter<number>();
    @Output() submit = new EventEmitter<void>();

    registerForm!: FormGroup;
    businessTypes = BUSINESS_TYPES;
    companySizes = COMPANY_SIZES;
    productCategories = PRODUCT_CATEGORIES;
    commissionTypes = COMMISSION_TYPES;
    isReferralValid = false;
    private referralCheckTimeout: any;

    // ✅ Commission tiers mẫu
    commissionTiers: CommissionTier[] = [
        { from: 0, to: 1000000, rate: 5, label: 'Dưới 1 triệu' },
        { from: 1000000, to: 5000000, rate: 8, label: '1 - 5 triệu' },
        { from: 5000000, to: 10000000, rate: 12, label: '5 - 10 triệu' },
        { from: 10000000, to: 50000000, rate: 15, label: '10 - 50 triệu' },
        { from: 50000000, to: Infinity, rate: 20, label: 'Trên 50 triệu' }
    ];

    constructor(
        private fb: FormBuilder,
        private partnerService: PartnerRegisterService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.watchReferralCode();
    }

    initForm(): void {
        this.registerForm = this.fb.group({
            // Step 1: Personal Info
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^(0|\+84)[0-9]{9,10}$/)]],
            position: ['', [Validators.required, Validators.minLength(2)]],

            // Step 2: Business Info
            companyName: ['', [Validators.required, Validators.minLength(2)]],
            companyTax: ['', [Validators.required, Validators.pattern(/^[0-9]{10,14}$/)]],
            companyAddress: ['', [Validators.required, Validators.minLength(5)]],
            businessType: ['', Validators.required],
            companyWebsite: ['', Validators.pattern(/^https?:\/\/.+\..+$/)],
            companySize: ['', Validators.required],

            // ✅ Step 3: Sales Info (Thêm mới)
            products: this.fb.array([]),
            commissionType: [CommissionType.PERCENTAGE, Validators.required],
            commissionRate: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
            minOrderValue: [''],
            maxCommission: [''],
            specialConditions: [''],

            // Step 4: Confirmation
            referralCode: [''],
            note: [''],
            agreeTerms: [false, Validators.requiredTrue]
        });

        // ✅ Thêm 1 sản phẩm mặc định
        this.addProduct();
    }

    // ✅ FormArray cho sản phẩm
    get products(): FormArray {
        return this.registerForm.get('products') as FormArray;
    }

    addProduct(): void {
        const productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            category: ['', Validators.required],
            retailPrice: ['', [Validators.required, Validators.min(0)]],
            wholesalePrice: ['', [Validators.required, Validators.min(0)]],
            minOrderQuantity: [1, [Validators.required, Validators.min(1)]],
            description: ['']
        });
        this.products.push(productForm);
    }

    removeProduct(index: number): void {
        if (this.products.length > 1) {
            this.products.removeAt(index);
        }
    }

    watchReferralCode(): void {
        this.registerForm.get('referralCode')?.valueChanges.subscribe((code: string) => {
            if (this.referralCheckTimeout) {
                clearTimeout(this.referralCheckTimeout);
            }
            if (!code || code.length < 3) {
                this.isReferralValid = false;
                return;
            }
            this.referralCheckTimeout = setTimeout(() => {
                this.partnerService.checkReferralCode(code).subscribe({
                    next: (response) => {
                        this.isReferralValid = response.valid;
                    },
                    error: () => {
                        this.isReferralValid = false;
                    }
                });
            }, 500);
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.registerForm.get(fieldName);
        return !!(control?.invalid && (control?.touched || control?.dirty));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.registerForm.get(fieldName);
        if (!control || !control.errors) return '';

        const errors = control.errors;
        if (errors['required']) return 'Trường này là bắt buộc';
        if (errors['email']) return 'Email không hợp lệ';
        if (errors['minlength']) return `Tối thiểu ${errors['minlength'].requiredLength} ký tự`;
        if (errors['maxlength']) return `Tối đa ${errors['maxlength'].requiredLength} ký tự`;
        if (errors['pattern']) {
            if (fieldName === 'phone') return 'Số điện thoại không hợp lệ (VD: 0912345678)';
            if (fieldName === 'companyTax') return 'Mã số thuế không hợp lệ (10-14 số)';
            if (fieldName === 'companyWebsite') return 'Website không hợp lệ (VD: https://example.com)';
            return 'Định dạng không hợp lệ';
        }
        if (errors['min']) return `Giá trị tối thiểu là ${errors['min'].min}`;
        if (errors['max']) return `Giá trị tối đa là ${errors['max'].max}`;
        return 'Dữ liệu không hợp lệ';
    }

    // ✅ Next Step với validation
    nextStep(): void {
        if (this.currentStep === 1) {
            const controls = ['fullName', 'email', 'phone', 'position'];
            if (!this.validateStep(controls)) return;
        } else if (this.currentStep === 2) {
            const controls = ['companyName', 'companyTax', 'companyAddress', 'businessType', 'companySize'];
            if (!this.validateStep(controls)) return;
        } else if (this.currentStep === 3) {
            // ✅ Validate Step 3: Products + Commission
            const productsValid = this.products.controls.every(ctrl => ctrl.valid);
            const commissionValid = this.registerForm.get('commissionType')?.valid &&
                this.registerForm.get('commissionRate')?.valid;

            if (!productsValid) {
                this.products.controls.forEach(ctrl => {
                    Object.keys((ctrl as FormGroup).controls).forEach(key => {
                        ctrl.get(key)?.markAsTouched();
                    });
                });
                return;
            }
            if (!commissionValid) {
                this.registerForm.get('commissionType')?.markAsTouched();
                this.registerForm.get('commissionRate')?.markAsTouched();
                return;
            }
        }

        this.currentStep++;
        this.stepChange.emit(this.currentStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    validateStep(controls: string[]): boolean {
        let isValid = true;
        controls.forEach(control => {
            const ctrl = this.registerForm.get(control);
            if (ctrl) {
                ctrl.markAsTouched();
                ctrl.markAsDirty();
                if (ctrl.invalid) {
                    isValid = false;
                }
            }
        });

        if (!isValid) {
            const firstInvalid = controls.find(control => {
                const ctrl = this.registerForm.get(control);
                return ctrl?.invalid;
            });
            if (firstInvalid) {
                const element = document.querySelector(`[formcontrolname="${firstInvalid}"]`);
                if (element) {
                    (element as HTMLElement).focus();
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
        return isValid;
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.stepChange.emit(this.currentStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    onSubmit(): void {
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            if (control) {
                control.markAsTouched();
                control.markAsDirty();
            }
        });

        if (this.registerForm.invalid) {
            const firstInvalid = Object.keys(this.registerForm.controls).find(key => {
                const control = this.registerForm.get(key);
                return control?.invalid;
            });
            if (firstInvalid) {
                const element = document.querySelector(`[formcontrolname="${firstInvalid}"]`);
                if (element) {
                    (element as HTMLElement).focus();
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        this.submit.emit();
    }

    getBusinessTypeLabel(value: string): string {
        const found = this.businessTypes.find(t => t.value === value);
        return found ? found.label : '---';
    }

    getCompanySizeLabel(value: string): string {
        const found = this.companySizes.find(t => t.value === value);
        return found ? found.label : '---';
    }

    getProductCategoryLabel(value: string): string {
        const found = this.productCategories.find(t => t.value === value);
        return found ? found.label : '---';
    }

    getCommissionTypeLabel(value: string): string {
        const found = this.commissionTypes.find(t => t.value === value);
        return found ? found.label : '---';
    }
}