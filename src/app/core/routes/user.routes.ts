// src/app/core/routes/user.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard, CredentialsGuard } from '@core/guards';
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
        
        ]
    }
];
