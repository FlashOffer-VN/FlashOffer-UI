// shared/components/layouts/admin-layout/admin-header/admin-header.component.ts
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { BrandLogoComponent } from '@shared/components/brand-logo/brand-logo.component';
import { AppService } from '../../../../../core/services/app.service';

@Component({
    selector: 'app-admin-header',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, BrandLogoComponent],
    templateUrl: './admin-header.component.html',
    styleUrls: ['./admin-header.component.css', './admin-header.component.mobile.css']
})
export class AdminHeaderComponent {
    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(private _appService: AppService) { }

    get userInitial(): string {
        const user = this._appService.auth.getCurrentUser();
        return user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'A';
    }

    get userName(): string {
        const user = this._appService.auth.getCurrentUser();
        return user?.fullName || user?.username || 'Admin';
    }

    onToggleSidebar(): void {
        this.toggleSidebar.emit();
    }

    /** Đăng xuất khỏi trang quản trị — có dialog xác nhận */
    logout(): void {
        this._appService.modal.confirm({
            title: this._appService.trans('ADMIN.LOGOUT_TITLE'),
            message: this._appService.trans('ADMIN.LOGOUT_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.SIDEBAR.LOGOUT'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL'),
            confirmVariant: 'danger'
        }).then(confirmed => {
            if (confirmed) {
                this._appService.auth.logoutToAdmin();
            }
        });
    }
}