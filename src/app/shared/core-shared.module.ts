// src/app/shared/core-shared.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

// ===== Components dùng chung (primitive / widget) =====
import { BadgeComponent } from './components/badge/badge.component';
import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { LoadingComponent } from './components/loading/loading.component';
import { ModalComponent } from './components/modal/modal.component';
import { NgSelectWrapperComponent } from './components/select/ng-select-wrapper.component';
import { ProvinceSelectComponent } from './components/province-select/province-select.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { StatusTabsComponent } from './components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from './components/filter-daterange/ngx-filter-daterange.component';

// ===== Pipes =====
import { AvatarPipe } from './pipes/avatar.pipe';
import { FormatHtmlPipe } from './pipes/format-html.pipe';
import { ReadMorePipe } from './pipes/read-more.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

/**
 * Các module "hạ tầng" của Angular / thư viện bên thứ ba, được re-export để
 * component chỉ cần import 1 module là dùng được ngIf/ngFor, ngModel,
 * formControlName và pipe `translate`.
 */
const COMMON_MODULES = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
];

const WIDGETS = [
    BadgeComponent,
    ButtonComponent,
    InputComponent,
    LoadingComponent,
    ModalComponent,
    NgSelectWrapperComponent,
    ProvinceSelectComponent,
    PaginationComponent,
    StatusTabsComponent,
    NgxFilterDaterangeComponent
];

const PIPES = [
    AvatarPipe,
    FormatHtmlPipe,
    ReadMorePipe,
    SafeHtmlPipe,
    SanitizeHtmlPipe,
    TimeAgoPipe,
    TruncatePipe
];

/**
 * CoreSharedModule — tầng thấp: widget cơ bản + pipe + module hạ tầng.
 *
 * Dùng cho mọi component/page cần UI primitives:
 *
 * ```ts
 * @Component({
 *   standalone: true,
 *   imports: [CoreSharedModule],
 *   ...
 * })
 * ```
 *
 * Lưu ý: NgModule import standalone component sẽ kéo TOÀN BỘ component trong
 * đây vào chunk của người import (không tree-shake theo từng component được
 * nữa). Vì vậy chỉ gom những thứ nhẹ và gần như trang nào cũng dùng; các thứ
 * nặng/gắn với route nằm ở `SharedModule`.
 */
@NgModule({
    imports: [
        ...COMMON_MODULES,
        ...WIDGETS,
        ...PIPES
    ],
    exports: [
        ...COMMON_MODULES,
        ...WIDGETS,
        ...PIPES
    ]
})
export class CoreSharedModule { }
