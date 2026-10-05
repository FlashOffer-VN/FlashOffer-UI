import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { BusinessFieldService } from '@core/services/business-field.service';
import { ToastService } from '@core/services/toast.service';
import {
    BusinessFieldAdmin,
    BusinessFieldFormValue,
    BusinessFieldRelated
} from '@core/models/business-field.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

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
        ModalComponent
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
                <app-button variant="primary" (click)="openCreate()">
                    <i class="fa-solid fa-plus mr-1"></i>{{ 'ADMIN.BUSINESS_FIELDS.ADD' | translate }}
                </app-button>
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
                                <th class="px-4 py-3">{{ 'ADMIN.BUSINESS_FIELDS.COL_CODE' | translate }}</th>
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
                                <td class="px-4 py-3 text-sm font-medium text-gray-700">{{ field.businessFieldCode || '--' }}</td>
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
                                <td class="px-4 py-3 text-sm">
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
                                        <app-button size="sm" variant="outline" [title]="'ADMIN.BUSINESS_FIELDS.EDIT' | translate"
                                            (click)="openEdit(field)">
                                            <i class="fa-solid fa-pen"></i>
                                        </app-button>
                                        <app-button size="sm" variant="outline" [title]="'ADMIN.BUSINESS_FIELDS.DELETE' | translate"
                                            (click)="askDelete(field)">
                                            <i class="fa-solid fa-trash text-red-600"></i>
                                        </app-button>
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
                : 'ADMIN.BUSINESS_FIELDS.FORM_CREATE_TITLE') | translate" size="md" (closed)="closeForm()">
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
            (closed)="cancelDelete()">
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

        <!-- Công ty và tài khoản thuộc lĩnh vực -->
        <app-modal [(visible)]="isDetailVisible" [title]="'ADMIN.BUSINESS_FIELDS.DETAIL_TITLE' | translate" size="lg"
            (closed)="closeDetail()">
            @if (isLoadingDetail) {
            <app-loading></app-loading>
            } @else if (detail) {
            <div class="space-y-5">
                <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span class="font-medium text-gray-900">{{ detail.name }}</span>
                    @if (detail.businessFieldCode) {
                    <span class="text-xs text-gray-500">{{ detail.businessFieldCode }}</span>
                    }
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-2">
                        {{ 'ADMIN.BUSINESS_FIELDS.DETAIL_COMPANIES' | translate }} ({{ detail.companies.length }})
                    </h3>
                    @if (detail.companies.length === 0) {
                    <p class="text-sm text-gray-500">{{ 'ADMIN.BUSINESS_FIELDS.NO_COMPANIES' | translate }}</p>
                    } @else {
                    <div class="border border-gray-200 rounded-lg overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_CODE' | translate }}</th>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_NAME' | translate }}</th>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_TAX' | translate }}</th>
                                    <th class="px-3 py-2 text-center">{{ 'ADMIN.BUSINESS_FIELDS.ROLE_COLLABORATOR' | translate }}</th>
                                    <th class="px-3 py-2 text-center">{{ 'ADMIN.BUSINESS_FIELDS.ROLE_PARTNER' | translate }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @for (company of detail.companies; track company.id) {
                                <tr>
                                    <td class="px-3 py-2 text-gray-700">{{ company.companyCode || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-900">{{ company.name }}</td>
                                    <td class="px-3 py-2 text-gray-600">{{ company.taxCode || '--' }}</td>
                                    <td class="px-3 py-2 text-center text-gray-700">{{ company.collaboratorCount }}</td>
                                    <td class="px-3 py-2 text-center text-gray-700">{{ company.partnerCount }}</td>
                                </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    }
                </div>

                <div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-2">
                        {{ 'ADMIN.BUSINESS_FIELDS.DETAIL_USERS' | translate }} ({{ detail.users.length }})
                    </h3>
                    @if (detail.users.length === 0) {
                    <p class="text-sm text-gray-500">{{ 'ADMIN.BUSINESS_FIELDS.NO_USERS' | translate }}</p>
                    } @else {
                    <div class="border border-gray-200 rounded-lg overflow-x-auto">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th class="px-3 py-2">{{ 'COMMON.CODE.ACCOUNT' | translate }}</th>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.USER_NAME' | translate }}</th>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.USER_PHONE' | translate }}</th>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.USER_ROLE' | translate }}</th>
                                    <th class="px-3 py-2">{{ 'ADMIN.BUSINESS_FIELDS.COMPANY_NAME' | translate }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @for (user of detail.users; track $index) {
                                <tr>
                                    <td class="px-3 py-2 text-gray-700">{{ user.userCode || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-900">{{ user.fullName || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-600">{{ user.phone || '--' }}</td>
                                    <td class="px-3 py-2 text-gray-600">
                                        {{ (user.role === 'Partner'
                                            ? 'ADMIN.BUSINESS_FIELDS.ROLE_PARTNER'
                                            : 'ADMIN.BUSINESS_FIELDS.ROLE_COLLABORATOR') | translate }}
                                    </td>
                                    <td class="px-3 py-2 text-gray-600">{{ user.companyName || '--' }}</td>
                                </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                    }
                </div>
            </div>
            }
        </app-modal>
    `
})
export class AdminBusinessFieldListComponent implements OnInit {
    private service = inject(BusinessFieldService);
    private toast = inject(ToastService);
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
        this.isDetailVisible = true;
        this.isLoadingDetail = true;

        this.service.getRelated(field.id).subscribe({
            next: related => {
                this.detail = related;
                this.isLoadingDetail = false;
            },
            error: () => {
                this.isLoadingDetail = false;
                this.toast.error(this.translate.instant('ADMIN.BUSINESS_FIELDS.LOAD_ERROR'));
            }
        });
    }

    closeDetail(): void {
        this.isDetailVisible = false;
        this.detail = null;
        this.isLoadingDetail = false;
    }
}
