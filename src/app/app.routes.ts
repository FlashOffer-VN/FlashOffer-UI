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
            { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'login', loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent) },
            { path: 'register', loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent) },
            { path: 'register-ctv', loadComponent: () => import('./pages/register-ctv/register-ctv.component').then(m => m.RegisterCtvComponent) },
            { path: 'connect-sme', loadComponent: () => import('./pages/connect-sme/connect-sme.component').then(m => m.ConnectSmeComponent) },
            { path: 'find-supplier', loadComponent: () => import('./pages/find-supplier/find-supplier.component').then(m => m.FindSupplierComponent) },
            { path: 'group-buying', loadComponent: () => import('./pages/group-buying/group-buying.component').then(m => m.GroupBuyingComponent) },
            { path: 'get-offer', loadComponent: () => import('./pages/get-offer/get-offer.component').then(m => m.GetOfferComponent) },
            { path: 'suppliers', loadComponent: () => import('./pages/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
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
    { path: '**', redirectTo: 'home' }
];