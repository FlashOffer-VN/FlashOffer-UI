// pages/partner-register/components/partner-form/partner-form.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { isBrowser } from '../../../../core/utils/platform';
import { StepPersonalComponent } from '../step-personal/step-personal.component';
import { StepBusinessComponent } from '../step-business/step-business.component';
import { StepSalesComponent } from '../step-sales/step-sales.component';
import { StepConfirmationComponent } from '../step-confirmation/step-confirmation.component';

import { PartnerRegisterService } from '../../../../core/services/partner-register.service';

@Component({
    selector: 'app-partner-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        ButtonComponent,
        StepPersonalComponent,
        StepBusinessComponent,
        StepSalesComponent,
        StepConfirmationComponent
    ],
    templateUrl: './partner-form.component.html',
    styleUrls: ['./partner-form.component.css']
})
export class PartnerFormComponent implements OnInit {
    @Input() currentStep = 1;
    @Input() totalSteps = 4;
    @Input() isLoading = false;
    @Output() stepChange = new EventEmitter<number>();
    @Output() submit = new EventEmitter<void>();

    registerForm!: FormGroup;
    isReferralValid = false;
    private referralCheckTimeout: any;
    private isSubmitting = false;

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
            businessType: [null, Validators.required],
            companyWebsite: ['', Validators.pattern(/^https?:\/\/.+\..+$/)],
            companySize: [null, Validators.required],

            // Step 3: Sales Info
            products: this.fb.array([]),
            commissionType: [1, Validators.required],
            commissionRate: ['', [Validators.min(0), Validators.max(100)]],
            minOrderValue: [''],
            maxCommission: [''],
            specialConditions: [''],

            // Step 4: Confirmation
            referralCode: [''],
            note: [''],
            agreeTerms: [false, Validators.requiredTrue]
        });

        // Add default product
        this.addProduct();
    }

    get products(): FormArray {
        return this.registerForm.get('products') as FormArray;
    }

    addProduct(): void {
        const productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            category: [null, Validators.required],
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
                        this.isReferralValid = response.success;
                    },
                    error: () => {
                        this.isReferralValid = false;
                    }
                });
            }, 1000);
        });
    }

    // ✅ THÊM DEBUG
    nextStep(): void {
        // console.log('🔍 Next Step Called - Current Step:', this.currentStep);

        if (this.currentStep === 1) {
            const controls = ['fullName', 'email', 'phone', 'position'];
            // console.log('📋 Validating Step 1 controls:', controls);
            if (!this.validateStep(controls)) {
                // console.log('❌ Step 1 validation failed');
                return;
            }
            // console.log('✅ Step 1 validation passed');
        } else if (this.currentStep === 2) {
            const controls = ['companyName', 'companyTax', 'companyAddress', 'businessType', 'companySize'];
            // console.log('📋 Validating Step 2 controls:', controls);
            // Log giá trị hiện tại của các field
            controls.forEach(control => {
                const value = this.registerForm.get(control)?.value;
                const valid = this.registerForm.get(control)?.valid;
                // console.log(`  🔍 ${control}: value = ${value}, valid = ${valid}`);
            });
            if (!this.validateStep(controls)) {
                // console.log('❌ Step 2 validation failed');
                return;
            }
            // console.log('✅ Step 2 validation passed');
        } else if (this.currentStep === 3) {
            // console.log('📋 Validating Step 3...');
            const productsValid = this.products.controls.every(ctrl => ctrl.valid);
            const commissionValid = this.registerForm.get('commissionType')?.valid &&
                this.registerForm.get('commissionRate')?.valid;

            // console.log(`  🔍 Products valid: ${productsValid}`);
            // console.log(`  🔍 Commission valid: ${commissionValid}`);

            if (!productsValid) {
                this.products.controls.forEach(ctrl => {
                    Object.keys((ctrl as FormGroup).controls).forEach(key => {
                        ctrl.get(key)?.markAsTouched();
                    });
                });
                // console.log('❌ Products invalid');
                return;
            }
            if (!commissionValid) {
                this.registerForm.get('commissionType')?.markAsTouched();
                this.registerForm.get('commissionRate')?.markAsTouched();
                // console.log('❌ Commission invalid');
                return;
            }
            // console.log('✅ Step 3 validation passed');
        }

        this.currentStep++;
        // console.log(`➡️ Moving to step ${this.currentStep}`);
        this.stepChange.emit(this.currentStep);
        if (isBrowser()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
                    // console.log(`❌ ${control} is invalid:`, ctrl.errors);
                }
            }
        });

        // console.log(`📊 Validation result: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

        if (!isValid) {
            const firstInvalid = controls.find(control => {
                const ctrl = this.registerForm.get(control);
                return ctrl?.invalid;
            });
            if (firstInvalid) {
                // console.log(`🎯 First invalid field: ${firstInvalid}`);
                if (isBrowser()) {
                    const element = document.querySelector(`[formcontrolname="${firstInvalid}"]`);
                    if (element) {
                        (element as HTMLElement).focus();
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // console.log(`⚠️ Cannot find element for: ${firstInvalid}`);
                    }
                }
            }
        }
        return isValid;
    }

    prevStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.stepChange.emit(this.currentStep);
            if (isBrowser()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    // partner-form/partner-form.component.ts
    onSubmit(): void {

        if (this.isSubmitting) {
            // console.log('⏳ Already submitting, skip');
            return;
        }

        // console.log('🔥 SUBMIT TRIGGERED!');
        // console.log('📊 Form valid?', this.registerForm.valid);
        // console.log('📊 AgreeTerms value:', this.registerForm.get('agreeTerms')?.value);
        // console.log('📊 AgreeTerms valid:', this.registerForm.get('agreeTerms')?.valid);

        // ✅ Mark all fields as touched
        Object.keys(this.registerForm.controls).forEach(key => {
            const control = this.registerForm.get(key);
            if (control) {
                control.markAsTouched();
                control.markAsDirty();
            }
        });

        // ✅ KIỂM TRA INVALID - PHẢI RETURN
        if (this.registerForm.invalid) {
            // console.log('❌ Form is INVALID - BLOCKING submit');

            // Scroll đến first invalid field
            const firstInvalid = Object.keys(this.registerForm.controls).find(key => {
                const control = this.registerForm.get(key);
                return control?.invalid;
            });

            if (firstInvalid === 'agreeTerms' && isBrowser()) {
                const termsElement = document.querySelector('.terms-group');
                if (termsElement) {
                    termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    termsElement.classList.add('highlight-error');
                    setTimeout(() => termsElement.classList.remove('highlight-error'), 2000);
                }
            }

            // ✅ QUAN TRỌNG: PHẢI RETURN ĐỂ KHÔNG GỌI EMIT
            return;
        }

        // console.log('✅ Form is VALID - Emitting submit');
        this.isSubmitting = true;
        this.submit.emit();

        // Reset sau 2s để cho phép submit lại nếu cần
        setTimeout(() => {
            this.isSubmitting = false;
        }, 2000);
    }
}