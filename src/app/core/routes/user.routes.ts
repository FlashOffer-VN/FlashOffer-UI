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
            { path: '', redirectTo: 'profile', pathMatch: 'full' },
            // Bắt buộc đổi tên đăng nhập + mật khẩu ở lần đăng nhập đầu (không gắn CredentialsGuard để tránh vòng lặp)
            {
                path: 'change-credentials',
                loadComponent: () => import('@pages/profile/change-credentials/change-credentials.component').then(m => m.ChangeCredentialsPageComponent)
            },
            {
                path: 'profile',
                canActivate: [CredentialsGuard],
                loadComponent: () => import('@pages/profile/profile.component').then(m => m.ProfileComponent)
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
        
        ]
    }
];
