// shared/components/layouts/user-layout/user-sidebar/user-sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../../../../core/services/app.service';

@Component({
    selector: 'app-user-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './user-sidebar.component.html',
    styleUrls: ['./user-sidebar.component.css']
})
export class UserSidebarComponent {
    @Input() isOpen = true;
    @Output() toggle = new EventEmitter<void>();

    menuItems: MenuItem[] = [
        { path: '/user/profile', icon: 'fa-solid fa-id-card', label: 'USER.SIDEBAR.PROFILE' },
        { path: '/user/my-group-buying', icon: 'fa-solid fa-people-group', label: 'USER.SIDEBAR.MY_GROUP_BUYING' },
        { path: '/user/my-referral', icon: 'fa-solid fa-share-nodes', label: 'USER.SIDEBAR.MY_REFERRAL' },
        { path: '/user/my-requests', icon: 'fa-solid fa-file-lines', label: 'USER.SIDEBAR.MY_REQUESTS' },
        { path: '/user/change-credentials', icon: 'fa-solid fa-key', label: 'USER.SIDEBAR.ACCOUNT' },
        { path: '/', icon: 'fa-solid fa-house', label: 'USER.SIDEBAR.BACK_TO_SITE' },
    ];

    constructor(private _appService: AppService) { }

    toggleSidebar(): void {
        this.toggle.emit();
    }

    /** Đăng xuất khỏi khu vực thành viên — có dialog xác nhận (bỏ confirm() mặc định của trình duyệt) */
    logout(): void {
        this._appService.modal.confirm({
            title: this._appService.trans('USER.LOGOUT_TITLE'),
            message: this._appService.trans('USER.LOGOUT_MESSAGE'),
            confirmText: this._appService.trans('USER.SIDEBAR.LOGOUT'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL'),
            confirmVariant: 'danger'
        }).then(confirmed => {
            if (confirmed) {
                this._appService.auth.logout();
            }
        });
    }
}

interface MenuItem {
    path: string;
    icon: string;
    label: string;
}
