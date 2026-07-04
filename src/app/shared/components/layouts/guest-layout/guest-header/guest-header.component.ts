import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../language-switcher/language-switcher.component';
import { AppService } from '../../../../../core/services/app.service';
import { UserRole } from '../../../../../core/models/auth.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-guest-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
    templateUrl: './guest-header.component.html',
    styleUrls: ['./guest-header.component.css']
})
export class GuestHeaderComponent implements OnInit, OnDestroy {
    showAdminButton = false;
    isLoggedIn = false;
    isAdmin = false;
    username = '';
    private keySequence: string[] = [];
    private readonly SECRET_CODE = ['a', 'd', 'm', 'i', 'n'];
    private authSubscription: Subscription | null = null;
    private timeoutId: any = null;

    constructor(
        private _appService: AppService,
        private _router: Router
    ) { }

    ngOnInit() {
        this.checkAuth();
        this.initSecretListener();
    }

    // ✅ Kiểm tra trạng thái đăng nhập
    checkAuth() {
        this.authSubscription = this._appService.auth.currentUser$.subscribe(user => {
            this.isLoggedIn = !!user;
            this.isAdmin = user?.role === UserRole.ADMIN;
            this.username = user?.username || '';
        });
    }

    // ✅ Xử lý khi bấm nút Admin
    goToAdmin() {
        if (this.isLoggedIn && this.isAdmin) {
            // ✅ Đã login + là Admin → vào thẳng Dashboard
            this._router.navigate(['/admin/dashboard']);
        } else if (this.isLoggedIn && !this.isAdmin) {
            // ✅ Đã login nhưng không phải Admin → thông báo
            // this._appService.showToast?.('Bạn không có quyền truy cập Admin!', 'error');
            alert('Bạn không có quyền truy cập Admin!');
        } else {
            // ✅ Chưa login → vào trang Admin Login
            this._router.navigate(['/admin-login']);
        }
    }

    // ✅ Secret code listener
    initSecretListener() {
        document.addEventListener('keydown', (event) => {
            const key = event?.key?.trim().toLowerCase();
            if (!key) return;

            this.keySequence.push(key);

            // Giữ tối đa 5 ký tự
            if (this.keySequence.length > 5) {
                this.keySequence.shift();
            }

            // Kiểm tra secret code "admin"
            const typed = this.keySequence.join('');
            if (typed.includes('admin')) {
                this.showAdminButton = true;
                this.keySequence = [];

                // Clear timeout cũ nếu có
                if (this.timeoutId) {
                    clearTimeout(this.timeoutId);
                }

                // Tự động ẩn sau 10 giây
                this.timeoutId = setTimeout(() => {
                    this.showAdminButton = false;
                }, 10000);
            }
        });
    }

    // ✅ Logout
    logout() {
        this._appService.auth.logout();
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        // Remove event listener
        document.removeEventListener('keydown', this.initSecretListener);
    }
}