// shared/components/layouts/user-layout/user-layout.component.ts
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { UserSidebarComponent } from './user-sidebar/user-sidebar.component';
import { UserHeaderComponent } from './user-header/user-header.component';
import { AppService } from '../../../../core/services/app.service';
import { isBrowser } from '../../../../core/utils/platform';

@Component({
    selector: 'app-user-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        UserSidebarComponent,
        UserHeaderComponent
    ],
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.css', './user-layout.component.mobile.css']
})
export class UserLayoutComponent implements OnInit, OnDestroy {
    isSidebarOpen = true;
    logoPath = 'logo-full-vn.svg';
    private langSubscription: Subscription | null = null;

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        // Màn hình nhỏ: mặc định thu gọn sidebar để nội dung không bị chèn ép.
        if (isBrowser() && window.matchMedia('(max-width: 1023px)').matches) {
            this.isSidebarOpen = false;
        }

        this.updateLogo();

        this.langSubscription = this._appService.onLanguageChange().subscribe(() => {
            this.updateLogo();
        });
    }

    private updateLogo(): void {
        const lang = this._appService.getCurrentLang();
        this.logoPath = lang === 'en'
            ? 'logo-full-en.svg'
            : 'logo-full-vn.svg';
    }

    /** Đóng ngăn kéo bằng phím Esc — chỉ ở chế độ ngăn kéo (≤1023px). */
    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.isSidebarOpen && isBrowser() && window.matchMedia('(max-width: 1023px)').matches) {
            this.toggleSidebar();
        }
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    ngOnDestroy(): void {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }
}
