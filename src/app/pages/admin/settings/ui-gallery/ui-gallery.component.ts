import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { BrandLogoComponent } from '@shared/components/brand-logo/brand-logo.component';
import { ButtonComponent, ButtonVariant } from '@shared/components/button/button.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { CodeListComponent, CodeListItem } from '@shared/components/code-list/code-list.component';
import { InputComponent } from '@shared/components/input/input.component';
import { JsonViewerComponent } from '@shared/components/json-viewer/json-viewer.component';
import { LoadingComponent, LoadingType } from '@shared/components/loading/loading.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';
import { RadioGroupComponent, RadioOption } from '@shared/components/radio-group/radio-group.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import type { SearchFieldOption } from '@core/constants/search-fields';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import {
    API_CONTROLLERS,
    API_DTOS,
    API_ENUMS,
    API_EXTENSIONS,
    API_MIDDLEWARES,
    API_PERMISSION_CODES,
    CatalogEnum,
    CatalogItem,
    DtoField,
    UI_COMPONENTS,
    UI_DIRECTIVES,
    UI_ENUMS,
    UI_HELPERS,
    UI_PIPES
} from './catalog.data';

type GalleryTab = 'ui' | 'api' | 'helper';
type UiGroupKey = 'form' | 'display' | 'feedback' | 'layout';

/**
 * Thư viện nội bộ cho dev: tra cứu component/pipe/directive/helper của UI, route API (kèm request/response)
 * và các lớp helper/extension của API. Dữ liệu sinh tự động bằng scripts/gen-catalog.py.
 */
@Component({
    selector: 'app-ui-gallery',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        BadgeComponent,
        BrandLogoComponent,
        ButtonComponent,
        CheckboxComponent,
        CodeListComponent,
        InputComponent,
        JsonViewerComponent,
        LoadingComponent,
        ModalComponent,
        PaginationComponent,
        PurgeBarComponent,
        RadioGroupComponent,
        SearchByComponent,
        NgSelectWrapperComponent,
        StatusTabsComponent,
        ToastComponent
    ],
    templateUrl: './ui-gallery.component.html',
    styleUrl: './ui-gallery.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiGalleryComponent {

    /** Tab đang xem: giao diện, API hay helper. */
    tab: GalleryTab = 'ui';

    /** Từ khoá tra cứu, lọc theo tên/selector/mô tả. */
    keyword = '';

    /** Nhóm đang mở trong tab API (accordion). */
    openController: string | null = null;

    /** Khoá đang mở bảng field của DTO, và khoá vừa copy. */
    openDto: string | null = null;
    copiedKey: string | null = null;

    readonly components = UI_COMPONENTS;
    readonly pipes = UI_PIPES;
    readonly directives = UI_DIRECTIVES;
    readonly helpers = UI_HELPERS;
    readonly controllers = API_CONTROLLERS;
    readonly extensions = API_EXTENSIONS;
    readonly middlewares = API_MIDDLEWARES;
    readonly uiEnums = UI_ENUMS;
    readonly apiEnums = API_ENUMS;

    readonly groups: { key: UiGroupKey; label: string; icon: string }[] = [
        { key: 'form', label: 'ADMIN.UI_GALLERY.GROUP_FORM', icon: 'fa-solid fa-keyboard' },
        { key: 'display', label: 'ADMIN.UI_GALLERY.GROUP_DISPLAY', icon: 'fa-solid fa-image' },
        { key: 'feedback', label: 'ADMIN.UI_GALLERY.GROUP_FEEDBACK', icon: 'fa-solid fa-bell' },
        { key: 'layout', label: 'ADMIN.UI_GALLERY.GROUP_LAYOUT', icon: 'fa-solid fa-table-columns' }
    ];

    /** Số liệu tổng hợp hiển thị ở đầu trang. */
    readonly stats = {
        components: UI_COMPONENTS.length,
        pipes: UI_PIPES.length,
        directives: UI_DIRECTIVES.length,
        helpers: UI_HELPERS.reduce((sum, h) => sum + h.functions.length, 0),
        controllers: API_CONTROLLERS.length,
        endpoints: API_CONTROLLERS.reduce((sum, c) => sum + c.actions.length, 0),
        extensions: API_EXTENSIONS.length,
        middlewares: API_MIDDLEWARES.length,
        enums: UI_ENUMS.length + API_ENUMS.length
    };

    // ===== Trạng thái cho các demo trực tiếp =====
    demoButtonLoading = false;
    demoInput = '';
    demoSelect: string | null = null;
    demoCheckbox = true;
    demoCheckboxSmall = false;
    demoRadio = 'admin';
    demoSearchValue = '';
    demoPage = 2;
    demoPageSize = 10;
    demoLoading: LoadingType = 'dots';
    demoModalVisible = false;
    demoToastVisible = false;
    demoJson = JSON.stringify({ code: 'P070', name: 'ViewGroups', module: 'groups' }, null, 2);

    readonly loadingTypes: LoadingType[] = ['dots', 'spinner', 'pulse', 'logo', 'community', 'skeleton'];
    readonly badgeVariants: BadgeVariant[] = ['secondary', 'primary', 'success', 'warning', 'danger', 'info'];
    readonly buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'];
    readonly selectItems = [
        { value: 'admin', label: 'Quản trị' },
        { value: 'partner', label: 'Đối tác' },
        { value: 'user', label: 'Người dùng' }
    ];
    readonly radioOptions: RadioOption[] = [
        { value: 'user', label: 'Người dùng', hint: 'Chỉ khu vực thành viên' },
        { value: 'admin', label: 'Quản trị', hint: 'Toàn quyền nghiệp vụ' },
        { value: 'locked', label: 'Bị khoá', disabled: true }
    ];
    readonly searchFields: SearchFieldOption[] = [
        { value: 'name', label: 'Tên' },
        { value: 'code', label: 'Mã' },
        { value: 'phone', label: 'Số điện thoại' }
    ];
    readonly statusItems: StatusTabItem[] = [
        { key: 'all', label: 'Tất cả', count: 128 },
        { key: 'active', label: 'Đang hoạt động', count: 96 },
        { key: 'locked', label: 'Đã khoá', count: 32 }
    ];
    demoStatus = 'all';
    readonly codeItems: CodeListItem[] = [
        { label: 'Xem danh sách nhóm', value: 'P070', hint: 'Nhóm' },
        { label: 'Duyệt mở hội nhóm', value: 'P072', hint: 'Nhóm' }
    ];

    /** Danh sách quyền suy ra từ catalog (tên -> mã) để tra nhanh. */
    readonly permissionCodes = API_PERMISSION_CODES;

    /** Số mã quyền đang có (Angular không có pipe `length`). */
    get permissionCount(): number {
        return Object.keys(this.permissionCodes).length;
    }

    // ===== Tra cứu =====
    componentsOf(group: UiGroupKey): CatalogItem[] {
        return this.filter(this.components.filter((item) => item.group === group));
    }

    get filteredPipes(): CatalogItem[] {
        return this.filter(this.pipes);
    }

    get filteredDirectives(): CatalogItem[] {
        return this.filter(this.directives);
    }

    get filteredHelpers() {
        const kw = this.keyword.trim().toLowerCase();
        if (!kw) {
            return this.helpers;
        }
        return this.helpers.filter((h) =>
            h.file.toLowerCase().includes(kw)
            || h.functions.some((f) => f.name.toLowerCase().includes(kw)));
    }

    get filteredControllers() {
        return this.filter(this.controllers, (c) => `${c.name} ${c.class} ${c.base} ${c.doc}`);
    }

    get filteredExtensions() {
        return this.filter(this.extensions, (e) => `${e.class} ${e.doc} ${e.methods.map((m) => m.name).join(' ')}`);
    }

    get filteredMiddlewares() {
        return this.filter(this.middlewares, (m) => `${m.class} ${m.doc}`);
    }

    get filteredUiEnums(): CatalogEnum[] {
        return this.filter(this.uiEnums, (e) => `${e.name} ${e.doc} ${e.members.map((m) => `${m.name} ${m.value}`).join(' ')}`);
    }

    get filteredApiEnums(): CatalogEnum[] {
        return this.filter(this.apiEnums, (e) => `${e.name} ${e.doc} ${e.members.map((m) => `${m.name} ${m.value}`).join(' ')}`);
    }

    private filter<T>(items: T[], text?: (item: T) => string): T[] {
        const kw = this.keyword.trim().toLowerCase();
        if (!kw) {
            return items;
        }
        return items.filter((item) => {
            const haystack = text ? text(item) : JSON.stringify(item);
            return haystack.toLowerCase().includes(kw);
        });
    }

    // ===== Hiển thị =====
    /** Câu lệnh dùng nhanh, sinh từ chính metadata nên luôn khớp code. */
    snippet(item: CatalogItem): string {
        if (item.kind === 'pipe') {
            const args = (item.params ?? []).slice(1)
                .map((p) => p.split(/[=:]/)[0].trim().replace('?', ''))
                .filter(Boolean);
            return `{{ value | ${item.selector}${args.length ? ':' + args.join(':') : ''} }}`;
        }
        if (item.kind === 'directive') {
            return `<phần-tử ${item.selector}="điều-kiện">`;
        }
        const props = item.inputs.filter((i) => !i.required).slice(0, 3).map((i) => `[${i.name}]="…"`);
        const body = props.length ? ` ${props.join(' ')}` : '';
        return `<${item.selector}${body}></${item.selector}>`;
    }

    /** Dòng mô tả ngắn cho mỗi mục. */
    meta(item: CatalogItem): string {
        if (item.kind === 'pipe') {
            return item.params?.length ? `transform(${item.params.join(', ')})` : 'transform(value)';
        }
        if (item.kind === 'directive') {
            return item.selector;
        }
        const io = `${item.inputs.length} input`;
        return item.outputs.length ? `${io} · ${item.outputs.length} output` : io;
    }

    fieldsOf(name: string): DtoField[] {
        return name && API_DTOS[name] ? API_DTOS[name] : [];
    }

    trackName(_index: number, item: { class: string }): string {
        return item.class;
    }

    toggleController(name: string): void {
        this.openController = this.openController === name ? null : name;
    }

    toggleDto(name: string): void {
        this.openDto = this.openDto === name ? null : name;
    }

    copy(text: string, key: string): void {
        void navigator.clipboard?.writeText(text);
        this.copiedKey = key;
        setTimeout(() => {
            if (this.copiedKey === key) {
                this.copiedKey = null;
            }
        }, 1600);
    }

    runModal(): void {
        this.demoModalVisible = true;
        setTimeout(() => (this.demoModalVisible = false), 1200);
    }
}
