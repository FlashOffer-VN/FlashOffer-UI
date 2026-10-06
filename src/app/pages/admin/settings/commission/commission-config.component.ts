import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { RadioGroupComponent, RadioOption } from '@shared/components/radio-group/radio-group.component';
import { CommissionService } from '@core/services/commission.service';
import { CommissionBeneficiary, CommissionConfig, CommissionTier } from '@core/models/commission.model';
import { CommissionType, getCommissionTypeLabel } from '@core/models/partner.model';
import { Permission } from '@core/models/permission.model';

import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { UserPickerComponent, UserPickerItem } from '@shared/components/user-picker/user-picker.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';

/**
 * Cấu hình mức hoa hồng cho người giới thiệu và đối tác: một bản dùng chung cho mọi tài khoản
 * hoặc bản riêng cho một/nhiều tài khoản được chọn. Bản riêng luôn ưu tiên hơn bản chung.
 */
@Component({
    selector: 'app-admin-commission-config',
    standalone: true,
    imports: [
        PurgeBarComponent,
        CommonModule,
        FormsModule,
        RadioGroupComponent,
        TranslateModule,
        AppDatePipe,
        AppPricePipe,
        LoadingComponent,
        UserPickerComponent,
        StatusTabsComponent,
        ButtonComponent,
        InputComponent,
        BadgeComponent,
        NgSelectWrapperComponent,
        HasPermissionDirective,
        CheckboxComponent
    ],
    template: `
        <div class="grid gap-4 lg:grid-cols-[1fr_380px]">
            <section class="space-y-4">
                <!-- Phạm vi áp dụng -->
                <div class="bg-white rounded-lg border border-gray-200 p-4">
                    <p class="text-sm font-semibold text-gray-700 mb-3">{{ 'COMMISSION.SCOPE_TITLE' | translate }}</p>
                    <div class="flex flex-wrap gap-4">
                        <app-radio-group orientation="horizontal" [options]="scopeOptions" [ngModel]="scope"
                            (ngModelChange)="setScope($event)" />
                    </div>

                    @if (scope === 'users') {
                        <div class="mt-3">
                            <app-user-picker [users]="candidates" [loading]="isLoadingCandidates"
                                [selectedIds]="selectedIds"
                                (selectedIdsChange)="selectedIds = $event"
                                (searchChange)="loadCandidates($event)">
                            </app-user-picker>
                            <p class="text-xs text-gray-500 mt-2">
                                {{ 'COMMISSION.SELECTED' | translate }}: <strong>{{ selectedIds.length }}</strong>
                            </p>
                        </div>
                    }
                </div>

                <!-- Mức hoa hồng -->
                <div class="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                    <p class="text-sm font-semibold text-gray-700">{{ 'COMMISSION.FORM_TITLE' | translate }}</p>

                    <div class="grid gap-3 md:grid-cols-2">
                        <app-ng-select-wrapper [(ngModel)]="type" [items]="typeOptions"
                            [label]="'COMMISSION.TYPE' | translate"
                            [placeholder]="'COMMON.SELECT_PLACEHOLDER' | translate"
                            [id]="'commission_type'">
                        </app-ng-select-wrapper>

                        <app-input [(ngModel)]="rate" [type]="'number'" [id]="'commission_rate'"
                            [placeholder]="'5'"
                            [label]="('COMMISSION.RATE' | translate) + ' (' + (rateUnitKey | translate) + ')'">
                        </app-input>

                        <app-input [(ngModel)]="minOrderValue" [money]="true" [id]="'commission_min_order'"
                            [placeholder]="'500000'"
                            [label]="'COMMISSION.MIN_ORDER' | translate">
                        </app-input>

                        <app-input [(ngModel)]="maxCommission" [money]="true" [id]="'commission_max'"
                            [placeholder]="'500000'"
                            [label]="'COMMISSION.MAX_COMMISSION' | translate">
                        </app-input>
                    </div>

                    @if (isTiered) {
                        <div class="border-t border-gray-100 pt-3">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium text-gray-700">{{ 'COMMISSION.TIERS' | translate }}</p>
                                <app-button variant="ghost" size="sm" (click)="addTier()">
                                    <i class="fa-solid fa-plus mr-1"></i>{{ 'COMMISSION.TIER_ADD' | translate }}
                                </app-button>
                            </div>
                            @for (tier of tiers; track $index) {
                                <div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end mt-2">
                                    <app-input [(ngModel)]="tier.fromValue" [money]="true"
                                        [placeholder]="'COMMISSION.TIER_FROM' | translate">
                                    </app-input>
                                    <app-input [(ngModel)]="tier.toValue" [money]="true"
                                        [placeholder]="'COMMISSION.TIER_TO' | translate">
                                    </app-input>
                                    <app-input [(ngModel)]="tier.rate" [type]="'number'"
                                        [placeholder]="'COMMISSION.TIER_RATE' | translate">
                                    </app-input>
                                    <app-button variant="ghost" size="sm" [title]="'COMMON.BUTTON.DELETE' | translate"
                                        (click)="removeTier($index)">
                                        <i class="fa-solid fa-trash"></i>
                                    </app-button>
                                </div>
                            }
                        </div>
                    }

                    <label class="flex flex-col text-sm text-gray-700">
                        {{ 'COMMISSION.NOTE' | translate }}
                        <textarea rows="2" [(ngModel)]="note"
                            [placeholder]="'COMMISSION.NOTE_PLACEHOLDER' | translate"
                            class="mt-auto w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                    </label>

                    <label class="flex items-center gap-2 text-sm text-gray-700">
                        <app-checkbox [(ngModel)]="isActive" /> {{ 'COMMISSION.ACTIVE' | translate }}
                    </label>

                    <div class="flex items-center gap-2 pt-1">
                        <app-button variant="primary" [loading]="isSaving" (click)="save()">
                            <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'COMMISSION.SAVE' | translate }}
                        </app-button>
                        @if (editingId) {
                            <app-button variant="outline" (click)="resetForm()">
                                {{ 'COMMISSION.CANCEL_EDIT' | translate }}
                            </app-button>
                        }
                    </div>
                </div>
            </section>

            <!-- Cấu hình đang áp dụng -->
            <aside class="bg-white rounded-lg border border-gray-200 p-4">
                <app-status-tabs [items]="beneficiaryTabs" [active]="beneficiaryKey" (change)="onBeneficiaryChange($event)">
                </app-status-tabs>

    <!-- Xoá vĩnh viễn: chỉ có ở tab "Đã xoá" (các tab khác chỉ xoá mềm) -->
    <app-purge-bar *ngIf="beneficiaryKey === 'deleted'" entity="commissions" (purged)="onPurged()"></app-purge-bar>

                @if (isLoading) {
                    <app-loading></app-loading>
                } @else if (configs.length === 0) {
                    <p class="text-sm text-gray-500 py-6 text-center">{{ 'COMMISSION.EMPTY' | translate }}</p>
                } @else {
                    @for (config of configs; track config.id) {
                        <div class="border border-gray-200 rounded-lg p-3 mt-3">
                            <div class="flex items-start justify-between gap-2">
                                <div>
                                    <app-badge size="sm" [showDot]="false"
                                        [variant]="config.isGlobal ? 'info' : 'warning'"
                                        [label]="(config.isGlobal ? 'COMMISSION.BADGE_GLOBAL' : 'COMMISSION.BADGE_PERSONAL') | translate">
                                    </app-badge>
                                    <p class="text-sm text-gray-900 mt-1">
                                        {{ config.isGlobal ? ('COMMISSION.ALL_USERS' | translate) : (config.userFullName || config.username) }}
                                    </p>
                                    @if (!config.isGlobal) {
                                        <p class="text-xs text-gray-500">{{ config.username }}</p>
                                    }
                                </div>
                                <div class="flex gap-1">
                                    @if (!isDeletedView) {
                                    <app-button variant="ghost" size="sm" [title]="'COMMON.BUTTON.EDIT' | translate"
                                        *appHasPermission="Permission.UpdateCommissionConfigs"
                                        (click)="edit(config)">
                                        <i class="fa-solid fa-pen"></i>
                                    </app-button>
                                    <app-button variant="ghost" size="sm" [title]="'COMMON.BUTTON.DELETE' | translate"
                                        *appHasPermission="[Permission.DeleteCommissionConfig, Permission.UpdateCommissionConfigs]"
                                        (click)="remove(config)">
                                        <i class="fa-solid fa-trash"></i>
                                    </app-button>
                                    } @else {
                                    <app-button variant="ghost" size="sm" [title]="'COMMON.BUTTON.RESTORE' | translate"
                                        *appHasPermission="[Permission.ViewRestoreCommissionConfig, Permission.RestoreCommissionConfig, Permission.UpdateCommissionConfigs]"
                                        [disabled]="isRestoring" (click)="restore(config)">
                                        <i class="fa-solid fa-rotate-left"></i>
                                    </app-button>
                                    }
                                </div>
                            </div>

                            <p class="text-sm text-gray-800 mt-2">
                                {{ getCommissionTypeLabel(config.type) | translate }} ·
                                @if (config.type === tiered) {
                                    {{ config.tiers.length }} {{ 'COMMISSION.TIER_COUNT' | translate }}
                                } @else if (config.type === fixed) {
                                    <strong>{{ config.rate | appPrice }}</strong>
                                } @else {
                                    <strong>{{ config.rate }}%</strong>
                                }
                            </p>
                            @if (!config.isActive) {
                                <p class="text-xs text-red-600 mt-1">{{ 'COMMISSION.PAUSED' | translate }}</p>
                            }
                            <p class="text-xs text-gray-500 mt-1">
                                {{ 'COMMISSION.UPDATED_AT' | translate }}: {{ config.updatedAt | appDate: 'datetime' }}
                            </p>
                        </div>
                    }
                }
            </aside>
        </div>
    `
})
export class AdminCommissionConfigComponent implements OnInit {
    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;
    /** Phạm vi đang cấu hình: chung cho mọi tài khoản hay riêng cho tài khoản được chọn. */
    scope: 'global' | 'users' = 'global';

    /** Lựa chọn phạm vi áp dụng (nhãn lấy từ i18n). */
    get scopeOptions(): RadioOption[] {
        return [
            { value: 'global', label: this._appService.trans('COMMISSION.SCOPE_GLOBAL') },
            { value: 'users', label: this._appService.trans('COMMISSION.SCOPE_USERS') }
        ];
    }

    /** Bên nhận hoa hồng đang xem. */
    beneficiary = CommissionBeneficiary.Referrer;

    /** Cấu hình đang áp dụng của bên nhận đang xem. */
    configs: CommissionConfig[] = [];

    /** Tài khoản chọn được khi áp riêng. */
    candidates: UserPickerItem[] = [];

    /** Id các tài khoản được chọn để áp riêng. */
    selectedIds: string[] = [];

    /** Cấu hình đang sửa; trống là đang tạo mới. */
    editingId: string | null = null;

    type: CommissionType = CommissionType.Percentage;
    rate: number | null = 0;
    minOrderValue: number | null = null;
    maxCommission: number | null = null;
    isActive = true;
    note = '';
    tiers: CommissionTier[] = [];

    isLoading = false;
    isLoadingCandidates = false;
    isSaving = false;
    isRestoring = false;

    beneficiaryKey = 'referrer';
    beneficiaryTabs: StatusTabItem[] = [];
    typeOptions: { value: CommissionType; label: string }[] = [];

    readonly tiered = CommissionType.Tiered;
    readonly fixed = CommissionType.Fixed;
    readonly getCommissionTypeLabel = getCommissionTypeLabel;

    constructor(
        private readonly _appService: AppService,
        private readonly _commissionService: CommissionService
    ) { }

    ngOnInit(): void {
        this.beneficiaryTabs = [
            { key: 'referrer', label: this._appService.trans('COMMISSION.BENEFICIARY_REFERRER'), icon: 'fa-solid fa-user-group' },
            { key: 'partner', label: this._appService.trans('COMMISSION.BENEFICIARY_PARTNER'), icon: 'fa-solid fa-handshake' }
        ];

        // Tab "Đã xóa" hiện khi có quyền xem cấu hình đã xoá (P139), khôi phục (P140) hoặc xem danh sách (P105)
        // — đúng cặp mã [HasPermission(ViewRestoreCommissionConfig, RestoreCommissionConfig, ViewCommissionConfigs)] của API.
        if (this._appService.permissionService.has([Permission.ViewRestoreCommissionConfig, Permission.RestoreCommissionConfig, Permission.ViewCommissionConfigs])) {
            this.beneficiaryTabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED'), icon: 'fa-solid fa-trash-can' });
        }
        this.typeOptions = [CommissionType.Percentage, CommissionType.Fixed, CommissionType.Tiered]
            .map(value => ({ value, label: this._appService.trans(getCommissionTypeLabel(value)) }));
        this.loadConfigs();
    }

    /** Cách tính đang là theo hạn mức. */
    get isTiered(): boolean {
        return this.type === CommissionType.Tiered;
    }

    /** Đang xem danh sách cấu hình đã xoá mềm (tab "Đã xóa"). */
    get isDeletedView(): boolean {
        return this.beneficiaryKey === 'deleted';
    }

    /** Đơn vị của mức hoa hồng theo cách tính đang chọn. */
    get rateUnitKey(): string {
        return this.type === CommissionType.Fixed ? 'COMMISSION.RATE_FIXED' : 'COMMISSION.RATE_PERCENT';
    }

    setScope(scope: 'global' | 'users'): void {
        if (this.scope === scope) return;
        this.scope = scope;
        if (scope === 'users' && this.candidates.length === 0) this.loadCandidates('');
    }

    onBeneficiaryChange(key: string): void {
        if (key === this.beneficiaryKey) return;
        this.beneficiaryKey = key;
        this.beneficiary = key === 'partner' ? CommissionBeneficiary.Partner : CommissionBeneficiary.Referrer;
        if (key !== 'deleted') this.resetForm();
        this.loadConfigs();
    }

    loadConfigs(): void {
        this.isLoading = true;
        const request = this.isDeletedView
            ? this._commissionService.getDeletedConfigs()
            : this._commissionService.getConfigs(this.beneficiary);
        request.subscribe({
            next: response => {
                this.configs = response.data ?? [];
                this.isLoading = false;
            },
            error: () => {
                this.configs = [];
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMISSION.LOAD_FAILED'));
            }
        });
    }

    loadCandidates(search: string): void {
        this.isLoadingCandidates = true;
        this._commissionService.searchUsers(search).subscribe({
            next: response => {
                this.candidates = (response.data ?? []).map(user => ({
                    id: user.id,
                    username: user.username,
                    fullName: user.fullName
                }));
                this.isLoadingCandidates = false;
            },
            error: () => {
                this.candidates = [];
                this.isLoadingCandidates = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    addTier(): void {
        this.tiers = [...this.tiers, { fromValue: 0, toValue: null, rate: 0 }];
    }

    removeTier(index: number): void {
        this.tiers = this.tiers.filter((_, position) => position !== index);
    }

    /** Nạp một cấu hình đang có vào biểu mẫu để sửa lại. */
    edit(config: CommissionConfig): void {
        this.editingId = config.id;
        this.type = config.type;
        this.rate = config.rate;
        this.minOrderValue = config.minOrderValue ?? null;
        this.maxCommission = config.maxCommission ?? null;
        this.isActive = config.isActive;
        this.note = config.note ?? '';
        this.tiers = (config.tiers ?? []).map(tier => ({
            id: tier.id,
            fromValue: tier.fromValue,
            toValue: tier.toValue ?? null,
            rate: tier.rate
        }));

        if (config.isGlobal) {
            this.scope = 'global';
            this.selectedIds = [];
        } else {
            this.scope = 'users';
            this.selectedIds = config.userId ? [config.userId] : [];
            if (this.selectedIds.length > 0 && !this.candidates.some(user => user.id === config.userId)) {
                this.candidates = [
                    {
                        id: config.userId as string,
                        username: config.username ?? '',
                        fullName: config.userFullName ?? config.username ?? ''
                    },
                    ...this.candidates
                ];
            }
        }
    }

    resetForm(): void {
        this.editingId = null;
        this.type = CommissionType.Percentage;
        this.rate = 0;
        this.minOrderValue = null;
        this.maxCommission = null;
        this.isActive = true;
        this.note = '';
        this.tiers = [];
        this.selectedIds = [];
    }

    save(): void {
        if (this.isSaving) return;
        if (this.scope === 'users' && this.selectedIds.length === 0) {
            this._appService.showError(this._appService.trans('COMMISSION.NO_TARGET'));
            return;
        }

        this.isSaving = true;
        this._commissionService.save({
            beneficiary: this.beneficiary,
            isGlobal: this.scope === 'global',
            userIds: this.scope === 'users' ? this.selectedIds : [],
            type: this.type,
            rate: Number(this.rate) || 0,
            minOrderValue: this.minOrderValue === null ? null : Number(this.minOrderValue),
            maxCommission: this.maxCommission === null ? null : Number(this.maxCommission),
            isActive: this.isActive,
            note: this.note?.trim() ? this.note.trim() : null,
            tiers: this.isTiered
                ? this.tiers.map(tier => ({
                    fromValue: Number(tier.fromValue) || 0,
                    toValue: tier.toValue === null || tier.toValue === undefined ? null : Number(tier.toValue),
                    rate: Number(tier.rate) || 0
                }))
                : []
        }).subscribe({
            next: () => {
                this.isSaving = false;
                this._appService.showSuccess(this._appService.trans('COMMISSION.SAVE_SUCCESS'));
                this.resetForm();
                this.loadConfigs();
            },
            error: () => {
                this.isSaving = false;
                this._appService.showError(this._appService.trans('COMMISSION.SAVE_FAILED'));
            }
        });
    }

    async remove(config: CommissionConfig): Promise<void> {
        const confirmed = await this._appService.modal.confirm({
            title: this._appService.trans('COMMISSION.DELETE'),
            message: this._appService.trans('COMMISSION.DELETE_CONFIRM'),
            confirmText: this._appService.trans('COMMISSION.DELETE'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL')
        });
        if (!confirmed) return;

        this._commissionService.remove(config.id).subscribe({
            next: () => {
                this._appService.showSuccess(this._appService.trans('COMMISSION.DELETE_SUCCESS'));
                if (this.editingId === config.id) this.resetForm();
                this.loadConfigs();
            },
            error: () => this._appService.showError(this._appService.trans('COMMISSION.DELETE_FAILED'))
        });
    }

    /** Khôi phục một cấu hình hoa hồng đã xoá mềm (tab "Đã xóa"). */
    restore(config: CommissionConfig): void {
        this.isRestoring = true;
        this._commissionService.restore(config.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('COMMISSION.RESTORE_SUCCESS'));
                this.loadConfigs();
            },
            error: () => {
                this.isRestoring = false;
                this._appService.showError(this._appService.trans('COMMISSION.RESTORE_FAILED'));
            }
        });
    }

    /** Sau khi xoá vĩnh viễn: nạp lại danh sách của tab 'Đã xoá'. */
    onPurged(): void {
        this.loadConfigs();
    }
}
