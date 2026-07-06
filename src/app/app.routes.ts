// app.routes.ts
import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './shared/components/layouts/guest-layout/guest-layout.component';
import { UserLayoutComponent } from './shared/components/layouts/user-layout/user-layout.component';
import { AdminGuard, AuthGuard, GuestGuard } from './core/guards';

export const routes: Routes = [
    // Guest routes (chưa đăng nhập)
    {
        path: '',
        component: GuestLayoutComponent,
        children: [
            // Trang chủ
            { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },

            // Auth
            {
                path: 'login',
                canActivate: [GuestGuard],
                loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'admin-login',
                canActivate: [GuestGuard],
                loadComponent: () => import('./features/auth/pages/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
            },
            {
                path: 'register',
                canActivate: [GuestGuard],
                loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'partner-register',
                loadComponent: () => import('./pages/partner-register/partner-register.component').then(m => m.PartnerRegisterComponent)
            },

            // Các trang chức năng
            { path: 'register-ctv', loadComponent: () => import('./pages/register-ctv/register-ctv.component').then(m => m.RegisterCtvComponent) },
            { path: 'connect-sme', loadComponent: () => import('./pages/connect-sme/connect-sme.component').then(m => m.ConnectSmeComponent) },
            { path: 'find-supplier', loadComponent: () => import('./pages/find-supplier/find-supplier.component').then(m => m.FindSupplierComponent) },
            { path: 'group-buying', loadComponent: () => import('./pages/group-buying/group-buying.component').then(m => m.GroupBuyingComponent) },
            { path: 'get-offer', loadComponent: () => import('./pages/get-offer/get-offer.component').then(m => m.GetOfferComponent) },
            { path: 'suppliers', loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
            { path: 'talent', loadComponent: () => import('./pages/talent/talent.component').then(m => m.TalentComponent) },
            { path: 'community', loadComponent: () => import('./pages/community/community.component').then(m => m.CommunityComponent) },
            // { path: 'partner', loadComponent: () => import('./pages/partner/partner.component').then(m => m.PartnerComponent) },
        ]
    },

    // Admin routes (chỉ admin mới vào được)
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [AdminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'demo', loadComponent: () => import('./pages/demo/demo.component').then(m => m.DemoComponent) },
        ]
    },

    // User routes (cần đăng nhập)
    {
        path: 'user',
        component: UserLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'profile', pathMatch: 'full' },
            { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
        ]
    },

    // Fallback
    { path: '**', redirectTo: '' }
];