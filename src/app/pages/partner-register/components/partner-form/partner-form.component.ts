// pages/partner-register/components/partner-form/partner-form.component.ts
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { isBrowser } from '../../../../core/utils/platform';
import { StepPersonalComponent } from '../step-personal/step-personal.component';
import { StepBusinessComponent } from '../step-business/step-business.component';
import { StepConfirmationComponent } from '../step-confirmation/step-confirmation.component';

import { PartnerRegisterService } from '../../../../core/services/partner-register.service';
import { BusinessFieldOption, BusinessFieldService } from '../../../../core/services/business-field.service';

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
        StepConfirmationComponent
    ],
    templateUrl: './partner-form.component.html',
    styleUrls: ['./partner-form.component.css']
})
export class PartnerFormComponent implements OnInit {
    @Input() currentStep = 1;
    @Input() totalSteps = 3;
    @Input() isLoading = false;
    @Output() stepChange = new EventEmitter<number>();
    @Output() submit = new EventEmitter<void>();

    registerForm!: FormGroup;
    isReferralValid = false;

    /** Danh sách lĩnh vực hoạt động lấy từ API (BusinessField — quản lý tập trung). */
    businessFields: BusinessFieldOption[] = [];

    private referralCheckTimeout: any;
    private isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private partnerService: PartnerRegisterService,
        private businessFieldService: BusinessFieldService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.watchReferralCode();
        this.loadBusinessFields();
        this.watchBusinessField();
    }

    initForm(): void {
        this.registerForm = this.fb.group({
            // Step 1: Personal Info (+ mã giới thiệu)
            fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^(0|\+84)[0-9]{9,10}$/)]],
            position: ['', [Validators.required, Validators.minLength(2)]],
            referralCode: [''],

            // Step 2: Business Info
            companyName: ['', [Validators.required, Validators.minLength(2)]],
            companyAddress: ['', [Validators.required, Validators.minLength(5)]],
            businessFieldId: [null, Validators.required],
            companySize: [null, Validators.required],
            products: this.fb.array([]),

            // Step 3: Confirmation
            agreeTerms: [false, Validators.requiredTrue],

            // Ẩn — dùng để hiển thị tên lĩnh vực trong summary
            businessFieldName: ['']
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
            description: ['']
        });
        this.products.push(productForm);
    }

    removeProduct(index: number): void {
        if (this.products.length > 1) {
            this.products.removeAt(index);
        }
    }

    loadBusinessFields(): void {
        this.businessFieldService.getActive().subscribe(fields => {
            this.businessFields = fields;
        });
    }

    getBusinessFieldName(id: string): string {
        const found = this.businessFields.find(f => f.value === id);
        return found ? found.label : '';
    }

    /** Đồng bộ tên lĩnh vực vào control ẩn để summary hiển thị được. */
    watchBusinessField(): void {
        this.registerForm.get('businessFieldId')?.valueChanges.subscribe((id: string) => {
            this.registerForm.get('businessFieldName')?.setValue(this.getBusinessFieldName(id));
        });
    }

    watchReferralCode(): void {
        this.registerForm.get('referralCode')?.valueChanges.subscribe((code: string) => {
            if (this.referralCheckTimeout) {
                clearTimeout(this.referralCheckTimeout);
            }
            if (!code || code.trim().length < 3) {
                this.isReferralValid = false;
                return;
            }
            this.referralCheckTimeout = setTimeout(() => {
                this.partnerService.checkReferralCode(code.trim()).subscribe({
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

    nextStep(): void {
        if (this.currentStep === 1) {
            const controls = ['fullName', 'email', 'phone', 'position'];
            if (!this.validateStep(controls)) {
                return;
            }
        } else if (this.currentStep === 2) {
            const controls = ['companyName', 'companyAddress', 'businessFieldId', 'companySize'];
            if (!this.validateStep(controls)) {
                return;
            }
            if (!this.productsValid()) {
                return;
            }
        }

        this.currentStep++;
        this.stepChange.emit(this.currentStep);
        if (isBrowser()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    private productsValid(): boolean {
        const valid = this.products.controls.every(ctrl => ctrl.valid);
        if (!valid) {
            this.products.controls.forEach(ctrl => {
                Object.keys((ctrl as FormGroup).controls).forEach(key => {
                    ctrl.get(key)?.markAsTouched();
                });
            });
        }
        return valid;
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
            if (firstInvalid && isBrowser()) {
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
            if (isBrowser()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    onSubmit(): void {
        if (this.isSubmitting) {
            return;
        }

        // Mark all fields as touched
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

            if (firstInvalid === 'agreeTerms' && isBrowser()) {
                const termsElement = document.querySelector('.terms-group');
                if (termsElement) {
                    termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    termsElement.classList.add('highlight-error');
                    setTimeout(() => termsElement.classList.remove('highlight-error'), 2000);
                }
            }
            return;
        }

        this.isSubmitting = true;
        this.submit.emit();

        // Reset sau 2s để cho phép submit lại nếu cần
        setTimeout(() => {
            this.isSubmitting = false;
        }, 2000);
    }
}