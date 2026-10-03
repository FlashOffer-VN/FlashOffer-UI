// shared/components/layouts/admin-layout/admin-sidebar/admin-sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../../../../core/services/app.service';
import { Permission } from '../../../../../core/models/permission.model';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
    @Input() isOpen = true;
    @Output() toggle = new EventEmitter<void>();

    /** Mỗi mục menu gắn mã quyền — tài khoản thiếu quyền sẽ không thấy mục đó. */
    menuItems: MenuItem[] = [
        { path: '/admin/dashboard', icon: 'fa-solid fa-house', label: 'Dashboard', permission: Permission.ViewDashboard },
        { path: '/admin/admin-crm', icon: 'fa-solid fa-chart-pie', label: 'ADMIN.SIDEBAR.CRM', permission: Permission.ViewCrmDashboard },
        { path: '/admin/referral-stats', icon: 'fa-solid fa-share-nodes', label: 'ADMIN.SIDEBAR.REFERRAL_STATS', permission: Permission.ViewReferralStats },
        { path: '/admin/offers', icon: 'fa-solid fa-tags', label: 'ADMIN.SIDEBAR.OFFERS', permission: Permission.ViewOfferRequests },
        { path: '/admin/purchase-requests', icon: 'fa-solid fa-cart-shopping', label: 'ADMIN.SIDEBAR.PURCHASE_REQUESTS', permission: Permission.ViewPurchaseRequests },
        { path: '/admin/group-buying', icon: 'fa-solid fa-people-group', label: 'ADMIN.SIDEBAR.GROUP_BUYING', permission: Permission.ViewGroupBuyingRequests },
        { path: '/admin/groups', icon: 'fa-solid fa-people-roof', label: 'ADMIN.SIDEBAR.GROUPS', permission: Permission.ViewGroups },
        { path: '/admin/users', icon: 'fa-solid fa-user-gear', label: 'ADMIN.SIDEBAR.USERS', permission: Permission.ViewUsers },
        { path: '/admin/collaborator', icon: 'fa-solid fa-users', label: 'ADMIN.SIDEBAR.COLLABORATOR', permission: Permission.ViewCollaborators },
        { path: '/admin/social-posts', icon: 'fa-solid fa-clipboard-check', label: 'ADMIN.SIDEBAR.SOCIAL_POSTS', permission: Permission.ViewSocialPosts },
        { path: '/admin/partner', icon: 'fa-solid fa-building', label: 'ADMIN.SIDEBAR.PARTNER', permission: Permission.ViewPartners },
        { path: '/admin/payouts', icon: 'fa-solid fa-money-bill-transfer', label: 'ADMIN.SIDEBAR.PAYOUTS', permission: Permission.ViewPayouts },
        { path: '/admin/bank-accounts', icon: 'fa-solid fa-building-columns', label: 'ADMIN.SIDEBAR.BANK_ACCOUNTS', permission: Permission.VerifyBankAccounts },
        { path: '/admin/settings', icon: 'fa-solid fa-cog', label: 'ADMIN.SIDEBAR.SETTINGS', permission: Permission.ViewSystemSettings },
        { path: '/', icon: 'fa-solid fa-arrow-right-from-bracket', label: 'ADMIN.SIDEBAR.BACK_TO_SITE', permission: null },
    ];

    constructor(private _appService: AppService) { }

    /** Menu theo quyền của tài khoản đang đăng nhập. */
    get visibleMenuItems(): MenuItem[] {
        return this.menuItems.filter(item => !item.permission || this._appService.permissionService.has(item.permission));
    }

    toggleSidebar(): void {
        this.toggle.emit();
    }

    /** Đăng xuất khỏi trang quản trị — có dialog xác nhận (bỏ confirm() mặc định của trình duyệt) */
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

interface MenuItem {
    path: string;
    icon: string;
    label: string;
    /** Mã quyền cần có để thấy mục này; null = luôn hiển thị. */
    permission: Permission | null;
}