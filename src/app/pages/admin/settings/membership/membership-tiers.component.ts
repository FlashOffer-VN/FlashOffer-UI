import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { MembershipService } from '@core/services/membership.service';
import { MEMBERSHIP_LEVELS, MembershipTier, SaveMembershipTierRequest } from '@core/models/membership.model';
import { Permission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';

/**
 * Cấu hình điểm hạng thành viên: mốc doanh số tích luỹ để đạt hạng, phí rút sớm riêng,
 * hạn mức rút sớm theo tháng và thứ tự ưu tiên duyệt của từng hạng.
 */
@Component({
    selector: 'app-admin-membership-tiers',
    standalone: true,
    imports: [
        PurgeBarComponent,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        StatusTabsComponent,
        AppPricePipe
    ],
    template: `
        <div class="space-y-4">
            <div class="flex flex-wrap items-start gap-3">
                <div>
                    <h1 class="text-xl font-semibold text-gray-900">{{ 'ADMIN.MEMBERSHIP.TITLE' | translate }}</h1>
                    <p class="text-sm text-gray-500 mt-1">{{ 'ADMIN.MEMBERSHIP.SUBTITLE' | translate }}</p>
                </div>

                <div class="ml-auto flex items-center gap-3">
                    <span class="text-sm text-gray-500">{{ 'ADMIN.MEMBERSHIP.TOTAL' | translate }}: <strong>{{ tiers.length }}</strong></span>
                    @if (canManage && activeTab !== 'deleted') {
                        <app-button variant="primary" (click)="startCreate()">
                            <i class="fa-solid fa-plus mr-1"></i>{{ 'ADMIN.MEMBERSHIP.ADD' | translate }}
                        </app-button>
                    }
                </div>
            </div>

            <!-- Tab danh sách: đang áp dụng / đã xoá mềm (tab "Đã xóa") -->
            <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)"></app-status-tabs>

    <!-- Xoá vĩnh viễn: chỉ có ở tab "Đã xoá" (các tab khác chỉ xoá mềm) -->
    <app-purge-bar *ngIf="activeTab === 'deleted'" entity="membership-tiers" [selectedIds]="selectedIds"
        [showSelection]="false" (purged)="onPurged()"></app-purge-bar>

            <!-- Biểu mẫu thêm / sửa hạng -->
            @if (isEditing) {
                <form [formGroup]="form" (ngSubmit)="save()" class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                    <h2 class="text-base font-semibold text-gray-900">
                        {{ (editingId ? 'ADMIN.MEMBERSHIP.EDIT_TITLE' : 'ADMIN.MEMBERSHIP.CREATE_TITLE') | translate }}
                    </h2>

                    <div>
                        <div class="text-sm font-medium text-gray-700 mb-2">{{ 'ADMIN.MEMBERSHIP.FIELD_LEVEL' | translate }}</div>
                        <div class="flex flex-wrap items-center gap-2">
                            @for (level of levels; track level.value) {
                                <button type="button" class="px-3 py-1.5 rounded-lg border text-sm"
                                    [class]="form.get('level')?.value === level.value
                                        ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'"
                                    (click)="form.get('level')?.setValue(level.value)">
                                    {{ level.value }} · {{ level.label | translate }}
                                </button>
                            }
                        </div>
                        <p class="text-xs text-gray-500 mt-1">{{ 'ADMIN.MEMBERSHIP.FIELD_LEVEL_HINT' | translate }}</p>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <app-input formControlName="name" type="text" [id]="'tier_name'"
                            [label]="'ADMIN.MEMBERSHIP.FIELD_NAME' | translate"
                            [placeholder]="'ADMIN.MEMBERSHIP.FIELD_NAME_PLACEHOLDER' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('name')" [errorMessage]="errorOf('name')">
                        </app-input>

                        <app-input formControlName="minAccumulatedValue" [money]="true" [id]="'tier_min'"
                            [label]="'ADMIN.MEMBERSHIP.FIELD_MIN_VALUE' | translate"
                            [placeholder]="'1000000'" [required]="true"
                            [isInvalid]="isInvalid('minAccumulatedValue')" [errorMessage]="errorOf('minAccumulatedValue')">
                        </app-input>

                        <app-input formControlName="earlyWithdrawalFeeRate" type="number" [id]="'tier_fee'"
                            [label]="'ADMIN.MEMBERSHIP.FIELD_FEE' | translate"
                            [placeholder]="'5'"

                            [isInvalid]="isInvalid('earlyWithdrawalFeeRate')" [errorMessage]="errorOf('earlyWithdrawalFeeRate')">
                        </app-input>

                        <app-input formControlName="monthlyWithdrawalLimit" [money]="true" [id]="'tier_limit'"
                            [label]="'ADMIN.MEMBERSHIP.FIELD_LIMIT' | translate"
                            [placeholder]="'20000000'"

                            [isInvalid]="isInvalid('monthlyWithdrawalLimit')" [errorMessage]="errorOf('monthlyWithdrawalLimit')">
                        </app-input>

                        <app-input formControlName="approvalPriority" type="number" [id]="'tier_priority'"
                            [label]="'ADMIN.MEMBERSHIP.FIELD_PRIORITY' | translate"
                            [placeholder]="'1'" [required]="true"
                            [isInvalid]="isInvalid('approvalPriority')" [errorMessage]="errorOf('approvalPriority')">
                        </app-input>

                        <app-input formControlName="description" type="text" [id]="'tier_desc'"
                            [label]="'ADMIN.MEMBERSHIP.FIELD_DESCRIPTION' | translate"
                            [placeholder]="'ADMIN.MEMBERSHIP.FIELD_DESCRIPTION_PLACEHOLDER' | translate">
                        </app-input>
                    </div>

                    <div class="grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                        <p>{{ 'ADMIN.MEMBERSHIP.FIELD_MIN_VALUE_HINT' | translate }}</p>
                        <p>{{ 'ADMIN.MEMBERSHIP.FIELD_FEE_HINT' | translate }}</p>
                        <p>{{ 'ADMIN.MEMBERSHIP.FIELD_LIMIT_HINT' | translate }}</p>
                        <p>{{ 'ADMIN.MEMBERSHIP.FIELD_PRIORITY_HINT' | translate }}</p>
                    </div>

                    <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" formControlName="isActive"
                            class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                        <span>{{ 'ADMIN.MEMBERSHIP.FIELD_ACTIVE' | translate }}</span>
                    </label>

                    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <app-button type="button" variant="outline" (click)="cancel()">
                            {{ 'ADMIN.MEMBERSHIP.CANCEL' | translate }}
                        </app-button>
                        <app-button type="submit" variant="primary" [loading]="isSaving" [disabled]="isSaving">
                            <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'ADMIN.MEMBERSHIP.SAVE' | translate }}
                        </app-button>
                    </div>
                </form>
            }

            <!-- Danh sách hạng -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_LEVEL' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_NAME' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_MIN_VALUE' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_FEE' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_LIMIT' | translate }}</th>
                                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_PRIORITY' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_DESCRIPTION' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.MEMBERSHIP.COL_ACTIONS' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @if (isLoading) {
                                <tr><td colspan="9" class="px-4 py-10"><app-loading [inline]="true"></app-loading></td></tr>
                            } @else if (tiers.length === 0) {
                                <tr><td colspan="9" class="px-4 py-10 text-center text-gray-500">{{ 'ADMIN.MEMBERSHIP.EMPTY' | translate }}</td></tr>
                            } @else {
                                @for (tier of tiers; track tier.id) {
                                    <tr class="hover:bg-gray-50 align-top">
                                        <td class="px-4 py-3 w-px whitespace-nowrap">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                                                {{ 'ADMIN.MEMBERSHIP.LEVEL' | translate }} {{ tier.level }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 font-medium text-gray-900">{{ tier.name }}</td>
                                        <td class="px-4 py-3 text-right text-gray-800">{{ tier.minAccumulatedValue | appPrice }}</td>
                                        <td class="px-4 py-3 text-right text-gray-700">
                                            @if (tier.earlyWithdrawalFeeRate === null || tier.earlyWithdrawalFeeRate === undefined) {
                                                <span class="text-gray-400">{{ 'ADMIN.MEMBERSHIP.FEE_DEFAULT' | translate }}</span>
                                            } @else {
                                                {{ tier.earlyWithdrawalFeeRate }}%
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-right text-gray-700">
                                            @if (tier.monthlyWithdrawalLimit === null || tier.monthlyWithdrawalLimit === undefined) {
                                                <span class="text-gray-400">{{ 'ADMIN.MEMBERSHIP.NO_LIMIT' | translate }}</span>
                                            } @else {
                                                {{ tier.monthlyWithdrawalLimit | appPrice }}
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-center text-gray-700">{{ tier.approvalPriority }}</td>
                                        <td class="px-4 py-3 w-px whitespace-nowrap">
                                            @if (tier.isActive) {
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 whitespace-nowrap">{{ 'ADMIN.MEMBERSHIP.ACTIVE' | translate }}</span>
                                            } @else {
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">{{ 'ADMIN.MEMBERSHIP.INACTIVE' | translate }}</span>
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-gray-600 max-w-xs">{{ tier.description || '—' }}</td>
                                        <td class="px-4 py-3">
                                            @if (activeTab === 'deleted') {
                                                <div class="flex flex-wrap items-center justify-end gap-2">
                                                    @if (canRestore) {
                                                    <app-button size="sm" variant="primary" [disabled]="isRestoring" (click)="restore(tier)">
                                                        <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'COMMON.BUTTON.RESTORE' | translate }}
                                                    </app-button>
                                                    }
                                                </div>
                                            } @else if (canManage || canDelete) {
                                                <div class="flex flex-wrap items-center justify-end gap-2">
                                                    @if (canManage) {
                                                    <app-button size="sm" variant="outline" (click)="startEdit(tier)">
                                                        <i class="fa-solid fa-pen mr-1"></i>{{ 'ADMIN.MEMBERSHIP.ACTION_EDIT' | translate }}
                                                    </app-button>
                                                    }
                                                    @if (canDelete) {
                                                    <app-button size="sm" variant="danger" (click)="remove(tier)">
                                                        <i class="fa-solid fa-trash mr-1"></i>{{ 'ADMIN.MEMBERSHIP.ACTION_DELETE' | translate }}
                                                    </app-button>
                                                    }
                                                </div>
                                            } @else {
                                                <span class="text-gray-400">—</span>
                                            }
                                        </td>
                                    </tr>
                                }
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `
})
export class AdminMembershipTiersComponent implements OnInit {
    /** Các dòng đang tick ở tab "Đã xoá" — dùng cho xoá vĩnh viễn theo lựa chọn. */
    selectedIds: string[] = [];

    readonly levels = MEMBERSHIP_LEVELS;

    tiers: MembershipTier[] = [];
    readonly form: FormGroup;

    editingId: string | null = null;
    isEditing = false;
    isLoading = false;
    isSaving = false;
    isRestoring = false;

    /** Tab danh sách: 'all' (đang áp dụng) hoặc 'deleted' (đã xoá mềm). */
    activeTab = 'all';
    tabs: StatusTabItem[] = [];

    constructor(
        private readonly _appService: AppService,
        private readonly _membershipService: MembershipService,
        private readonly _fb: FormBuilder
    ) {
        this.form = this._fb.group({
            level: [1, [Validators.required]],
            name: ['', [Validators.required, Validators.maxLength(200)]],
            minAccumulatedValue: [0, [Validators.required, Validators.min(0)]],
            earlyWithdrawalFeeRate: [null, [Validators.min(0), Validators.max(100)]],
            monthlyWithdrawalLimit: [null, [Validators.min(0)]],
            approvalPriority: [10, [Validators.required, Validators.min(0)]],
            isActive: [true],
            description: ['', [Validators.maxLength(500)]]
        });
    }

    ngOnInit(): void {
        this.tabs = [{ key: 'all', label: this._appService.trans('COMMON.ALL') }];

        // Tab "Đã xóa" hiện khi có quyền xem hạng đã xoá (P141), khôi phục (P142) hoặc quản lý (P109)
        // — đúng cặp mã [HasPermission(ViewRestoreMembershipTier, RestoreMembershipTier, ManageMembershipTiers)] của API.
        if (this.canRestore) {
            this.tabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') });
        }
        this.load();
    }

    /** Quyền xem hạng đã xoá + khôi phục — [HasPermission(ViewRestoreMembershipTier, RestoreMembershipTier, ManageMembershipTiers)] (P141/P142/P109). */
    get canRestore(): boolean {
        return this._appService.permissionService.has([Permission.ViewRestoreMembershipTier, Permission.RestoreMembershipTier, Permission.ManageMembershipTiers]);
    }

    onTabChange(tab: string): void {
        if (tab === this.activeTab) return;
        this.activeTab = tab;
        this.isEditing = false;
        this.editingId = null;
        this.load();
    }

    /** Quyền thêm / sửa hạng thành viên — [HasPermission(UpdateMembershipTiers, ManageMembershipTiers)] (P126 | P109). */
    get canManage(): boolean {
        return this._appService.permissionService.has([Permission.UpdateMembershipTiers, Permission.ManageMembershipTiers]);
    }

    /** Quyền xoá hạng thành viên — [HasPermission(DeleteMembershipTiers, ManageMembershipTiers)] (P127 | P109). */
    get canDelete(): boolean {
        return this._appService.permissionService.has([Permission.DeleteMembershipTiers, Permission.ManageMembershipTiers]);
    }

    load(): void {
        this.isLoading = true;

        const request = this.activeTab === 'deleted'
            ? this._membershipService.getDeletedTiers()
            : this._membershipService.getTiers();

        request.subscribe({
            next: response => {
                this.tiers = response.data ?? [];
                this.isLoading = false;
            },
            error: error => {
                this.isLoading = false;
                this.tiers = [];
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Mở biểu mẫu thêm hạng mới với hạng kế tiếp được chọn sẵn. */
    startCreate(): void {
        const usedLevels = this.tiers.map(tier => tier.level);
        const nextLevel = this.levels.find(level => !usedLevels.includes(level.value))?.value ?? 1;

        this.editingId = null;
        this.form.reset({
            level: nextLevel,
            name: '',
            minAccumulatedValue: 0,
            earlyWithdrawalFeeRate: null,
            monthlyWithdrawalLimit: null,
            approvalPriority: 10,
            isActive: true,
            description: ''
        });
        this.isEditing = true;
    }

    startEdit(tier: MembershipTier): void {
        this.editingId = tier.id;
        this.form.reset({
            level: tier.level,
            name: tier.name,
            minAccumulatedValue: tier.minAccumulatedValue,
            earlyWithdrawalFeeRate: tier.earlyWithdrawalFeeRate ?? null,
            monthlyWithdrawalLimit: tier.monthlyWithdrawalLimit ?? null,
            approvalPriority: tier.approvalPriority,
            isActive: tier.isActive,
            description: tier.description ?? ''
        });
        this.isEditing = true;
    }

    cancel(): void {
        this.isEditing = false;
        this.editingId = null;
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this._appService.showError(this._appService.trans('ADMIN.MEMBERSHIP.ERROR_FORM_INVALID'));
            return;
        }

        const values = this.form.getRawValue();
        const request: SaveMembershipTierRequest = {
            level: Number(values.level),
            name: String(values.name ?? '').trim(),
            minAccumulatedValue: AdminMembershipTiersComponent._toNumber(values.minAccumulatedValue) ?? 0,
            earlyWithdrawalFeeRate: AdminMembershipTiersComponent._toNumber(values.earlyWithdrawalFeeRate),
            monthlyWithdrawalLimit: AdminMembershipTiersComponent._toNumber(values.monthlyWithdrawalLimit),
            approvalPriority: AdminMembershipTiersComponent._toNumber(values.approvalPriority) ?? 0,
            isActive: !!values.isActive,
            description: String(values.description ?? '').trim() || null
        };

        this.isSaving = true;
        this._membershipService.saveTier(request, this.editingId).subscribe({
            next: () => {
                this.isSaving = false;
                this.isEditing = false;
                this.editingId = null;
                this._appService.showSuccess(this._appService.trans('ADMIN.MEMBERSHIP.SUCCESS_SAVE'));
                this.load();
            },
            error: error => {
                this.isSaving = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    remove(tier: MembershipTier): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.MEMBERSHIP.CONFIRM_DELETE_TITLE'),
            message: this._appService.trans('ADMIN.MEMBERSHIP.CONFIRM_DELETE_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.MEMBERSHIP.ACTION_DELETE'),
            confirmVariant: 'danger'
        }).then(confirmed => {
            if (!confirmed) return;

            this._membershipService.deleteTier(tier.id).subscribe({
                next: () => {
                    this._appService.showSuccess(this._appService.trans('ADMIN.MEMBERSHIP.SUCCESS_DELETE'));
                    this.load();
                },
                error: error => this._appService.showError(this._appService.extractErrorMessage(error))
            });
        });
    }

    /** Khôi phục một hạng thành viên đã xoá mềm (tab "Đã xóa"). */
    restore(tier: MembershipTier): void {
        this.isRestoring = true;
        this._membershipService.restoreTier(tier.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.MEMBERSHIP.SUCCESS_RESTORE'));
                this.load();
            },
            error: error => {
                this.isRestoring = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    isInvalid(key: string): boolean {
        const control = this.form.get(key);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    errorOf(key: string): string {
        const control = this.form.get(key);
        if (!control?.errors) return '';
        if (control.errors['required']) return this._appService.trans('ADMIN.MEMBERSHIP.ERROR_REQUIRED');
        return this._appService.trans('ADMIN.MEMBERSHIP.ERROR_RANGE');
    }

    /** Chuỗi rỗng (ô số để trống) thành null — API hiểu là "dùng mức chung / không giới hạn". */
    private static _toNumber(value: unknown): number | null {
        if (value === null || value === undefined || value === '') return null;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }

    /** Sau khi xoá vĩnh viễn: nạp lại danh sách của tab 'Đã xoá'. */
    onPurged(): void {
        this.load();
    }
}
