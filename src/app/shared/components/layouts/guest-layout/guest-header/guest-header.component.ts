// shared/components/layouts/guest-layout/guest-header/guest-header.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AppService } from '../../../../../core/services/app.service';
import { UserRole } from '../../../../../core/models/auth.model';
import { isBrowser } from '../../../../../core/utils/platform';
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

    // ✅ Mobile menu
    mobileMenuOpen = false;

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

    // ✅ Lấy tên viết tắt
    getInitials(name: string): string {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // ✅ Secret code listener - gõ "admin" để hiện nút
    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const key = event?.key?.trim().toLowerCase();
        if (!key) return;

        this.keySequence.push(key);

        if (this.keySequence.length > 5) {
            this.keySequence.shift();
        }

        const typed = this.keySequence.join('');
        if (typed.includes('admin')) {
            this.showAdminButton = true;
            this.keySequence = [];

            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }

            this.timeoutId = setTimeout(() => {
                this.showAdminButton = false;
            }, 10000);
        }
    }

    // ✅ Toggle mobile menu
    toggleMobileMenu(): void {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        if (!isBrowser()) return;
        if (this.mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    // ✅ Close mobile menu
    closeMobileMenu(): void {
        this.mobileMenuOpen = false;
        if (!isBrowser()) return;
        document.body.style.overflow = '';
    }

    // ✅ Go to Admin
    goToAdmin(): void {
        this.closeMobileMenu();
        if (this.isLoggedIn && this.isAdmin) {
            this._router.navigate(['/admin/dashboard']);
        } else if (this.isLoggedIn && !this.isAdmin) {
            this._appService.showError(
                this._appService.trans('ERROR.ADMIN_ACCESS_DENIED')
            );
        } else {
            this._router.navigate(['/admin-login']);
        }
    }

    // ✅ Go to Profile
    goToProfile(): void {
        if (this.isLoggedIn) {
            if (this.isAdmin) {
                this._router.navigate(['/admin/dashboard']);
            } else {
                this._router.navigate(['/user/profile']);
            }
        }
    }

    // ✅ Logout
    logout(): void {
        this.closeMobileMenu();
        this._appService.auth.logout();
    }

    ngOnDestroy(): void {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (isBrowser()) {
            document.body.style.overflow = '';
        }
    }
}