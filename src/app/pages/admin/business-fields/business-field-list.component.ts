import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BusinessFieldService } from '@core/services/business-field.service';
import { ToastService } from '@core/services/toast.service';
import { AppService } from '@core/services/app.service';
import { Permission } from '@core/models/permission.model';
import {
    BusinessFieldAdmin,
    BusinessFieldCompany,
    BusinessFieldFormValue,
    BusinessFieldRelated,
    BusinessFieldUser
} from '@core/models/business-field.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';

/**
 * Quản lý lĩnh vực hoạt động: thêm, sửa, bật/tắt, xoá và xem công ty/tài khoản thuộc lĩnh vực.
 * Xoá chỉ thành công khi lĩnh vực chưa được công ty hay hồ sơ nào sử dụng (API chặn).
 */
@Component({
    selector: 'app-admin-business-field-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        LoadingComponent,
        ButtonComponent,
        InputComponent,
        ModalComponent,
        StatusTabsComponent
    ],
    styles: [`
        @media (max-width: 640px) {
            .bf-actions app-button { min-width: 44px; min-height: 44px; }
        }
    `],
    template: `
        <div class="space-y-4">
            <div>
                <h1 class="text-xl font-semibold text-gray-900">{{ 'ADMIN.BUSINESS_FIELDS.TITLE' | translate }}</h1>
                <p class="text-sm text-gray-500 mt-1">{{ 'ADMIN.BUSINESS_FIELDS.SUBTITLE' | translate }}</p>
            </div>

            <!-- Bộ lọc -->
            <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-lg border border-gray-200" style="--control-h: 2.5rem">
                <div class="w-64">
                    <app-input [(ngModel)]="keyword" (keyup.enter)="applyFilter()" [id]="'bf_keyword'"
                        [placeholder]="'ADMIN.BUSINESS_FIELDS.SEARCH_PLACEHOLDER' | translate">
                    </app-input>
                </div>

                <app-button variant="primary" (click)="applyFilter()">
                    <i class="fa-solid fa-magnifying-glass mr-1"></i>{{ 'ADMIN.BUSINESS_FIELDS.SEARCH' | translate }}
                </app-button>
                <app-button variant="outline" (click)="resetFilter()">
                    <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'ADMIN.BUSINESS_FIELDS.RESET' | translate }}
                </app-button>

                <span class="ml-auto h-10 flex items-center text-sm text-gray-500">
                    {{ 'ADMIN.BUSINESS_FIELDS.TOTAL' | translate }}: <strong class="ml-1">{{ filtered.length }}</strong>
                </span>
                @if (canCreate) {
                <app-button variant="primary" (click)="openCreate()">
                    <i class="fa-solid fa-plus mr-1"></i>{{ 'ADMIN.BUSINESS_FIELDS.ADD' | translate }}
                </app-button>
                }
            </div>

            <!-- Danh sách -->
            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                @if (isLoading) {
                <app-loading></app-loading>
                } @else if (filtered.length === 0) {
                <div class="p-8 text-center text-sm text-gray-500">{{ 'ADMIN.BUSINESS_FIELDS.EMPTY' | translate }}</div>
                } @else {
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th class="px-4 py-3 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COL_CODE' | translate }}</th>
                                <th class="px-4 py-3">{{ 'ADMIN.BUSINESS_FIELDS.COL_NAME' | translate }}</th>
                                <th class="px-4 py-3">{{ 'ADMIN.BUSINESS_FIELDS.COL_ALIASES' | translate }}</th>
                                <th class="px-4 py-3 text-center">{{ 'ADMIN.BUSINESS_FIELDS.COL_COMPANY' | translate }}</th>
                                <th class="px-4 py-3 text-center">{{ 'ADMIN.BUSINESS_FIELDS.COL_USER' | translate }}</th>
                                <th class="px-4 py-3">{{ 'ADMIN.BUSINESS_FIELDS.COL_STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-right">{{ 'ADMIN.BUSINESS_FIELDS.COL_ACTION' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @for (field of filtered; track field.id) {
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">{{ field.businessFieldCode || '--' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-900">{{ field.name }}</td>
                                <td class="px-4 py-3 text-xs text-gray-500">{{ aliasesText(field.aliases) }}</td>
                                <td class="px-4 py-3 text-sm text-center">
                                    <button type="button" class="text-primary hover:underline"
                                        (click)="openDetail(field)">{{ field.companyCount }}</button>
                                </td>
                                <td class="px-4 py-3 text-sm text-center">
                                    <button type="button" class="text-primary hover:underline"
                                        (click)="openDetail(field)">{{ field.userCount }}</button>
                                </td>
                                <td class="px-4 py-3 text-sm whitespace-nowrap">
                                    @if (field.isActive) {
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700">
                                        {{ 'ADMIN.BUSINESS_FIELDS.ACTIVE' | translate }}
                                    </span>
                                    } @else {
                                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                                        {{ 'ADMIN.BUSINESS_FIELDS.INACTIVE' | translate }}
                                    </span>
                                    }
                                </td>
                                <td class="px-4 py-3">
                                    <div class="bf-actions flex items-center justify-end gap-2">
                                        <app-button size="sm" variant="outline" [title]="'ADMIN.BUSINESS_FIELDS.VIEW' | translate"
                                            (click)="openDetail(field)">
                                            <i class="fa-solid fa-eye"></i>
                                        </app-button>
                                        @if (canUpdate) {
                                        <app-button size="sm" variant="outline" [title]="'ADMIN.BUSINESS_FIELDS.EDIT' | translate"
                                            (click)="openEdit(field)">
                                            <i class="fa-solid fa-pen"></i>
                                        </app-button>
                                        }
                                        @if (canDelete) {
                                        <app-button size="sm" variant="outline" [title]="'ADMIN.BUSINESS_FIELDS.DELETE' | translate"
                                            (click)="askDelete(field)">
                                            <i class="fa-solid fa-trash text-red-600"></i>
                                        </app-button>
                                        }
                                    </div>
                                </td>
                            </tr>
                            }
                        </tbody>
                    </table>
                </div>
                }
            </div>
        </div>

        <!-- Thêm / sửa lĩnh vực -->
        <app-modal [(visible)]="isFormVisible" [title]="(editingId
                ? 'ADMIN.BUSINESS_FIELDS.FORM_EDIT_TITLE'
                : 'ADMIN.BUSINESS_FIELDS.FORM_CREATE_TITLE') | translate" size="md" [showFooter]="false" (closed)="closeForm()">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'ADMIN.BUSINESS_FIELDS.FORM_NAME' | translate }} <span class="text-red-500">*</span>
                    </label>
                    <app-input [(ngModel)]="form.name" [id]="'bf_name'"
                        [placeholder]="'ADMIN.BUSINESS_FIELDS.FORM_NAME_PLACEHOLDER' | translate" [required]="true">
                    </app-input>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ 'ADMIN.BUSINESS_FIELDS.FORM_ALIASES' | translate }}
                    </label>
                    <app-input [(ngModel)]="form.aliases" [id]="'bf_aliases'"
                        [placeholder]="'ADMIN.BUSINESS_FIELDS.FORM_ALIASES_HINT' | translate">
                    </app-input>
                </div>
                <label class="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" [(ngModel)]="form.isActive" class="rounded border-gray-300">
                    {{ 'ADMIN.BUSINESS_FIELDS.FORM_ACTIVE' | translate }}
                </label>
            </div>

            <div class="flex items-center justify-end gap-2 mt-5">
                <app-button variant="outline" (click)="closeForm()">{{ 'ADMIN.BUSINESS_FIELDS.CANCEL' | translate }}</app-button>
                <app-button variant="primary" [loading]="isSaving" (click)="save()">{{ 'ADMIN.BUSINESS_FIELDS.SAVE' | translate }}</app-button>
            </div>
        </app-modal>

        <!-- Xoá lĩnh vực -->
        <app-modal [(visible)]="isDeleteVisible" [title]="'ADMIN.BUSINESS_FIELDS.DELETE_TITLE' | translate" size="sm"
            [showFooter]="false" (closed)="cancelDelete()">
            <p class="text-sm text-gray-600">
                {{ 'ADMIN.BUSINESS_FIELDS.DELETE_CONFIRM' | translate: { name: deleting?.name || '' } }}
            </p>
            <div class="flex items-center justify-end gap-2 mt-5">
                <app-button variant="outline" (click)="cancelDelete()">{{ 'ADMIN.BUSINESS_FIELDS.CANCEL' | translate }}</app-button>
                <app-button variant="primary" [loading]="isDeleting" (click)="confirmDelete()">
                    {{ 'ADMIN.BUSINESS_FIELDS.DELETE' | translate }}
                </app-button>
            </div>
        </app-modal>

        <!-- Công ty và tài khoản thuộc lĩnh vực: tách thành 2 tab, mỗi phần có tìm kiếm + đếm riêng -->
        <app-modal [(visible)]="isDetailVisible" [title]="'ADMIN.BUSINESS_FIELDS.DETAIL_TITLE' | translate" size="lg"
            [showFooter]="false" (closed)="closeDetail()">
            @if (isLoadingDetail) {
            <app-loading></app-loading>
            } @else if (detail) {
            <div class="space-y-4">
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span class="font-medium text-gray-900">{{ detail.name }}</span>
                    @if (detail.businessFieldCode) {
                    <span class="text-xs text-gray-500">{{ detail.businessFieldCode }}</span>
                    }
                </div>

                <app-status-tabs [items]="detailTabs" [active]="detailTab"
                    (change)="onDetailTabChange($event)"></app-status-tabs>

                @if (detailTab === 'companies') {
                <section>
                    <h3 class="text-sm font-semibold text-gray-900">
                        {{ 'ADMIN.BUSINESS_FIELDS.DETAIL_COMPANIES' | translate }} ({{ filteredCompanies.length }})
                    </h3>
                    <div class="mt-2">
                        <app-input [(ngModel)]="companyKeyword" [id]="'bf_detail_company_search'"
                            [placeholder]="'ADMIN.BUSINESS_FIELDS.COMPANY_SEARCH_PLACEHOLDER' | translate">
                        </app-input>
                    </div>

                    @if (filteredCompanies.length === 0) {
                    <p class="text-sm text-gray-500 mt-3">
                        {{ (detail.companies.length === 0 ? 'ADMIN.BUSINESS_FIELDS.NO_COMPANIES' : 'ADMIN.BUSINESS_FIELDS.COMPANY_SEARCH_EMPTY') | translate }}
                    </p>
                    } @else {
                    <div class="mt-3 border border-gray-200 rounded-lg overflow-x-auto overflow-y-auto max-h-[55vh]">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                                <tr>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_CODE' | translate }}</th>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_NAME' | translate }}</th>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_TAX' | translate }}</th>
                                    <th class="px-3 py-2 text-center whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_COLLABORATOR_COUNT' | translate }}</th>
                                    <th class="px-3 py-2 text-center whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_PARTNER_COUNT' | translate }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @for (company of filteredCompanies; track company.id) {
                                <tr>
                                    <td class="px-3 py-2 text-gray-700 whitespace-nowrap">{{ company.companyCode || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-900">{{ company.name }}</td>
                                    <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ company.taxCode || '--' }}</td>
                                    <td class="px-3 py-2 text-center text-gray-700">{{ company.collaboratorCount }}</td>
                                    <td class="px-3 py-2 text-center text-gray-700">{{ company.partnerCount }}</td>
                                </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    }
                </section>
                } @else {
                <section>
                    <h3 class="text-sm font-semibold text-gray-900">
                        {{ 'ADMIN.BUSINESS_FIELDS.DETAIL_USERS' | translate }} ({{ filteredUsers.length }})
                    </h3>
                    <div class="mt-2">
                        <app-input [(ngModel)]="userKeyword" [id]="'bf_detail_user_search'"
                            [placeholder]="'ADMIN.BUSINESS_FIELDS.USER_SEARCH_PLACEHOLDER' | translate">
                        </app-input>
                    </div>

                    @if (filteredUsers.length === 0) {
                    <p class="text-sm text-gray-500 mt-3">
                        {{ (detail.users.length === 0 ? 'ADMIN.BUSINESS_FIELDS.NO_USERS' : 'ADMIN.BUSINESS_FIELDS.USER_SEARCH_EMPTY') | translate }}
                    </p>
                    } @else {
                    <div class="mt-3 border border-gray-200 rounded-lg overflow-x-auto overflow-y-auto max-h-[55vh]">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
                                <tr>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'COMMON.CODE.ACCOUNT' | translate }}</th>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.USER_NAME' | translate }}</th>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.USER_PHONE' | translate }}</th>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.USER_ROLE' | translate }}</th>
                                    <th class="px-3 py-2 whitespace-nowrap">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_NAME' | translate }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @for (user of filteredUsers; track user.userId) {
                                <tr>
                                    <td class="px-3 py-2 text-gray-700 whitespace-nowrap">{{ user.userCode || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-900 whitespace-nowrap">{{ user.fullName || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ user.phone || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ userRoleLabel(user.role) | translate }}</td>
                                    <td class="px-3 py-2 text-gray-600">{{ user.companyName || '--' }}</td>
                                </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    }
                </section>
                }
            </div>
            }
        </app-modal>
    `
})
export class AdminBusinessFieldListComponent implements OnInit {
    private service = inject(BusinessFieldService);
    private toast = inject(ToastService);
    private appService = inject(AppService);
    private translate = inject(TranslateService);

    fields: BusinessFieldAdmin[] = [];
    filtered: BusinessFieldAdmin[] = [];
    keyword = '';
    isLoading = false;

    isFormVisible = false;
    isSaving = false;
    editingId: string | null = null;
    form: BusinessFieldFormValue = { name: '', aliases: '', isActive: true };

    isDeleteVisible = false;
    isDeleting = false;
    deleting: BusinessFieldAdmin | null = null;

    isDetailVisible = false;
    isLoadingDetail = false;
    detail: BusinessFieldRelated | null = null;

    /** Tab đang xem trong khối chi tiết: 'companies' | 'accounts'. */
    detailTab = 'companies';
    detailTabs: StatusTabItem[] = [];

    /** Từ khoá tìm riêng cho bảng công ty và bảng tài khoản trong khối chi tiết. */
    companyKeyword = '';
    userKeyword = '';

    /** Quyền thêm lĩnh vực. */
    get canCreate(): boolean {
        return this.appService.permissionService.has(Permission.CreateBusinessField);
    }

    /** Quyền sửa lĩnh vực. */
    get canUpdate(): boolean {
        return this.appService.permissionService.has(Permission.UpdateBusinessField);
    }

    /** Quyền xoá lĩnh vực. */
    get canDelete(): boolean {
        return this.appService.permissionService.has(Permission.DeleteBusinessField);
    }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.isLoading = true;
        this.service.getAllForAdmin().subscribe({
            next: fields => {
                this.fields = fields;
                this.applyFilter();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.toast.error(this.translate.instant('ADMIN.BUSINESS_FIELDS.LOAD_ERROR'));
            }
        });
    }

    /** Lọc theo tên, mã lĩnh vực hoặc tên gọi khác. */
    applyFilter(): void {
        const keyword = (this.keyword || '').trim().toLowerCase();
        if (!keyword) {
            this.filtered = [...this.fields];
            return;
        }

        this.filtered = this.fields.filter(field =>
            (field.name || '').toLowerCase().includes(keyword) ||
            (field.businessFieldCode || '').toLowerCase().includes(keyword) ||
            (field.aliases || '').toLowerCase().includes(keyword)
        );
    }

    resetFilter(): void {
        this.keyword = '';
        this.applyFilter();
    }

    /** Aliases lưu dạng JSON array — hiển thị gọn thành "CNTT, IT". */
    aliasesText(aliases?: string | null): string {
        if (!aliases) return '--';
        try {
            const parsed = JSON.parse(aliases);
            return Array.isArray(parsed) ? parsed.join(', ') : aliases;
        } catch {
            return aliases;
        }
    }

    openCreate(): void {
        this.editingId = null;
        this.form = { name: '', aliases: '', isActive: true };
        this.isFormVisible = true;
    }

    openEdit(field: BusinessFieldAdmin): void {
        this.editingId = field.id;
        this.form = {
            name: field.name,
            aliases: this.aliasesText(field.aliases) === '--' ? '' : this.aliasesText(field.aliases),
            isActive: field.isActive
        };
        this.isFormVisible = true;
    }

    closeForm(): void {
        this.isFormVisible = false;
        this.editingId = null;
        this.isSaving = false;
    }

    save(): void {
        if (!this.form.name || !this.form.name.trim()) {
            this.toast.error(this.translate.instant('ADMIN.BUSINESS_FIELDS.NAME_REQUIRED'));
            return;
        }

        const payload: BusinessFieldFormValue = { ...this.form, name: this.form.name.trim() };
        this.isSaving = true;

        const request$ = this.editingId
            ? this.service.update(this.editingId, payload)
            : this.service.create(payload);

        request$.subscribe({
            next: () => {
                this.isSaving = false;
                this.closeForm();
                this.toast.success(this.translate.instant('ADMIN.BUSINESS_FIELDS.SAVED'));
                this.load();
            },
            error: (err: any) => {
                this.isSaving = false;
                this.toast.error(err?.error?.message || this.translate.instant('ADMIN.BUSINESS_FIELDS.SAVE_ERROR'));
            }
        });
    }

    askDelete(field: BusinessFieldAdmin): void {
        this.deleting = field;
        this.isDeleteVisible = true;
    }

    cancelDelete(): void {
        this.isDeleteVisible = false;
        this.deleting = null;
        this.isDeleting = false;
    }

    confirmDelete(): void {
        if (!this.deleting) return;

        this.isDeleting = true;
        this.service.remove(this.deleting.id).subscribe({
            next: () => {
                this.isDeleting = false;
                this.cancelDelete();
                this.toast.success(this.translate.instant('ADMIN.BUSINESS_FIELDS.DELETED'));
                this.load();
            },
            error: (err: any) => {
                this.isDeleting = false;
                // API chặn khi lĩnh vực còn công ty/hồ sơ sử dụng — hiện đúng thông báo của API.
                this.toast.error(err?.error?.message || this.translate.instant('ADMIN.BUSINESS_FIELDS.DELETE_ERROR'));
            }
        });
    }

    openDetail(field: BusinessFieldAdmin): void {
        this.detail = null;
        this.detailTab = 'companies';
        this.companyKeyword = '';
        this.userKeyword = '';
        this.detailTabs = this.buildDetailTabs(0, 0);
        this.isDetailVisible = true;
        this.isLoadingDetail = true;

        this.service.getRelated(field.id).subscribe({
            next: related => {
                this.detail = related;
                this.detailTabs = this.buildDetailTabs(related?.companies?.length ?? 0, related?.users?.length ?? 0);
                this.isLoadingDetail = false;
            },
            error: () => {
                this.isLoadingDetail = false;
                this.toast.error(this.translate.instant('ADMIN.BUSINESS_FIELDS.LOAD_ERROR'));
            }
        });
    }

    /** Hai tab của khối chi tiết kèm số lượng để thấy ngay mỗi phần có bao nhiêu. */
    private buildDetailTabs(companyCount: number, userCount: number): StatusTabItem[] {
        return [
            { key: 'companies', label: this.translate.instant('ADMIN.BUSINESS_FIELDS.TAB_COMPANIES'), count: companyCount },
            { key: 'accounts', label: this.translate.instant('ADMIN.BUSINESS_FIELDS.TAB_ACCOUNTS'), count: userCount }
        ];
    }

    /** Đổi tab giữa công ty và tài khoản trong khối chi tiết. */
    onDetailTabChange(tab: string): void {
        this.detailTab = tab;
    }

    /**
     * Công ty khớp từ khoá (mã công ty / tên / mã số thuế). Dữ liệu đã tải sẵn theo
     * endpoint related nên lọc ngay trên client, không cần API mới.
     */
    get filteredCompanies(): BusinessFieldCompany[] {
        const items = this.detail?.companies ?? [];
        const keyword = this.companyKeyword.trim().toLowerCase();
        if (!keyword) return items;

        return items.filter(company =>
            (company.companyCode || '').toLowerCase().includes(keyword) ||
            (company.name || '').toLowerCase().includes(keyword) ||
            (company.taxCode || '').toLowerCase().includes(keyword)
        );
    }

    /** Tài khoản khớp từ khoá (mã tài khoản / họ tên / SĐT / công ty / loại hồ sơ). */
    get filteredUsers(): BusinessFieldUser[] {
        const items = this.detail?.users ?? [];
        const keyword = this.userKeyword.trim().toLowerCase();
        if (!keyword) return items;

        return items.filter(user =>
            (user.userCode || '').toLowerCase().includes(keyword) ||
            (user.fullName || '').toLowerCase().includes(keyword) ||
            (user.phone || '').toLowerCase().includes(keyword) ||
            (user.companyName || '').toLowerCase().includes(keyword) ||
            (user.role || '').toLowerCase().includes(keyword) ||
            this.userRoleLabel(user.role).toLowerCase().includes(keyword)
        );
    }

    /** Nhãn loại hồ sơ (khoá i18n) — dùng cho cột và cho ô tìm kiếm tài khoản. */
    userRoleLabel(role: string): string {
        return role === 'Partner'
            ? 'ADMIN.BUSINESS_FIELDS.ROLE_PARTNER'
            : 'ADMIN.BUSINESS_FIELDS.ROLE_COLLABORATOR';
    }

    closeDetail(): void {
        this.isDetailVisible = false;
        this.detail = null;
        this.isLoadingDetail = false;
        this.companyKeyword = '';
        this.userKeyword = '';
        this.detailTab = 'companies';
    }
}
