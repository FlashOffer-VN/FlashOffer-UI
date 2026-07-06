// shared/components/layouts/guest-layout/guest-header/guest-header.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppService } from '../../../../../core/services/app.service';
import { UserRole } from '../../../../../core/models/auth.model';
import { LanguageSwitcherComponent } from '../../../language-switcher/language-switcher.component';

@Component({
    selector: 'app-guest-header',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        TranslateModule,
        LanguageSwitcherComponent
    ],
    templateUrl: './guest-header.component.html',
    styleUrls: ['./guest-header.component.css']
})
export class GuestHeaderComponent implements OnInit, OnDestroy {
    // ✅ Secret Admin Button
    showAdminButton = false;

    // ✅ Auth state
    isLoggedIn = false;
    isAdmin = false;
    username = '';

    // ✅ Secret code
    private keySequence: string[] = [];
    private readonly SECRET_CODE = ['a', 'd', 'm', 'i', 'n'];
    private authSubscription: Subscription | null = null;
    private timeoutId: any = null;

    constructor(
        private _appService: AppService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.checkAuth();
    }

    // ✅ Kiểm tra trạng thái đăng nhập
    checkAuth(): void {
        this.authSubscription = this._appService.auth.currentUser$.subscribe(user => {
            this.isLoggedIn = !!user;
            this.isAdmin = user?.role?.toLowerCase() === UserRole.ADMIN.toLowerCase();
            this.username = user?.username || '';
        });
    }

    // ✅ Secret code listener - gõ "admin" để hiện nút
    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
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
    }

    // ✅ Xử lý khi bấm nút Admin (đã gộp, không duplicate)
    goToAdmin(): void {
        if (this.isLoggedIn && this.isAdmin) {
            // Đã login + là Admin → vào thẳng Dashboard
            this._router.navigate(['/admin/dashboard']);
        } else if (this.isLoggedIn && !this.isAdmin) {
            // ✅ Dùng translate cho message error
            this._appService.showError(
                this._appService.instant('ERROR.ADMIN_ACCESS_DENIED')
            );
        } else {
            // Chưa login → vào trang Admin Login
            this._router.navigate(['/admin-login']);
        }
    }

    // ✅ Logout
    logout(): void {
        this._appService.auth.logout();
    }

    // ✅ Helper để lấy text đã dịch trong HTML (nếu cần)
    getTranslated(key: string): string {
        return this._appService.instant(key);
    }

    ngOnDestroy(): void {
        // Cleanup subscriptions
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }

        // Clear timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}