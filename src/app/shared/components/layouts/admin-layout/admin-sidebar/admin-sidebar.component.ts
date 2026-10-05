// shared/components/layouts/admin-layout/admin-sidebar/admin-sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AppService } from '../../../../../core/services/app.service';
import { Permission } from '../../../../../core/models/permission.model';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.css', './admin-sidebar.component.mobile.css']
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
        { path: '/admin/partner', icon: 'fa-solid fa-building', label: 'ADMIN.SIDEBAR.PARTNER', permission: Permission.ViewPartners },
        { path: '/admin/social-posts', icon: 'fa-solid fa-clipboard-check', label: 'ADMIN.SIDEBAR.SOCIAL_POSTS', permission: Permission.ViewSocialPosts },
        { path: '/admin/revenue', icon: 'fa-solid fa-chart-line', label: 'ADMIN.SIDEBAR.REVENUE', permission: Permission.ViewTransactionRevenue },
        { path: '/admin/revenue/settings', icon: 'fa-solid fa-percent', label: 'ADMIN.SIDEBAR.REVENUE_SETTINGS', permission: Permission.ManageRevenueConfig },
        { path: '/admin/payouts', icon: 'fa-solid fa-money-bill-transfer', label: 'ADMIN.SIDEBAR.PAYOUTS', permission: Permission.ViewPayouts },
        { path: '/admin/bank-accounts', icon: 'fa-solid fa-building-columns', label: 'ADMIN.SIDEBAR.BANK_ACCOUNTS', permission: Permission.VerifyBankAccounts },
        // Mục Cài đặt hiện khi tài khoản mở được ít nhất một mục bên trong; không có mục nào thì ẩn luôn.
        {
            path: '/admin/settings', icon: 'fa-solid fa-cog', label: 'ADMIN.SIDEBAR.SETTINGS',
            permission: [
                Permission.ViewSystemSettings,
                Permission.ViewPermissions,
                Permission.ViewCommissionConfigs,
                Permission.ManageMembershipTiers,
                Permission.ViewPayouts,
                Permission.ViewFullAuditLogs,
                Permission.ViewEntityAuditLogs,
                Permission.ViewAuthAuditLogs
            ]
        },
        // Danh mục/cấu hình dùng chung (lĩnh vực hoạt động) — đặt cùng nhóm cấu hình với Settings.
        { path: '/admin/business-fields', icon: 'fa-solid fa-layer-group', label: 'ADMIN.BUSINESS_FIELDS.TITLE', permission: Permission.ViewBusinessFields },
        { path: '/', icon: 'fa-solid fa-arrow-right-from-bracket', label: 'ADMIN.SIDEBAR.BACK_TO_SITE', permission: null },
    ];

    /**
     * Nhóm menu cho gọn sidebar; mục nào không thuộc nhóm nào sẽ hiện riêng ở cuối.
     * Nhóm rỗng (tài khoản không có quyền nào bên trong) tự ẩn.
     */
    menuGroups: { key: string; paths: string[] }[] = [
        { key: 'ADMIN.SIDEBAR.GROUP_OVERVIEW', paths: ['/admin/dashboard', '/admin/admin-crm', '/admin/referral-stats'] },
        { key: 'ADMIN.SIDEBAR.GROUP_SALES', paths: ['/admin/offers', '/admin/purchase-requests', '/admin/group-buying', '/admin/groups'] },
        { key: 'ADMIN.SIDEBAR.GROUP_USERS', paths: ['/admin/users', '/admin/collaborator', '/admin/partner', '/admin/social-posts'] },
        { key: 'ADMIN.SIDEBAR.GROUP_FINANCE', paths: ['/admin/revenue', '/admin/revenue/settings', '/admin/payouts', '/admin/bank-accounts'] },
        { key: 'ADMIN.SIDEBAR.GROUP_SYSTEM', paths: ['/admin/settings', '/admin/business-fields'] }
    ];

    /** Nhóm người dùng bấm mở; nhóm đang chứa trang hiện tại luôn mở. */
    expandedGroup = '';

    constructor(
        private _appService: AppService,
        private _router: Router
    ) { }

    /** Menu sau khi lọc quyền, chia theo nhóm; mục lẻ gom vào một nhóm không có tiêu đề. */
    get visibleMenuGroups(): { key: string; items: MenuItem[] }[] {
        const visible = this.visibleMenuItems;
        const groups = this.menuGroups
            .map(group => ({ key: group.key, items: visible.filter(item => group.paths.includes(item.path)) }))
            .filter(group => group.items.length > 0);

        const groupedPaths = this.menuGroups.flatMap(group => group.paths);
        const loose = visible.filter(item => !groupedPaths.includes(item.path));
        if (loose.length > 0) groups.push({ key: '', items: loose });

        return groups;
    }

    /** Nhóm đang chứa trang hiện tại. */
    get activeGroupKey(): string {
        const url = this._router.url;
        return this.menuGroups.find(group => group.paths.some(path => url.startsWith(path)))?.key ?? '';
    }

    isGroupExpanded(key: string): boolean {
        return this.expandedGroup === key || this.activeGroupKey === key;
    }

    toggleGroup(key: string): void {
        this.expandedGroup = this.expandedGroup === key ? '' : key;
    }

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
    /** Mã quyền cần có để thấy mục này; mảng là "một trong các quyền"; null = luôn hiển thị. */
    permission: Permission | Permission[] | null;
}