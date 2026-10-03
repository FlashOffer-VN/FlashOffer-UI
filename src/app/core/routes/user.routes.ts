// src/app/core/routes/user.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard, CredentialsGuard, PermissionGuard } from '@core/guards';
import { Permission } from '@core/models/permission.model';
import { UserLayoutComponent } from '@shared/components/layouts/user-layout/user-layout.component';

/** Route cho người dùng đã đăng nhập (layout user). */
export const userRoutes: Routes = [
    {
        path: 'user',
        component: UserLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'account', pathMatch: 'full' },
            // Bắt buộc đổi tên đăng nhập + mật khẩu ở lần đăng nhập đầu (không gắn CredentialsGuard để tránh vòng lặp)
            {
                path: 'change-credentials',
                loadComponent: () => import('@pages/profile/change-credentials/change-credentials.component').then(m => m.ChangeCredentialsPageComponent)
            },
            // Đường dẫn cũ của trang hồ sơ vẫn dùng được — nội dung nay nằm ở trang thông tin tài khoản
            { path: 'profile', redirectTo: 'account', pathMatch: 'full' },
            {
                path: 'account',
                canActivate: [CredentialsGuard],
                loadComponent: () => import('@pages/user/account/account.component').then(m => m.AccountPageComponent)
            },
            {
                path: 'my-membership',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyCommission },
                loadComponent: () => import('@pages/user/my-membership/my-membership.component').then(m => m.MyMembershipPageComponent)
            },
            {
                path: 'my-group-buying',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyGroupBuying },
                loadComponent: () => import('@pages/user/my-group-buying/my-group-buying.component').then(m => m.MyGroupBuyingPageComponent)
            },
            {
                path: 'my-referral',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyReferralStats },
                loadComponent: () => import('@pages/user/my-referral/my-referral.component').then(m => m.MyReferralPageComponent)
            },
            {
                path: 'my-requests',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyRequests },
                loadComponent: () => import('@pages/user/my-requests/my-requests.component').then(m => m.MyRequestsPageComponent)
            },
            {
                path: 'my-posts',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyPosts },
                loadComponent: () => import('@pages/user/my-posts/my-posts.component').then(m => m.MyPostsPageComponent)
            },
            {
                path: 'my-groups',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyGroups },
                loadComponent: () => import('@pages/user/my-groups/my-groups.component').then(m => m.MyGroupsPageComponent)
            },
            {
                path: 'my-commission',
                canActivate: [CredentialsGuard, PermissionGuard],
                data: { permission: Permission.ViewMyCommission },
                loadComponent: () => import('@pages/user/my-commission/my-commission.component').then(m => m.MyCommissionPageComponent)
            },
        
        ]
    }
];
