// src/app/pages/register-ctv/register-ctv.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../core/services/app.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { SelectComponent } from '../../shared/components/select/select.component';
import { CtvRegistrationRequest } from '../../core/models/ctv-registration.model';

@Component({
    selector: 'app-register-ctv',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
    templateUrl: './register-ctv.component.html',
    styleUrls: ['./register-ctv.component.css']
})
export class RegisterCtvComponent implements OnInit {
    ctvForm!: FormGroup;
    isSubmitting = false;
    salesChannels: any[] = [];

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
            experience: ['']
        });
    }

    get f() { return this.ctvForm.controls; }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.ctvForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.ctvForm.get(fieldName);
        if (!control || !control.errors) return '';
        if (control.errors['required']) {
            return this._appService.instant('CTV_FORM.ERROR_REQUIRED');
        }
        if (control.errors['minlength']) {
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

    onSubmit(): void {
        if (this.ctvForm.invalid) {
            this.ctvForm.markAllAsTouched();
            this._appService.showError(this._appService.instant('CTV_FORM.ERROR_FORM_INVALID'));
            return;
        }

        this.isSubmitting = true;
        const request: CtvRegistrationRequest = this.ctvForm.value;

        this._appService.ctvRegistration.register(request).subscribe({
            next: (response) => {
                this.isSubmitting = false;
                this._appService.showSuccess(this._appService.instant('CTV_FORM.SUCCESS_REGISTER'));
                this.ctvForm.reset();
            },
            error: (error) => {
                this.isSubmitting = false;
                const errorMsg = error.errors?.[0] || error.message ||
                    this._appService.instant('CTV_FORM.ERROR_REGISTER_FAILED');
                this._appService.showError(errorMsg);
            }
        });
    }
}