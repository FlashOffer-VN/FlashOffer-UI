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
    BusinessFieldUser
} from '@core/models/business-field.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { SelectOption } from '@core/constants/format-options';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';

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
        NgSelectWrapperComponent,
        StatusTabsComponent,
        PaginationComponent,
        CheckboxComponent
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
                    <app-checkbox [(ngModel)]="form.isActive" />
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

        <!-- Công ty và tài khoản thuộc lĩnh vực: tách thành 2 tab, mỗi tab phân trang + tìm kiếm phía server -->
        <app-modal [(visible)]="isDetailVisible" [title]="'ADMIN.BUSINESS_FIELDS.DETAIL_TITLE' | translate" size="lg"
            [showFooter]="false" (closed)="closeDetail()">
            @if (detailField) {
            <div class="space-y-4">
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span class="font-medium text-gray-900">{{ detailField.name }}</span>
                    @if (detailField.businessFieldCode) {
                    <span class="text-xs text-gray-500">{{ detailField.businessFieldCode }}</span>
                    }
                </div>

                <app-status-tabs [items]="detailTabs" [active]="detailTab"
                    (change)="onDetailTabChange($event)"></app-status-tabs>

                @if (detailTab === 'companies') {
                <section>
                    <h3 class="text-sm font-semibold text-gray-900">
                        {{ 'ADMIN.BUSINESS_FIELDS.DETAIL_COMPANIES' | translate }} ({{ companyTotalCount }})
                    </h3>
                    <div class="mt-2 flex items-end gap-2">
                        <div class="flex-1">
                            <app-input [(ngModel)]="companyKeyword" (keyup.enter)="searchCompanies()"
                                [id]="'bf_detail_company_search'"
                                [placeholder]="'ADMIN.BUSINESS_FIELDS.COMPANY_SEARCH_PLACEHOLDER' | translate">
                            </app-input>
                        </div>
                        <app-button size="sm" variant="primary" [title]="'ADMIN.BUSINESS_FIELDS.SEARCH' | translate"
                            (click)="searchCompanies()">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </app-button>
                    </div>

                    @if (isLoadingCompanies) {
                    <app-loading></app-loading>
                    } @else if (companies.length === 0) {
                    <p class="text-sm text-gray-500 mt-3">
                        {{ (companySearch ? 'ADMIN.BUSINESS_FIELDS.COMPANY_SEARCH_EMPTY' : 'ADMIN.BUSINESS_FIELDS.NO_COMPANIES') | translate }}
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
                                @for (company of companies; track company.id) {
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
                    <div class="mt-3">
                        <app-pagination [pageNumber]="companyPage" [pageSize]="companyPageSize"
                            [totalCount]="companyTotalCount" [totalPages]="companyTotalPages"
                            [hasPreviousPage]="companyHasPreviousPage" [hasNextPage]="companyHasNextPage"
                            (pageChange)="onCompanyPageChange($event)" (pageSizeChange)="onCompanyPageSizeChange($event)">
                        </app-pagination>
                    </div>
                    }
                </section>
                } @else {
                <section>
                    <h3 class="text-sm font-semibold text-gray-900">
                        {{ 'ADMIN.BUSINESS_FIELDS.DETAIL_USERS' | translate }} ({{ userTotalCount }})
                    </h3>
                    <div class="mt-2 flex flex-wrap items-end gap-2">
                        <div class="flex-1 min-w-[180px]">
                            <app-input [(ngModel)]="userKeyword" (keyup.enter)="searchUsers()"
                                [id]="'bf_detail_user_search'"
                                [placeholder]="'ADMIN.BUSINESS_FIELDS.USER_SEARCH_PLACEHOLDER' | translate">
                            </app-input>
                        </div>
                        <div class="w-52">
                            <app-ng-select-wrapper [(ngModel)]="userRoleFilter"
                                (ngModelChange)="onUserRoleChange($event)" [items]="userRoleOptions"
                                [label]="'ADMIN.BUSINESS_FIELDS.USER_ROLE' | translate" [id]="'businessFieldUserRole'">
                            </app-ng-select-wrapper>
                        </div>
                        <app-button size="sm" variant="primary" [title]="'ADMIN.BUSINESS_FIELDS.SEARCH' | translate"
                            (click)="searchUsers()">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </app-button>
                    </div>

                    @if (isLoadingUsers) {
                    <app-loading></app-loading>
                    } @else if (users.length === 0) {
                    <p class="text-sm text-gray-500 mt-3">
                        {{ (userSearch ? 'ADMIN.BUSINESS_FIELDS.USER_SEARCH_EMPTY' : 'ADMIN.BUSINESS_FIELDS.NO_USERS') | translate }}
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
                                @for (user of users; track user.userId + '-' + user.role) {
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
                    <div class="mt-3">
                        <app-pagination [pageNumber]="userPage" [pageSize]="userPageSize"
                            [totalCount]="userTotalCount" [totalPages]="userTotalPages"
                            [hasPreviousPage]="userHasPreviousPage" [hasNextPage]="userHasNextPage"
                            (pageChange)="onUserPageChange($event)" (pageSizeChange)="onUserPageSizeChange($event)">
                        </app-pagination>
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
    /** Lĩnh vực đang xem chi tiết — dùng cho tiêu đề modal (API phân trang không trả lại tên lĩnh vực). */
    detailField: BusinessFieldAdmin | null = null;

    /** Tab đang xem trong khối chi tiết: 'companies' | 'accounts'. */
    detailTab = 'companies';
    detailTabs: StatusTabItem[] = [];

    // --- Tab Công ty: phân trang + tìm kiếm phía server ---
    companies: BusinessFieldCompany[] = [];
    isLoadingCompanies = false;
    companyLoaded = false;
    /** Ô nhập hiện tại và từ khoá đã áp dụng (phân biệt đang gõ với lần tìm gần nhất). */
    companyKeyword = '';
    companySearch = '';
    companyPage = 1;
    companyPageSize = 10;
    companyTotalCount = 0;
    companyTotalPages = 0;
    companyHasPreviousPage = false;
    companyHasNextPage = false;

    // --- Tab Tài khoản: phân trang + tìm kiếm + lọc loại hồ sơ phía server ---
    users: BusinessFieldUser[] = [];
    isLoadingUsers = false;
    userLoaded = false;
    userKeyword = '';
    userSearch = '';
    /** '' = tất cả, 'Collaborator' | 'Partner' — gửi thẳng làm tham số role. */
    userRoleFilter = '';

    /** Tuỳ chọn lọc người dùng theo vai trò cho ô chọn của app. */
    get userRoleOptions(): SelectOption[] {
        return [
            { value: '', label: this.translate.instant('COMMON.ALL') },
            { value: 'Collaborator', label: this.translate.instant('ADMIN.BUSINESS_FIELDS.ROLE_COLLABORATOR') },
            { value: 'Partner', label: this.translate.instant('ADMIN.BUSINESS_FIELDS.ROLE_PARTNER') }
        ];
    }
    userPage = 1;
    userPageSize = 10;
    userTotalCount = 0;
    userTotalPages = 0;
    userHasPreviousPage = false;
    userHasNextPage = false;

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
        this.detailField = field;
        this.detailTab = 'companies';
        this.isDetailVisible = true;

        // Mỗi tab tự tải dữ liệu của mình; số trên tab lấy từ totalCount của API nên nạp cả hai
        // ngay khi mở để hai tab đều hiện đúng số lượng (không đếm trên client).
        this.resetCompanyTab();
        this.resetUserTab();
        this.detailTabs = this.buildDetailTabs(field.companyCount ?? 0, field.userCount ?? 0);

        this.loadCompanies();
        this.loadUsers();
    }

    /** Hai tab của khối chi tiết kèm số lượng — khởi tạo từ danh sách, cập nhật lại theo totalCount API. */
    private buildDetailTabs(companyCount: number, userCount: number): StatusTabItem[] {
        return [
            { key: 'companies', label: this.translate.instant('ADMIN.BUSINESS_FIELDS.TAB_COMPANIES'), count: companyCount },
            { key: 'accounts', label: this.translate.instant('ADMIN.BUSINESS_FIELDS.TAB_ACCOUNTS'), count: userCount }
        ];
    }

    /** Cập nhật số trên tab theo totalCount API trả về (không đếm trên client). */
    private setTabCount(key: string, count: number): void {
        this.detailTabs = this.detailTabs.map(tab => (tab.key === key ? { ...tab, count } : tab));
    }

    /** Đổi tab trong khối chi tiết — tab chưa từng tải thì tải khi mở tới. */
    onDetailTabChange(tab: string): void {
        this.detailTab = tab;
        if (tab === 'companies' && !this.companyLoaded) this.loadCompanies();
        if (tab === 'accounts' && !this.userLoaded) this.loadUsers();
    }

    // --- Tab Công ty ---

    private resetCompanyTab(): void {
        this.companies = [];
        this.companyLoaded = false;
        this.isLoadingCompanies = false;
        this.companyKeyword = '';
        this.companySearch = '';
        this.companyPage = 1;
        this.companyPageSize = 10;
        this.companyTotalCount = 0;
        this.companyTotalPages = 0;
        this.companyHasPreviousPage = false;
        this.companyHasNextPage = false;
    }

    /** Tải công ty của lĩnh vực theo trang/từ khoá hiện tại (phân trang phía server). */
    loadCompanies(): void {
        if (!this.detailField) return;
        this.isLoadingCompanies = true;
        this.service
            .getFieldCompanies(this.detailField.id, this.companyPage, this.companyPageSize, this.companySearch || undefined)
            .subscribe({
                next: res => {
                    this.companies = res?.data ?? [];
                    this.companyPage = res?.pageNumber ?? this.companyPage;
                    this.companyPageSize = res?.pageSize ?? this.companyPageSize;
                    this.companyTotalCount = res?.totalCount ?? 0;
                    this.companyTotalPages = res?.totalPages ?? 0;
                    this.companyHasPreviousPage = res?.hasPreviousPage ?? false;
                    this.companyHasNextPage = res?.hasNextPage ?? false;
                    this.companyLoaded = true;
                    this.setTabCount('companies', this.companyTotalCount);
                    this.isLoadingCompanies = false;
                },
                error: () => {
                    this.isLoadingCompanies = false;
                    this.toast.error(this.translate.instant('ADMIN.BUSINESS_FIELDS.LOAD_ERROR'));
                }
            });
    }

    /** Tìm công ty phía server: về trang 1 rồi tải lại. */
    searchCompanies(): void {
        this.companySearch = (this.companyKeyword || '').trim();
        this.companyPage = 1;
        this.loadCompanies();
    }

    onCompanyPageChange(page: number): void {
        this.companyPage = page;
        this.loadCompanies();
    }

    onCompanyPageSizeChange(size: number): void {
        this.companyPageSize = size;
        this.companyPage = 1;
        this.loadCompanies();
    }

    // --- Tab Tài khoản ---

    private resetUserTab(): void {
        this.users = [];
        this.userLoaded = false;
        this.isLoadingUsers = false;
        this.userKeyword = '';
        this.userSearch = '';
        this.userRoleFilter = '';
        this.userPage = 1;
        this.userPageSize = 10;
        this.userTotalCount = 0;
        this.userTotalPages = 0;
        this.userHasPreviousPage = false;
        this.userHasNextPage = false;
    }

    /** Tải tài khoản (CTV + đối tác) của lĩnh vực theo trang/từ khoá/loại hồ sơ hiện tại. */
    loadUsers(): void {
        if (!this.detailField) return;
        this.isLoadingUsers = true;
        this.service
            .getFieldUsers(
                this.detailField.id,
                this.userPage,
                this.userPageSize,
                this.userSearch || undefined,
                this.userRoleFilter || undefined
            )
            .subscribe({
                next: res => {
                    this.users = res?.data ?? [];
                    this.userPage = res?.pageNumber ?? this.userPage;
                    this.userPageSize = res?.pageSize ?? this.userPageSize;
                    this.userTotalCount = res?.totalCount ?? 0;
                    this.userTotalPages = res?.totalPages ?? 0;
                    this.userHasPreviousPage = res?.hasPreviousPage ?? false;
                    this.userHasNextPage = res?.hasNextPage ?? false;
                    this.userLoaded = true;
                    this.setTabCount('accounts', this.userTotalCount);
                    this.isLoadingUsers = false;
                },
                error: () => {
                    this.isLoadingUsers = false;
                    this.toast.error(this.translate.instant('ADMIN.BUSINESS_FIELDS.LOAD_ERROR'));
                }
            });
    }

    /** Tìm tài khoản phía server: về trang 1 rồi tải lại. */
    searchUsers(): void {
        this.userSearch = (this.userKeyword || '').trim();
        this.userPage = 1;
        this.loadUsers();
    }

    /** Đổi loại hồ sơ (CTV/đối tác): lọc ngay phía server, về trang 1. */
    onUserRoleChange(role: string): void {
        this.userRoleFilter = role || '';
        this.userPage = 1;
        this.loadUsers();
    }

    onUserPageChange(page: number): void {
        this.userPage = page;
        this.loadUsers();
    }

    onUserPageSizeChange(size: number): void {
        this.userPageSize = size;
        this.userPage = 1;
        this.loadUsers();
    }

    /** Nhãn loại hồ sơ (khoá i18n) — dùng cho cột và cho ô tìm kiếm tài khoản. */
    userRoleLabel(role: string): string {
        return role === 'Partner'
            ? 'ADMIN.BUSINESS_FIELDS.ROLE_PARTNER'
            : 'ADMIN.BUSINESS_FIELDS.ROLE_COLLABORATOR';
    }

    closeDetail(): void {
        this.isDetailVisible = false;
        this.detailField = null;
        this.resetCompanyTab();
        this.resetUserTab();
        this.detailTab = 'companies';
    }
}
