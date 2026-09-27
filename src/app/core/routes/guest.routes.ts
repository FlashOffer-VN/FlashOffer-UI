// src/app/core/routes/guest.routes.ts
import { Routes } from '@angular/router';
import { GuestGuard } from '@core/guards';
import { GuestLayoutComponent } from '@shared/components/layouts/guest-layout/guest-layout.component';

/** Route cho khách chưa đăng nhập (layout guest). */
export const guestRoutes: Routes = [
    {
        path: '',
        component: GuestLayoutComponent,
        children: [
            // Trang chủ
            { path: '', loadComponent: () => import('@pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'home', loadComponent: () => import('@pages/home/home.component').then(m => m.HomeComponent) },

            // Auth
            {
                path: 'login',
                canActivate: [GuestGuard],
                loadComponent: () => import('@pages/auth/login/login.component').then(m => m.LoginComponent)
            },
            {
                path: 'admin-login',
                canActivate: [GuestGuard],
                loadComponent: () => import('@pages/auth/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
            },
            {
                path: 'register',
                canActivate: [GuestGuard],
                loadComponent: () => import('@pages/auth/register/register.component').then(m => m.RegisterComponent)
            },
            {
                path: 'partner-register',
                loadComponent: () => import('@pages/partner-register/partner-register.component').then(m => m.PartnerRegisterComponent)
            },

            // Legal pages
            { path: 'privacy', loadComponent: () => import('@pages/legal/privacy/privacy.component').then(m => m.PrivacyComponent) },
            { path: 'terms', loadComponent: () => import('@pages/legal/terms/terms.component').then(m => m.TermsComponent) },

            // Các trang chức năng
            // { path: 'register-ctv', loadComponent: () => import('@pages/register-ctv/register-ctv.component').then(m => m.RegisterCtvComponent) },
            { path: 'connect-sme', loadComponent: () => import('@pages/connect-sme/connect-sme.component').then(m => m.ConnectSmeComponent) },
            { path: 'find-supplier', loadComponent: () => import('@pages/find-supplier/find-supplier.component').then(m => m.FindSupplierComponent) },
            { path: 'group-buying', loadComponent: () => import('@pages/group-buying/group-buying.component').then(m => m.GroupBuyingComponent) },
            // Link chia sẻ của một đơn mua chung (xem + tham gia không cần đăng nhập)
            { path: 'mua-chung/:code', loadComponent: () => import('@pages/group-buying/detail/group-buying-detail.component').then(m => m.GroupBuyingDetailPageComponent) },
            { path: 'groups', loadComponent: () => import('@pages/groups/groups.component').then(m => m.GroupsComponent) },
            { path: 'groups/:id', loadComponent: () => import('@pages/groups/detail/group-detail.component').then(m => m.GroupDetailComponent) },
            { path: 'get-offer', loadComponent: () => import('@pages/get-offer/get-offer.component').then(m => m.GetOfferComponent) },
            { path: 'suppliers', loadComponent: () => import('@pages/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
            { path: 'talent', loadComponent: () => import('@pages/talent/talent.component').then(m => m.TalentComponent) },
            { path: 'community', loadComponent: () => import('@pages/community/community.component').then(m => m.CommunityComponent) },
            { path: 'partner', loadComponent: () => import('@pages/partner/partner.component').then(m => m.PartnerComponent) },
            {
                path: 'social',
                children: [
                    {
                        path: '',
                        loadComponent: () => import('@pages/social/social.component').then(m => m.SocialComponent)
                    },
                    {
                        path: ':postId',
                        loadComponent: () => import('@pages/social/social.component').then(m => m.SocialComponent)
                    }
                ]
            }
            // Chi tiết đối tác
            // { path: 'partner/:id', loadComponent: () => import('@pages/partner-detail/partner-detail.component').then(m => m.PartnerDetailComponent) },
        
        ]
    }
];
