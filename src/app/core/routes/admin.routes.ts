// src/app/core/routes/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminGuard, CredentialsGuard, PermissionGuard } from '@core/guards';
import { Permission } from '@core/models/permission.model';
import { AdminLayoutComponent } from '@shared/components/layouts/admin-layout/admin-layout.component';

/** Route cho quản trị viên (layout admin, yêu cầu role Admin). */
export const adminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard, CredentialsGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('@pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'admin-crm', loadComponent: () => import('@pages/admin/crm/admin-crm.component').then(m => m.AdminCrmComponent) },
            // Thống kê tình hình giới thiệu theo mã chia sẻ của cộng tác viên
            { path: 'referral-stats', loadComponent: () => import('@pages/admin/referral-stats/referral-stats.component').then(m => m.AdminReferralStatsComponent) },
            { path: 'offers', loadComponent: () => import('@pages/admin/offers/admin-offers.component').then(m => m.AdminOffersComponent) },
            { path: 'offers/:id', loadComponent: () => import('@pages/admin/offers/detail/offer-detail.component').then(m => m.AdminOfferDetailComponent) },
            // Purchase Request Management
            { path: 'purchase-requests', loadComponent: () => import('@pages/admin/purchase-requests/purchase-request-list.component').then(m => m.AdminPurchaseRequestListComponent) },
            { path: 'purchase-requests/:id', loadComponent: () => import('@pages/admin/purchase-requests/detail/purchase-request-detail.component').then(m => m.AdminPurchaseRequestDetailComponent) },
            // Group Buying Management
            { path: 'group-buying', loadComponent: () => import('@pages/admin/group-buying/group-buying-list.component').then(m => m.AdminGroupBuyingListComponent) },
            { path: 'groups', loadComponent: () => import('@pages/admin/groups/group-list.component').then(m => m.AdminGroupListComponent) },
            // Quản lý lĩnh vực hoạt động — danh mục dùng chung cho công ty và hồ sơ CTV/đối tác
            { path: 'business-fields', canActivate: [PermissionGuard], data: { permission: [Permission.ViewBusinessFields] },
              loadComponent: () => import('@pages/admin/business-fields/business-field-list.component').then(m => m.AdminBusinessFieldListComponent) },
            { path: 'groups/:id', loadComponent: () => import('@pages/admin/groups/detail/group-detail.component').then(m => m.AdminGroupDetailComponent) },
            { path: 'group-buying/:id', loadComponent: () => import('@pages/admin/group-buying/detail/group-buying-detail.component').then(m => m.AdminGroupBuyingDetailComponent) },
            { path: 'settings', canActivate: [PermissionGuard], data: { permission: [
                Permission.ViewSystemSettings,
                Permission.ViewPermissions,
                Permission.ViewCommissionConfigs,
                Permission.ManageMembershipTiers,
                Permission.ViewPayouts,
                Permission.ViewFullAuditLogs,
                Permission.ViewEntityAuditLogs,
                Permission.ViewAuthAuditLogs
            ] },
              loadComponent: () => import('@pages/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
            // Cấu hình thuế và cách hiểu doanh thu, dùng chung cho mọi giao dịch
            { path: 'revenue/settings', canActivate: [PermissionGuard], data: { permission: Permission.ManageRevenueConfig },
                loadComponent: () => import('@pages/admin/revenue/revenue-settings.component').then(m => m.AdminRevenueSettingsComponent) },
            // Duyệt yêu cầu rút hoa hồng sớm và các lần chi trả theo kỳ
            { path: 'revenue', canActivate: [PermissionGuard], data: { permission: Permission.ViewTransactionRevenue },
                loadComponent: () => import('@pages/admin/revenue/revenue-list.component').then(m => m.AdminRevenueListComponent) },
            { path: 'payouts', canActivate: [PermissionGuard], data: { permission: Permission.ViewPayouts },
              loadComponent: () => import('@pages/admin/payouts/payout-list.component').then(m => m.AdminPayoutListComponent) },
            // Xác thực tài khoản ngân hàng nhận giải ngân của thành viên
            { path: 'bank-accounts', canActivate: [PermissionGuard], data: { permission: Permission.VerifyBankAccounts },
              loadComponent: () => import('@pages/admin/bank-accounts/bank-account-list.component').then(m => m.BankAccountListComponent) },
            // Đường dẫn cũ của màn hình phân quyền, nay nằm trong tab của mục Cài đặt
            { path: 'permissions', redirectTo: 'settings' },
            { path: 'demo', loadComponent: () => import('@pages/demo/demo.component').then(m => m.DemoComponent) },
            { path: 'social-posts', loadComponent: () => import('@pages/admin/social/social-post-list.component').then(m => m.AdminSocialPostListComponent) },
            // User Management
            { path: 'users', loadComponent: () => import('@pages/admin/users/user-list.component').then(m => m.AdminUserListComponent) },
            // Collaborator Management
            { path: 'collaborator', loadComponent: () => import('@pages/admin/collaborator/collaborator-list.component').then(m => m.AdminCollaboratorListComponent) },
            { path: 'collaborator/:id', loadComponent: () => import('@pages/admin/collaborator/detail/collaborator-detail.component').then(m => m.AdminCollaboratorDetailComponent) },
            // Partner Management
            // Phân quyền: chỉ tài khoản có quyền xem ma trận quyền (P100) mới vào được
            { path: 'partner', loadComponent: () => import('@pages/admin/partner/partner-list.component').then(m => m.AdminPartnerListComponent) },
            { path: 'partner/:id', loadComponent: () => import('@pages/admin/partner/detail/partner-detail.component').then(m => m.AdminPartnerDetailComponent) },
        
        ]
    }
];
