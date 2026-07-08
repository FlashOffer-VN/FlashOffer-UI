import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        RouterLink,
        InputComponent,
        ButtonComponent
    ],
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    get f() { return this.loginForm.controls; }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.loginForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.loginForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            if (fieldName === 'username') return this._appService.instant('LOGIN.VALIDATION.USERNAME_REQUIRED');
            if (fieldName === 'password') return this._appService.instant('LOGIN.VALIDATION.PASSWORD_REQUIRED');
            return this._appService.instant('VALIDATION.REQUIRED');
        }

        if (control.errors['minlength'] && fieldName === 'password') {
            return this._appService.instant('LOGIN.VALIDATION.PASSWORD_MIN_LENGTH');
        }

        return this._appService.instant('VALIDATION.INVALID');
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;

        const credentials = {
            username: this.loginForm.value.username,
            password: this.loginForm.value.password,
            isAdmin: true
        };

        this._appService.login(credentials).subscribe({
            next: () => {
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                const errorMsg = this._appService.extractErrorMessage(error);
                this._appService.showError(errorMsg);
            }
        });
    }
}