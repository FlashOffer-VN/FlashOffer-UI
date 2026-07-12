// src/app/pages/register-ctv/register-ctv.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { CtvRegistrationRequest, SalesChannelOption } from '@core/models/ctv-registration.model';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

@Component({
    selector: 'app-register-ctv',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        NgSelectWrapperComponent,
        RouterLink
    ],
    templateUrl: './register-ctv.component.html',
    styleUrls: ['./register-ctv.component.css']
})
export class RegisterCtvComponent implements OnInit {
    ctvForm!: FormGroup;
    isSubmitting = false;
    salesChannels: SalesChannelOption[] = [];
    touched = false;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService
    ) { }

    ngOnInit(): void {
        this.salesChannels = this._appService.ctvRegistration.getSalesChannels();
        this.ctvForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)]],
            zalo: [''],
            email: ['', [Validators.required, Validators.email]],
            salesChannel: [null, Validators.required],
            experience: [''],
            agreeTerms: [false, [Validators.requiredTrue]]
        });
    }

    get f() {
        return this.ctvForm.controls;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.ctvForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.ctvForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            const fieldMap: Record<string, string> = {
                fullName: this._appService.instant('CTV_FORM.ERROR_FULLNAME_REQUIRED'),
                phone: this._appService.instant('CTV_FORM.ERROR_PHONE_REQUIRED'),
                email: this._appService.instant('CTV_FORM.ERROR_EMAIL_REQUIRED'),
                salesChannel: this._appService.instant('CTV_FORM.ERROR_SALES_CHANNEL_REQUIRED'),
                agreeTerms: this._appService.instant('CTV_FORM.ERROR_AGREE_TERMS_REQUIRED')
            };
            return fieldMap[fieldName] || this._appService.instant('CTV_FORM.ERROR_REQUIRED');
        }

        if (control.errors['requiredTrue']) {
            return this._appService.instant('CTV_FORM.ERROR_AGREE_TERMS_REQUIRED');
        }

        if (control.errors['minlength']) {
            if (fieldName === 'fullName') {
                return this._appService.instant('CTV_FORM.ERROR_FULLNAME_MINLENGTH');
            }
            return this._appService.instant('CTV_FORM.ERROR_MINLENGTH');
        }

        if (control.errors['pattern']) {
            if (fieldName === 'phone') {
                return this._appService.instant('CTV_FORM.ERROR_PHONE_INVALID');
            }
            return this._appService.instant('CTV_FORM.ERROR_INVALID');
        }

        if (control.errors['email']) {
            return this._appService.instant('CTV_FORM.ERROR_EMAIL_INVALID');
        }

        return '';
    }

    get formProgress(): number {
        const controls = this.ctvForm.controls;
        const requiredFields = ['fullName', 'phone', 'email', 'salesChannel', 'agreeTerms'];
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

    onSubmit(): void {
        if (this.ctvForm.invalid) {
            this.ctvForm.markAllAsTouched();
            this.touched = true;
            this._appService.showError(this._appService.instant('CTV_FORM.ERROR_FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const request: CtvRegistrationRequest = this.ctvForm.value;

        this._appService.ctvRegistration.register(request).subscribe({
            next: (response: any) => {
                this.isSubmitting = false;
                this._appService.showSuccess(this._appService.instant('CTV_FORM.SUCCESS_REGISTER'));

                // ✅ Reset form
                this.ctvForm.reset();

                // ✅ Reset touched state
                this.touched = false;

                // ✅ Reset form state (mark as pristine, untouched)
                this.ctvForm.markAsPristine();
                this.ctvForm.markAsUntouched();

                // ✅ Đặt lại giá trị mặc định cho salesChannel nếu cần
                this.ctvForm.patchValue({
                    salesChannel: null
                });
            },
            error: (error: any) => {
                this.isSubmitting = false;
                const errorMsg = error?.error?.message || this._appService.instant('CTV_FORM.ERROR_REGISTER_FAILED');
                this._appService.showError(errorMsg);
            }
        });
    }
}