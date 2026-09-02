// src/app/features/auth/pages/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        RouterLink,
        InputComponent,
        ButtonComponent
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    isLoading = false;
    showPassword = false;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    ngOnInit(): void {
        // ✅ Nếu đã login thì redirect về home
        if (this._appService.isAuthenticated()) {
            const user = this._appService.getCurrentUser();
            if (user?.role === 'ADMIN') {
                this.router.navigate(['/admin/dashboard']);
            } else {
                this.router.navigate(['/social']);
            }
        }
    }

    get f() {
        return this.loginForm.controls;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.loginForm.get(fieldName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(fieldName: string): string {
        const control = this.loginForm.get(fieldName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) {
            if (fieldName === 'username') return this._appService.trans('LOGIN.VALIDATION.USERNAME_REQUIRED');
            if (fieldName === 'password') return this._appService.trans('LOGIN.VALIDATION.PASSWORD_REQUIRED');
            return this._appService.trans('VALIDATION.REQUIRED');
        }

        if (control.errors['minlength'] && fieldName === 'password') {
            return this._appService.trans('LOGIN.VALIDATION.PASSWORD_MIN_LENGTH');
        }

        return this._appService.trans('VALIDATION.INVALID');
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
            isAdmin: false  // ✅ User thường
        };

        this._appService.login(credentials).subscribe({
            next: () => {
                this.isLoading = false;
                // ✅ AuthService tự redirect dựa trên role
            },
            error: (error) => {
                this.isLoading = false;
                const errorMsg = this._appService.extractErrorMessage(error);
                this._appService.showError(errorMsg);
            }
        });
    }
}