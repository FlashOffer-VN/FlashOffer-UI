// pages/admin/revenue/revenue-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { RevenueExpenseTypeService } from '@core/services/revenue-expense-type.service';
import { RevenueConfig, RevenueExpenseType, RevenueTransactionType } from '@core/models/revenue.model';
import { Permission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';

/**
 * Cấu hình doanh thu dùng chung cho mọi giao dịch: tỷ lệ thuế và cách hiểu số doanh thu nhập vào,
 * kèm danh mục loại chi phí (có thể gắn riêng cho từng loại giao dịch hoặc để mặc định).
 * Từng bản khai vẫn có thể ghi đè tỷ lệ riêng khi cần.
 */
@Component({
    selector: 'app-admin-revenue-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, InputComponent, LoadingComponent,
        StatusTabsComponent, HasPermissionDirective, PurgeBarComponent],
    template: `
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">{{ 'ADMIN.SETTINGS.REVENUE_PAGE_TITLE' | translate }}</h1>
                <p class="mt-1 text-sm text-gray-500">{{ 'ADMIN.SETTINGS.SECTION_REVENUE_DESC' | translate }}</p>
            </div>

            @if (isLoading) {
            <app-loading></app-loading>
            } @else {
            <form [formGroup]="form" (ngSubmit)="save()" class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <app-input formControlName="revenueTaxPercent" type="number" placeholder="0"
                    [label]="'ADMIN.SETTINGS.FIELD_REVENUE_TAX_PERCENT' | translate"
                    [hint]="'ADMIN.SETTINGS.FIELD_REVENUE_TAX_PERCENT_HINT' | translate"></app-input>

                <label class="flex items-start gap-2 text-sm text-gray-700">
                    <input type="checkbox" formControlName="revenueTaxIncluded" class="mt-1 h-4 w-4 rounded border-gray-300">
                    <span>
                        {{ 'ADMIN.SETTINGS.FIELD_REVENUE_TAX_INCLUDED' | translate }}
                        <span class="block text-xs text-gray-500">{{ 'ADMIN.SETTINGS.FIELD_REVENUE_TAX_INCLUDED_HINT' | translate }}</span>
                    </span>
                </label>

                <div class="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <app-button type="submit" variant="primary" [loading]="isSaving" [disabled]="isSaving || isLoading">
                        <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'COMMON.BUTTON.SAVE' | translate }}
                    </app-button>
                    <app-button type="button" variant="outline" (click)="load()" [disabled]="isSaving || isLoading">
                        <i class="fa-solid fa-rotate-right mr-1"></i>{{ 'COMMON.BUTTON.RESTORE' | translate }}
                    </app-button>
                </div>
            </form>

            <!-- Danh mục loại chi phí dùng khi khai doanh thu -->
            <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <div>
                    <h2 class="text-base font-semibold text-gray-900">{{ 'ADMIN.REVENUE.EXPENSE_SECTION_TITLE' | translate }}</h2>
                    <p class="mt-1 text-xs text-gray-500">{{ 'ADMIN.REVENUE.EXPENSE_SECTION_DESC' | translate }}</p>
                </div>

                <app-loading *ngIf="isLoadingExpenses"></app-loading>

                <!-- Tab danh mục: đang dùng / đã xoá mềm (tab "Đã xóa") -->
                <app-status-tabs [items]="expenseTabs" [active]="expenseTab" (change)="onExpenseTabChange($event)"></app-status-tabs>

    <!-- Xoá vĩnh viễn: chỉ có ở tab "Đã xoá" (các tab khác chỉ xoá mềm) -->
    <app-purge-bar *ngIf="expenseTab === 'deleted'" entity="revenue-configs" [selectedIds]="selectedIds"
        [showSelection]="false" (purged)="onPurged()"></app-purge-bar>

                <div *ngIf="!isLoadingExpenses" class="overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                                <th class="w-10 px-3 py-2"></th>
                                <th class="px-3 py-2">{{ 'ADMIN.REVENUE.EXPENSE_COL_NAME' | translate }}</th>
                                <th class="px-3 py-2">{{ 'ADMIN.REVENUE.EXPENSE_COL_APPLIED' | translate }}</th>
                                <th class="w-24 px-3 py-2 text-right">{{ 'COMMON.BUTTON.ACTION' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let item of expenseTypes" class="border-b border-gray-50">
                                <td class="px-3 py-2">
                                    <input *ngIf="expenseTab !== 'deleted'" type="checkbox" class="h-4 w-4 rounded border-gray-300"
                                        [checked]="isExpenseSelected(item.id)" (change)="toggleExpenseSelection(item.id)">
                                </td>
                                <td class="px-3 py-2 text-gray-800">{{ item.name }}</td>
                                <td class="px-3 py-2 text-gray-500">{{ transactionTypesText(item.transactionTypes) }}</td>
                                <td class="px-3 py-2">
                                    <div class="flex items-center justify-end gap-2">
                                        <ng-container *ngIf="expenseTab !== 'deleted'">
                                        <app-button variant="secondary" size="sm"
                                            *appHasPermission="[Permission.UpdateRevenueConfig, Permission.ManageRevenueConfig]"
                                            [title]="'COMMON.BUTTON.EDIT' | translate" (onClick)="startEditExpense(item)">
                                            <i class="fa-solid fa-pen"></i>
                                        </app-button>
                                        <app-button variant="danger" size="sm"
                                            *appHasPermission="[Permission.DeleteRevenueConfig, Permission.ManageRevenueConfig]"
                                            [title]="'COMMON.BUTTON.DELETE' | translate" (onClick)="deleteExpense(item)">
                                            <i class="fa-solid fa-trash"></i>
                                        </app-button>
                                        </ng-container>
                                        <ng-container *ngIf="expenseTab === 'deleted'">
                                            <app-button variant="primary" size="sm"
                                                *appHasPermission="[Permission.ViewRestoreRevenueConfig, Permission.RestoreRevenueConfig, Permission.ManageRevenueConfig]"
                                                [disabled]="isRestoringExpense"
                                                [title]="'COMMON.BUTTON.RESTORE' | translate" (onClick)="restoreExpense(item)">
                                                <i class="fa-solid fa-rotate-left"></i>
                                            </app-button>
                                        </ng-container>
                                    </div>
                                </td>
                            </tr>
                            <tr *ngIf="!expenseTypes.length">
                                <td colspan="4" class="px-3 py-4 text-center text-gray-400">
                                    {{ 'ADMIN.REVENUE.EXPENSE_EMPTY_TABLE' | translate }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Gán hàng loạt: tích các loại ở bảng rồi chọn loại giao dịch và bấm Áp dụng -->
                <div *ngIf="expenseTab !== 'deleted'" class="rounded-lg bg-gray-50 p-3 space-y-2">
                    <div class="text-sm font-medium text-gray-700">{{ 'ADMIN.REVENUE.EXPENSE_ASSIGN_TITLE' | translate }}</div>
                    <p class="text-xs text-gray-500">{{ 'ADMIN.REVENUE.EXPENSE_ASSIGN_HINT' | translate }}</p>
                    <div class="flex flex-wrap items-center gap-4">
                        <label *ngFor="let t of transactionTypes" class="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" class="h-4 w-4 rounded border-gray-300"
                                [checked]="isAssignTypeSelected(t)" (change)="toggleAssignType(t)">
                            {{ transactionTypeLabel(t) }}
                        </label>
                        <app-button variant="primary" size="sm" [loading]="isAssigning" (onClick)="applyAssign()">
                            {{ 'COMMON.BUTTON.APPLY' | translate }}
                        </app-button>
                    </div>
                    <p class="text-xs text-gray-500">
                        {{ 'ADMIN.REVENUE.EXPENSE_ASSIGN_SELECTED' | translate: { count: selectedExpenseIds.length } }}
                    </p>
                </div>

                <!-- Thêm hoặc sửa một loại chi phí -->
                <form *ngIf="expenseTab !== 'deleted'" [formGroup]="expenseForm" (ngSubmit)="saveExpense()" class="rounded-lg border border-gray-100 p-3 space-y-3">
                    <div class="text-sm font-medium text-gray-700">
                        {{ (editingExpenseId ? 'ADMIN.REVENUE.EXPENSE_EDIT_TITLE' : 'ADMIN.REVENUE.EXPENSE_ADD_TITLE') | translate }}
                    </div>
                    <div class="grid gap-3 sm:grid-cols-2">
                        <app-input formControlName="name"
                            [label]="'ADMIN.REVENUE.EXPENSE_FIELD_NAME' | translate"
                            [placeholder]="'ADMIN.REVENUE.EXPENSE_FIELD_NAME_PLACEHOLDER' | translate"></app-input>
                        <div>
                            <span class="mb-1 block text-sm font-medium text-gray-700">{{ 'ADMIN.REVENUE.EXPENSE_FIELD_TYPES' | translate }}</span>
                            <div class="flex flex-wrap items-center gap-4">
                                <label *ngFor="let t of transactionTypes" class="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" class="h-4 w-4 rounded border-gray-300"
                                        [checked]="isFormTypeSelected(t)" (change)="toggleFormType(t)">
                                    {{ transactionTypeLabel(t) }}
                                </label>
                            </div>
                            <p class="mt-1 text-xs text-gray-500">{{ 'ADMIN.REVENUE.EXPENSE_FIELD_TYPES_HINT' | translate }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <app-button type="submit" variant="primary" [loading]="isSavingExpense">
                            <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'COMMON.BUTTON.SAVE' | translate }}
                        </app-button>
                        <app-button *ngIf="editingExpenseId" type="button" variant="outline" (onClick)="cancelEditExpense()">
                            {{ 'COMMON.BUTTON.CANCEL' | translate }}
                        </app-button>
                    </div>
                </form>
            </div>
            }
        </div>
    `
})
export class AdminRevenueSettingsComponent implements OnInit {
    /** Các dòng đang tick ở tab "Đã xoá" — dùng cho xoá vĩnh viễn theo lựa chọn. */
    selectedIds: string[] = [];

    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    form!: FormGroup;
    isLoading = false;
    isSaving = false;

    /** Danh mục loại chi phí đang cấu hình. */
    expenseTypes: RevenueExpenseType[] = [];
    isLoadingExpenses = false;
    isSavingExpense = false;
    isAssigning = false;
    isRestoringExpense = false;

    /** Tab danh mục loại chi phí: 'all' (đang dùng) hoặc 'deleted' (đã xoá mềm). */
    expenseTab = 'all';
    expenseTabs: StatusTabItem[] = [];

    /** Id loại chi phí đang sửa; null là đang thêm mới. */
    editingExpenseId: string | null = null;
    /** Các loại chi phí được tích để gán hàng loạt. */
    selectedExpenseIds: string[] = [];
    /** Loại giao dịch đích của thao tác gán hàng loạt. */
    assignTransactionTypes: number[] = [];
    /** Loại giao dịch đang tích trong form thêm/sửa. */
    formTransactionTypes: number[] = [];

    /** Form thêm hoặc sửa một loại chi phí. */
    expenseForm!: FormGroup;

    /** Hai loại giao dịch có thể gắn cho loại chi phí. */
    readonly transactionTypes: RevenueTransactionType[] = [
        RevenueTransactionType.PurchaseRequest,
        RevenueTransactionType.GroupBuyingRequest
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private _expenseTypeService: RevenueExpenseTypeService,
        private _appService: AppService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            revenueTaxPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            revenueTaxIncluded: [false]
        });

        this.expenseForm = this._formBuilder.group({
            name: ['', [Validators.required]]
        });

        this.buildExpenseTabs();
        this.load();
        this.loadExpenseTypes();
    }

    private buildExpenseTabs(): void {
        this.expenseTabs = [{ key: 'all', label: this._appService.trans('COMMON.ALL') }];

        // Tab "Đã xóa" hiện khi có quyền xem loại chi phí đã xoá (P143), khôi phục (P144) hoặc quản lý (P114)
        // — đúng cặp mã [HasPermission(ViewRestoreRevenueConfig, RestoreRevenueConfig, ManageRevenueConfig)] của API.
        if (this._appService.permissionService.has([Permission.ViewRestoreRevenueConfig, Permission.RestoreRevenueConfig, Permission.ManageRevenueConfig])) {
            this.expenseTabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') });
        }
    }

    onExpenseTabChange(tab: string): void {
        if (tab === this.expenseTab) return;
        this.expenseTab = tab;
        this.selectedExpenseIds = [];
        this.cancelEditExpense();
        this.loadExpenseTypes();
    }

    load(): void {
        this.isLoading = true;

        this._expenseTypeService.getConfig().subscribe({
            next: response => {
                this.form.patchValue({
                    revenueTaxPercent: response.data?.revenueTaxPercent ?? 0,
                    revenueTaxIncluded: response.data?.revenueTaxIncluded ?? false
                });
                this.isLoading = false;
            },
            error: error => {
                this.isLoading = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this._appService.showError(this._appService.trans('ADMIN.SETTINGS.ERROR_FORM_INVALID'));
            return;
        }

        const value = this.form.getRawValue();
        const request: RevenueConfig = {
            revenueTaxPercent: Number(value.revenueTaxPercent) || 0,
            revenueTaxIncluded: !!value.revenueTaxIncluded
        };

        this.isSaving = true;

        this._expenseTypeService.saveConfig(request).subscribe({
            next: () => {
                this.isSaving = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.SETTINGS.SAVED'));
            },
            error: error => {
                this.isSaving = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Nhãn của một loại giao dịch. */
    transactionTypeLabel(type: number): string {
        return this._appService.trans(
            type === RevenueTransactionType.GroupBuyingRequest
                ? 'ADMIN.REVENUE.TYPE_GROUP_BUYING'
                : 'ADMIN.REVENUE.TYPE_PURCHASE_REQUEST'
        );
    }

    /** Danh sách loại giao dịch áp dụng của một loại chi phí; rỗng thì hiện là mặc định. */
    transactionTypesText(types: number[]): string {
        if (!types || !types.length) {
            return this._appService.trans('ADMIN.REVENUE.EXPENSE_DEFAULT');
        }
        return types.map(type => this.transactionTypeLabel(type)).join(', ');
    }

    /** Tải toàn bộ loại chi phí đã cấu hình. */
    loadExpenseTypes(): void {
        this.isLoadingExpenses = true;
        const request = this.expenseTab === 'deleted'
            ? this._expenseTypeService.getDeleted()
            : this._expenseTypeService.getAll();
        request.subscribe({
            next: response => {
                this.expenseTypes = response.data ?? [];
                this.isLoadingExpenses = false;
            },
            error: error => {
                this.isLoadingExpenses = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    //#region Tích chọn loại giao dịch trong form thêm/sửa

    isFormTypeSelected(type: number): boolean {
        return this.formTransactionTypes.includes(type);
    }

    toggleFormType(type: number): void {
        this.formTransactionTypes = ToggleNumber(this.formTransactionTypes, type);
    }

    //#endregion

    //#region Tích chọn cho thao tác gán hàng loạt

    isExpenseSelected(id: string): boolean {
        return this.selectedExpenseIds.includes(id);
    }

    toggleExpenseSelection(id: string): void {
        this.selectedExpenseIds = this.selectedExpenseIds.includes(id)
            ? this.selectedExpenseIds.filter(item => item !== id)
            : [...this.selectedExpenseIds, id];
    }

    isAssignTypeSelected(type: number): boolean {
        return this.assignTransactionTypes.includes(type);
    }

    toggleAssignType(type: number): void {
        this.assignTransactionTypes = ToggleNumber(this.assignTransactionTypes, type);
    }

    /** Gán các loại chi phí đã tích cho các loại giao dịch đang chọn; để trống loại giao dịch là về mặc định. */
    applyAssign(): void {
        if (!this.selectedExpenseIds.length) {
            this._appService.showError(this._appService.trans('ADMIN.REVENUE.EXPENSE_ASSIGN_NONE'));
            return;
        }

        this.isAssigning = true;
        this._expenseTypeService.assign({
            expenseTypeIds: [...this.selectedExpenseIds],
            transactionTypes: [...this.assignTransactionTypes]
        }).subscribe({
            next: () => {
                this.isAssigning = false;
                this.selectedExpenseIds = [];
                this.assignTransactionTypes = [];
                this._appService.showSuccess(this._appService.trans('ADMIN.REVENUE.EXPENSE_ASSIGN_DONE'));
                this.loadExpenseTypes();
            },
            error: error => {
                this.isAssigning = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    //#endregion

    /** Đưa form về trạng thái sửa một loại chi phí. */
    startEditExpense(item: RevenueExpenseType): void {
        this.editingExpenseId = item.id;
        this.expenseForm.patchValue({ name: item.name });
        this.formTransactionTypes = [...(item.transactionTypes ?? [])];
    }

    /** Bỏ chế độ sửa, đưa form về thêm mới. */
    cancelEditExpense(): void {
        this.editingExpenseId = null;
        this.expenseForm.reset({ name: '' });
        this.formTransactionTypes = [];
    }

    /** Thêm mới hoặc cập nhật loại chi phí theo form đang mở. */
    saveExpense(): void {
        if (this.expenseForm.invalid) {
            this.expenseForm.markAllAsTouched();
            this._appService.showError(this._appService.trans('ADMIN.REVENUE.EXPENSE_FIELD_NAME_REQUIRED'));
            return;
        }

        const name = String(this.expenseForm.value.name ?? '').trim();
        if (!name) {
            return;
        }

        const editing = this.expenseTypes.find(item => item.id === this.editingExpenseId);
        const request = {
            name,
            sortOrder: editing?.sortOrder,
            transactionTypes: [...this.formTransactionTypes]
        };

        this.isSavingExpense = true;
        const call = this.editingExpenseId
            ? this._expenseTypeService.update(this.editingExpenseId, request)
            : this._expenseTypeService.create(request);

        call.subscribe({
            next: () => {
                this.isSavingExpense = false;
                this.cancelEditExpense();
                this._appService.showSuccess(this._appService.trans('ADMIN.REVENUE.EXPENSE_SAVED'));
                this.loadExpenseTypes();
            },
            error: error => {
                this.isSavingExpense = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Xóa một loại chi phí sau khi xác nhận. */
    deleteExpense(item: RevenueExpenseType): void {
        this._appService.confirmDelete(this._appService.trans('ADMIN.REVENUE.EXPENSE_DELETE_CONFIRM')).then(confirmed => {
            if (!confirmed) return;

            this._expenseTypeService.remove(item.id).subscribe({
                next: () => {
                    this.selectedExpenseIds = this.selectedExpenseIds.filter(id => id !== item.id);
                    if (this.editingExpenseId === item.id) {
                        this.cancelEditExpense();
                    }
                    this._appService.showSuccess(this._appService.trans('ADMIN.REVENUE.EXPENSE_DELETED'));
                    this.loadExpenseTypes();
                },
                error: error => this._appService.showError(this._appService.extractErrorMessage(error))
            });
        });
    }

    /** Khôi phục một loại chi phí đã xoá mềm (tab "Đã xóa"). */
    restoreExpense(item: RevenueExpenseType): void {
        this.isRestoringExpense = true;
        this._expenseTypeService.restore(item.id).subscribe({
            next: () => {
                this.isRestoringExpense = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.REVENUE.EXPENSE_RESTORED'));
                this.loadExpenseTypes();
            },
            error: error => {
                this.isRestoringExpense = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Sau khi xoá vĩnh viễn ở tab "Đã xoá": nạp lại danh sách. */
    onPurged(): void {
        this.load();
    }
}

/** Thêm hoặc bỏ một số khỏi mảng chọn. */
function ToggleNumber(values: number[], value: number): number[] {
    return values.includes(value) ? values.filter(item => item !== value) : [...values, value];
}
