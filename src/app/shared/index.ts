// src/app/shared/index.ts
//
// Barrel của tầng shared. Import gọn:
//
// ```ts
// import { CoreSharedModule } from '@shared';
// // hoặc
// import { SharedModule } from '@shared';
// import type { BadgeVariant, DateRangeValue } from '@shared';
// ```
//
// CHỦ Ý: file này chỉ re-export 2 module + các TYPE.
// Không `export *` từng component/pipe, vì `package.json` không khai báo
// `sideEffects: false` nên barrel có re-export runtime sẽ bị giữ lại toàn bộ
// khi bundle → mọi chunk kéo theo hết component shared.
// Cần dùng trực tiếp 1 component/pipe thì import theo đường dẫn sâu:
// `@shared/components/button/button.component`.

// ===== Modules =====
export { CoreSharedModule } from './core-shared.module';
export { SharedModule } from './shared.module';

// ===== Types / interfaces dùng khi khai báo biến ở component =====
// (type bị xoá khi compile nên không tốn gì ở runtime)
export type { BadgeVariant, BadgeSize, BadgeRounded } from './components/badge/badge.component';
export type { ButtonVariant, ButtonSize } from './components/button/button.component';
export type { LoadingType } from './components/loading/loading.component';
export type { StatusTabItem } from './components/status-tabs/status-tabs.component';
export type { ToastType } from './components/toast/toast.component';
export type { DateRangeValue } from './components/filter-daterange/ngx-filter-daterange.component';
