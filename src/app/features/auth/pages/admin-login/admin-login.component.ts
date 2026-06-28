import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../../../core/services/app.service';
import { UserRole } from '../../../../core/models/auth.model';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink],
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
    loginForm: FormGroup;
    isLoading = false;
    errorMessage = '';

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

    get f() { return this.loginForm.controls; }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const { username, password } = this.loginForm.value;

        this._appService.auth.login({ username, password }).subscribe({
            next: (response) => {
                this.isLoading = false;

                // ✅ Lấy role từ response.data
                const role = response?.data?.role || '';
                const user = this._appService.auth.getCurrentUser();

                // ✅ Nếu là admin -> về admin dashboard
                if (role?.toLowerCase() === 'admin' || user?.role === UserRole.ADMIN || user?.role === 'Admin') {
                    // Gọi getMe để lấy thông tin đầy đủ
                    this._appService.auth.getMe().subscribe({
                        next: () => {
                            this.router.navigate(['/admin/dashboard']);
                        },
                        error: () => {
                            // Vẫn cho vào dù getMe fail
                            this.router.navigate(['/admin/dashboard']);
                        }
                    });
                } else {
                    // ❌ Không phải admin
                    this.errorMessage = this._appService.instant('ADMIN_LOGIN.ERROR.NOT_ADMIN');
                    this._appService.auth.logout();
                }
            },
            error: (err) => {
                this.isLoading = false;

                let errorMsg = this._appService.instant('ADMIN_LOGIN.ERROR.INVALID_CREDENTIALS');

                if (err.error?.errors && Array.isArray(err.error.errors) && err.error.errors.length > 0) {
                    errorMsg = err.error.errors[0];
                } else if (err.error?.message) {
                    errorMsg = err.error.message;
                }

                this.errorMessage = errorMsg;
            }
        });
    }
}