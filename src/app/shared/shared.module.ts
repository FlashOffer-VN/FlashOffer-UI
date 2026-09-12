// src/app/shared/shared.module.ts

import { NgModule } from '@angular/core';

import { CoreSharedModule } from './core-shared.module';

// ===== Component nặng / gắn với route hoặc app shell =====
import { BusinessInfoComponent } from './components/business-info/business-info.component';
import { ContactFloatingComponent } from './components/contact-floating/contact-floating.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { ToastComponent } from './components/toast/toast.component';

// ===== Layout (route shell) =====
import { AdminLayoutComponent } from './components/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './components/layouts/guest-layout/guest-layout.component';
import { UserLayoutComponent } from './components/layouts/user-layout/user-layout.component';

const HEAVY_COMPONENTS = [
    BusinessInfoComponent,
    ContactFloatingComponent,
    LanguageSwitcherComponent,
    ToastComponent
];

const LAYOUTS = [
    AdminLayoutComponent,
    GuestLayoutComponent,
    UserLayoutComponent
];

/**
 * SharedModule — tầng đầy đủ: CoreSharedModule + component nặng và layout.
 *
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [SharedModule],   // có luôn mọi thứ của CoreSharedModule
 *   ...
 * })
 * ```
 *
 * Chỉ dùng khi thực sự cần phần nặng (business-info, toast, layout...).
 * Trang chỉ cần widget cơ bản thì import `CoreSharedModule` để chunk nhẹ hơn.
 */
@NgModule({
    imports: [
        CoreSharedModule,
        ...HEAVY_COMPONENTS,
        ...LAYOUTS
    ],
    exports: [
        CoreSharedModule,
        ...HEAVY_COMPONENTS,
        ...LAYOUTS
    ]
})
export class SharedModule { }
