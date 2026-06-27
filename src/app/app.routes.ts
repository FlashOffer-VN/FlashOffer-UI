import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './shared/components/layouts/guest-layout/guest-layout.component';
import { UserLayoutComponent } from './shared/components/layouts/user-layout/user-layout.component';

export const routes: Routes = [
    // Guest routes (chưa đăng nhập)
    {
        path: '',
        component: GuestLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
            { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
        ]
    },
    // Admin routes
    {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'demo', loadComponent: () => import('./pages/demo/demo.component').then(m => m.DemoComponent) },
        ]
    },
    // User routes (tương lai)
    {
        path: 'user',
        component: UserLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
        ]
    },
    // Fallback - redirect về guest home
    { path: '**', redirectTo: '' }
];