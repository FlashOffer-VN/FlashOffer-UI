import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { PayoutService } from '@core/services/payout.service';
import {
    PayoutQuery,
    PayoutStatement,
    PayoutStatus,
    PayoutType,
    getPayoutStatusLabel,
    getPayoutTypeLabel
} from '@core/models/payout.model';
import { Permission } from '@core/models/permission.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';

/**
 * Duyệt chi trả hoa hồng: yêu cầu rút sớm của thành viên và các kỳ chi trả theo tháng.
 * Mỗi dòng cho duyệt, từ chối hoặc xác nhận đã chuyển khoản tuỳ theo trạng thái.
 */
@Component({
    selector: 'app-admin-payout-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        LoadingComponent,
        PaginationComponent,
        StatusTabsComponent,
        ButtonComponent,
        InputComponent,
        AppPricePipe,
        AppDatePipe
    ],
    template: `
        <div class="space-y-4">
            <div>
                <h1 class="text-xl font-semibold text-gray-900">{{ 'ADMIN.PAYOUTS.TITLE' | translate }}</h1>
                <p class="text-sm text-gray-500 mt-1">{{ 'ADMIN.PAYOUTS.SUBTITLE' | translate }}</p>
            </div>

            <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)">
            </app-status-tabs>

            <!-- Bộ lọc -->
            <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-lg border border-gray-200" style="--control-h: 2.5rem">
                <div class="w-64">
                    <app-input [(ngModel)]="keyword" (keyup.enter)="onSearch()" [id]="'payout_keyword'"
                        [placeholder]="'ADMIN.PAYOUTS.SEARCH_PLACEHOLDER' | translate">
                    </app-input>
                </div>

                <app-button variant="primary" [loading]="isLoading" (click)="onSearch()">
                    <i class="fa-solid fa-magnifying-glass mr-1"></i>{{ 'ADMIN.PAYOUTS.SEARCH' | translate }}
                </app-button>
                <app-button variant="outline" (click)="onReset()">
                    <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'ADMIN.PAYOUTS.RESET' | translate }}
                </app-button>

                <span class="ml-auto h-10 flex items-center text-sm text-gray-500">
                    {{ 'ADMIN.PAYOUTS.TOTAL' | translate }}: <strong>{{ totalCount }}</strong>
                </span>
            </div>

            <!-- Danh sách chi trả -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_REQUESTED' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_MEMBER' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_TYPE' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_AMOUNT' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_FEE' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_NET' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_BANK' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.PAYOUTS.COL_ACTIONS' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @if (isLoading) {
                                <tr><td colspan="9" class="px-4 py-10"><app-loading></app-loading></td></tr>
                            } @else if (items.length === 0) {
                                <tr><td colspan="9" class="px-4 py-10 text-center text-sm text-gray-500">{{ 'ADMIN.PAYOUTS.EMPTY' | translate }}</td></tr>
                            } @else {
                                @for (item of items; track item.id) {
                                    <tr class="hover:bg-gray-50 align-top">
                                        <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                            {{ (item.requestedAt || item.createdAt) | appDate:'datetime' }}
                                        </td>
                                        <td class="px-4 py-3 text-sm">
                                            <div class="font-medium text-gray-900">{{ item.fullName || item.username || '—' }}</div>
                                            @if (item.username) {
                                                <div class="text-xs text-gray-500">{{ item.username }}</div>
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                                            {{ getPayoutTypeLabel(item.type) | translate }}
                                        </td>
                                        <td class="px-4 py-3 text-sm text-right text-gray-800">{{ item.accruedAmount | appPrice }}</td>
                                        <td class="px-4 py-3 text-sm text-right text-gray-600">
                                            @if (item.feeAmount > 0) {
                                                {{ item.feeAmount | appPrice }}
                                                <div class="text-xs text-gray-400">{{ item.feeRate }}%</div>
                                            } @else {
                                                {{ 'ADMIN.PAYOUTS.NO_FEE' | translate }}
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-sm text-right font-semibold text-gray-900">{{ item.netAmount | appPrice }}</td>
                                        <td class="px-4 py-3 text-sm text-gray-700">
                                            @if (item.bankName || item.bankAccountNumber) {
                                                <div class="font-medium text-gray-800">{{ item.bankName || '—' }}</div>
                                                <div class="text-xs text-gray-500">{{ item.bankAccountNumber || '' }}</div>
                                                @if (item.bankAccountHolder) {
                                                    <div class="text-xs text-gray-500">{{ item.bankAccountHolder }}</div>
                                                }
                                            } @else {
                                                —
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                                            <span class="px-2 py-1 rounded-full text-xs font-medium" [class]="statusClass(item.status)">
                                                {{ getPayoutStatusLabel(item.status) | translate }}
                                            </span>
                                            @if (item.periodLabel) {
                                                <div class="text-xs text-gray-500 mt-1">{{ item.periodLabel }}</div>
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                                            @if (canProcess && isPending(item)) {
                                                <app-button size="sm" variant="primary" (click)="approve(item)">
                                                    <i class="fa-solid fa-check mr-1"></i>{{ 'ADMIN.PAYOUTS.ACTION_APPROVE' | translate }}
                                                </app-button>
                                                <app-button size="sm" variant="danger" (click)="reject(item)">
                                                    <i class="fa-solid fa-xmark mr-1"></i>{{ 'ADMIN.PAYOUTS.ACTION_REJECT' | translate }}
                                                </app-button>
                                            } @else if (canProcess && isApproved(item)) {
                                                <app-button size="sm" variant="success" (click)="markPaid(item)">
                                                    <i class="fa-solid fa-money-bill-transfer mr-1"></i>{{ 'ADMIN.PAYOUTS.ACTION_PAID' | translate }}
                                                </app-button>
                                                <app-button size="sm" variant="danger" (click)="reject(item)">
                                                    <i class="fa-solid fa-xmark mr-1"></i>{{ 'ADMIN.PAYOUTS.ACTION_REJECT' | translate }}
                                                </app-button>
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

                <div class="border-t border-gray-200 px-4 py-3">
                    <app-pagination [pageNumber]="pageNumber" [pageSize]="pageSize" [totalCount]="totalCount"
                        [totalPages]="totalPages" [hasPreviousPage]="hasPreviousPage" [hasNextPage]="hasNextPage"
                        (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
                    </app-pagination>
                </div>
            </div>
        </div>
    `
})
export class AdminPayoutListComponent implements OnInit {
    tabs: StatusTabItem[] = [];
    activeTab = 'all';

    items: PayoutStatement[] = [];
    keyword = '';
    isLoading = false;

    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    constructor(
        private readonly _appService: AppService,
        private readonly _payoutService: PayoutService
    ) { }

    ngOnInit(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('ADMIN.PAYOUTS.TAB_ALL'), icon: 'fa-solid fa-list' },
            { key: 'pending', label: this._appService.trans('ADMIN.PAYOUTS.TAB_PENDING'), icon: 'fa-solid fa-hourglass-half' },
            { key: 'approved', label: this._appService.trans('ADMIN.PAYOUTS.TAB_APPROVED'), icon: 'fa-solid fa-thumbs-up' },
            { key: 'paid', label: this._appService.trans('ADMIN.PAYOUTS.TAB_PAID'), icon: 'fa-solid fa-money-bill-transfer' },
            { key: 'rejected', label: this._appService.trans('ADMIN.PAYOUTS.TAB_REJECTED'), icon: 'fa-solid fa-ban' },
            { key: 'cancelled', label: this._appService.trans('ADMIN.PAYOUTS.TAB_CANCELLED'), icon: 'fa-solid fa-rotate-left' }
        ];
        this.loadData();
    }

    /** Có quyền xử lý chi trả (duyệt / từ chối / xác nhận chuyển khoản) hay không. */
    get canProcess(): boolean {
        return this._appService.permissionService.has(Permission.ProcessPayouts);
    }

    isPending(item: PayoutStatement): boolean {
        return item.status === PayoutStatus.Pending;
    }

    isApproved(item: PayoutStatement): boolean {
        return item.status === PayoutStatus.Approved;
    }

    onTabChange(key: string): void {
        if (key === this.activeTab) return;
        this.activeTab = key;
        this.pageNumber = 1;
        this.loadData();
    }

    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onReset(): void {
        this.keyword = '';
        this.pageNumber = 1;
        this.loadData();
    }

    onPageChange(pageNumber: number): void {
        this.pageNumber = pageNumber;
        this.loadData();
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize = pageSize;
        this.pageNumber = 1;
        this.loadData();
    }

    /** Duyệt lần chi trả đang chờ. */
    approve(item: PayoutStatement): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.PAYOUTS.CONFIRM_APPROVE_TITLE'),
            message: this._appService.trans('ADMIN.PAYOUTS.CONFIRM_APPROVE_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.PAYOUTS.ACTION_APPROVE'),
            confirmVariant: 'primary'
        }).then(confirmed => {
            if (!confirmed) return;

            this._payoutService.approvePayout(item.id).subscribe({
                next: () => {
                    this._appService.showSuccess(this._appService.trans('ADMIN.PAYOUTS.SUCCESS_APPROVE'));
                    this.loadData();
                },
                error: error => this._appService.showError(this._appService.extractErrorMessage(error))
            });
        });
    }

    /** Từ chối lần chi trả; số tiền trở lại phần hoa hồng khả dụng của thành viên. */
    reject(item: PayoutStatement): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.PAYOUTS.CONFIRM_REJECT_TITLE'),
            message: this._appService.trans('ADMIN.PAYOUTS.CONFIRM_REJECT_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.PAYOUTS.ACTION_REJECT'),
            confirmVariant: 'danger'
        }).then(confirmed => {
            if (!confirmed) return;

            this._payoutService.rejectPayout(item.id).subscribe({
                next: () => {
                    this._appService.showSuccess(this._appService.trans('ADMIN.PAYOUTS.SUCCESS_REJECT'));
                    this.loadData();
                },
                error: error => this._appService.showError(this._appService.extractErrorMessage(error))
            });
        });
    }

    /** Xác nhận đã chuyển khoản cho thành viên. */
    markPaid(item: PayoutStatement): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.PAYOUTS.CONFIRM_PAID_TITLE'),
            message: this._appService.trans('ADMIN.PAYOUTS.CONFIRM_PAID_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.PAYOUTS.ACTION_PAID'),
            confirmVariant: 'success'
        }).then(confirmed => {
            if (!confirmed) return;

            this._payoutService.markPayoutPaid(item.id).subscribe({
                next: () => {
                    this._appService.showSuccess(this._appService.trans('ADMIN.PAYOUTS.SUCCESS_PAID'));
                    this.loadData();
                },
                error: error => this._appService.showError(this._appService.extractErrorMessage(error))
            });
        });
    }

    /** Lớp hiển thị cho huy hiệu trạng thái chi trả. */
    statusClass(status: PayoutStatus): string {
        const classes: Record<PayoutStatus, string> = {
            [PayoutStatus.Pending]: 'bg-amber-50 text-amber-700',
            [PayoutStatus.Approved]: 'bg-blue-50 text-blue-700',
            [PayoutStatus.Rejected]: 'bg-red-50 text-red-700',
            [PayoutStatus.Paid]: 'bg-teal-50 text-teal-700',
            [PayoutStatus.Cancelled]: 'bg-gray-100 text-gray-600'
        };
        return classes[status] ?? 'bg-gray-100 text-gray-600';
    }

    /** Nhãn trạng thái và loại chi trả (khoá i18n). */
    getPayoutStatusLabel = getPayoutStatusLabel;
    getPayoutTypeLabel = getPayoutTypeLabel;

    loadData(): void {
        this.isLoading = true;

        const keyword = this.keyword.trim();
        // Chỉ gắn tham số khi thực sự có giá trị: HttpParams biến undefined/null thành chuỗi
        // "undefined"/"null" nên API báo lỗi dữ liệu không hợp lệ và danh sách luôn rỗng.
        const query: PayoutQuery = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        };
        if (keyword) query.search = keyword;

        const status = this.statusOfTab(this.activeTab);
        if (status !== null) query.status = status;

        this._payoutService.getPaged(query).subscribe({
            next: response => {
                this.items = response.data ?? [];
                this.pageNumber = response.pageNumber ?? this.pageNumber;
                this.pageSize = response.pageSize ?? this.pageSize;
                this.totalCount = response.totalCount ?? 0;
                this.totalPages = response.totalPages ?? 0;
                this.hasPreviousPage = response.hasPreviousPage ?? false;
                this.hasNextPage = response.hasNextPage ?? false;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.items = [];
                this.totalCount = 0;
                this.totalPages = 0;
                this.hasPreviousPage = false;
                this.hasNextPage = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Trạng thái tương ứng với tab đang chọn; tab "Tất cả" thì không lọc theo trạng thái. */
    private statusOfTab(tab: string): PayoutStatus | null {
        const map: Record<string, PayoutStatus> = {
            pending: PayoutStatus.Pending,
            approved: PayoutStatus.Approved,
            paid: PayoutStatus.Paid,
            rejected: PayoutStatus.Rejected,
            cancelled: PayoutStatus.Cancelled
        };
        return map[tab] ?? null;
    }
}
