import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { PayoutService } from '@core/services/payout.service';
import { BankAccount, BankAccountQuery } from '@core/models/payout.model';
import { Permission } from '@core/models/permission.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PaymentQrComponent } from '@shared/components/payment-qr/payment-qr.component';
import { buildAccountQr } from '@core/constants/bank-catalog';
import { copyToClipboard } from '@core/utils/share-link';
import { CodeListComponent } from '@shared/components/code-list/code-list.component';

/**
 * Xác thực tài khoản ngân hàng nhận giải ngân của thành viên.
 * Quản trị viên đối chiếu thông tin thành viên khai báo rồi ghi nhận đã xác minh (hoặc bỏ xác minh).
 */
@Component({
    selector: 'app-admin-bank-account-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        CodeListComponent,
        LoadingComponent,
        PaginationComponent,
        StatusTabsComponent,
        ButtonComponent,
        InputComponent,
        AppDatePipe,
        ModalComponent,
        PaymentQrComponent
    ],
    template: `
        <div class="space-y-4">
            <div>
                <h1 class="text-xl font-semibold text-gray-900">{{ 'ADMIN.BANK_ACCOUNTS.TITLE' | translate }}</h1>
                <p class="text-sm text-gray-500 mt-1">{{ 'ADMIN.BANK_ACCOUNTS.SUBTITLE' | translate }}</p>
            </div>

            <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)">
            </app-status-tabs>

            <!-- Bộ lọc -->
            <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-lg border border-gray-200" style="--control-h: 2.5rem">
                <div class="w-64">
                    <app-input [(ngModel)]="keyword" (keyup.enter)="onSearch()" [id]="'bank_keyword'"
                        [placeholder]="'ADMIN.BANK_ACCOUNTS.SEARCH_PLACEHOLDER' | translate">
                    </app-input>
                </div>

                <app-button variant="primary" [loading]="isLoading" (click)="onSearch()">
                    <i class="fa-solid fa-magnifying-glass mr-1"></i>{{ 'ADMIN.BANK_ACCOUNTS.SEARCH' | translate }}
                </app-button>
                <app-button variant="outline" (click)="onReset()">
                    <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'ADMIN.BANK_ACCOUNTS.RESET' | translate }}
                </app-button>

                <span class="ml-auto h-10 flex items-center text-sm text-gray-500">
                    {{ 'ADMIN.BANK_ACCOUNTS.TOTAL' | translate }}: <strong>{{ totalCount }}</strong>
                </span>
            </div>

            <!-- Danh sách tài khoản ngân hàng -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_MEMBER' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_BANK' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_ACCOUNT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_HOLDER' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_TRANSFER_CODE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_NOTE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_UPDATED' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.BANK_ACCOUNTS.COL_ACTIONS' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            @if (isLoading) {
                                <tr><td colspan="9" class="px-4 py-10"><app-loading [inline]="true"></app-loading></td></tr>
                            } @else if (items.length === 0) {
                                <tr><td colspan="9" class="px-4 py-10 text-center text-sm text-gray-500">{{ 'ADMIN.BANK_ACCOUNTS.EMPTY' | translate }}</td></tr>
                            } @else {
                                @for (item of items; track item.id) {
                                    <tr class="hover:bg-gray-50 align-top">
                                        <td class="px-4 py-3 text-sm">
                                            <div class="font-medium text-gray-900">{{ item.fullName || item.username || '—' }}</div>
                                            @if (item.username) {
                                                <div class="text-xs text-gray-500">{{ item.username }}</div>
                                            }
                                            <app-code-list [items]="[
                                                { label: ('COMMON.CODE.ACCOUNT' | translate), value: item.userCode }
                                            ]"></app-code-list>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-700">
                                            <div class="font-medium text-gray-800">{{ item.bankName || '—' }}</div>
                                            <div class="text-xs text-gray-500">{{ item.branch || ('ADMIN.BANK_ACCOUNTS.NO_BRANCH' | translate) }}</div>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-700 font-mono whitespace-nowrap">{{ item.accountNumber }}</td>
                                        <td class="px-4 py-3 text-sm text-gray-700">{{ item.accountHolder }}</td>
                                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                                            @if (item.isVerified) {
                                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
                                                    <i class="fa-solid fa-circle-check mr-1"></i>{{ 'ADMIN.BANK_ACCOUNTS.STATUS_VERIFIED' | translate }}
                                                </span>
                                                @if (item.verifiedAt || item.verifiedBy) {
                                                    <div class="text-xs text-gray-500 mt-1">
                                                        {{ 'ADMIN.BANK_ACCOUNTS.VERIFIED_AT' | translate }}: {{ item.verifiedAt | appDate }}
                                                    </div>
                                                    @if (item.verifiedBy) {
                                                        <div class="text-xs text-gray-500">{{ item.verifiedBy }}</div>
                                                    }
                                                }
                                            } @else {
                                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                                    <i class="fa-solid fa-clock mr-1"></i>{{ 'ADMIN.BANK_ACCOUNTS.STATUS_PENDING' | translate }}
                                                </span>
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                                            @if (item.verificationCode) {
                                                <div class="flex items-center gap-2">
                                                    <code class="px-2 py-1 rounded bg-gray-50 border border-gray-200 font-mono text-xs text-gray-800">{{ item.verificationCode }}</code>
                                                    <app-button size="sm" variant="outline" [title]="'ADMIN.BANK_ACCOUNTS.CODE_COPY' | translate" (click)="copyCode(item.verificationCode)">
                                                        <i class="fa-regular fa-copy"></i>{{ 'ADMIN.BANK_ACCOUNTS.CODE_COPY' | translate }}
                                                    </app-button>
                                                </div>
                                                @if (item.verificationCodeIssuedAt) {
                                                    <div class="text-xs text-gray-500 mt-1">{{ item.verificationCodeIssuedAt | appDate }}</div>
                                                }
                                            } @else {
                                                <span class="text-gray-400">{{ 'ADMIN.BANK_ACCOUNTS.NO_TRANSFER_CODE' | translate }}</span>
                                            }
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-600 max-w-xs">{{ item.note || '—' }}</td>
                                        <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{{ item.updatedAt | appDate:'datetime' }}</td>
                                        <td class="px-4 py-3 text-sm whitespace-nowrap">
                                            <div class="flex flex-wrap items-center gap-2">
                                                @if (qrUrlOf(item)) {
                                                    <app-button size="sm" variant="outline"
                                                        [title]="'ADMIN.BANK_ACCOUNTS.ACTION_QR' | translate"
                                                        (click)="openQr(item)">
                                                        <i class="fa-solid fa-qrcode"></i>
                                                    </app-button>
                                                }
                                            @if (canVerify) {
                                                <div class="flex flex-wrap items-center gap-2">
                                                    @if (item.isVerified) {
                                                        <app-button size="sm" variant="outline" (click)="unverify(item)">
                                                            <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'ADMIN.BANK_ACCOUNTS.ACTION_UNVERIFY' | translate }}
                                                        </app-button>
                                                    } @else {
                                                        <app-button size="sm" variant="primary" (click)="verify(item)">
                                                            <i class="fa-solid fa-circle-check mr-1"></i>{{ 'ADMIN.BANK_ACCOUNTS.ACTION_VERIFY' | translate }}
                                                        </app-button>
                                                    }
                                                </div>
                                            } @else {
                                                <span class="text-gray-400">—</span>
                                            }
                                            </div>
                                        </td>
                                    </tr>
                                }
                            }
                        </tbody>
                    </table>
                </div>

                @if (totalCount > 0) {
                    <div class="border-t border-gray-200 px-4 py-3">
                        <app-pagination [pageNumber]="pageNumber" [pageSize]="pageSize" [totalCount]="totalCount"
                            [totalPages]="totalPages" [hasPreviousPage]="hasPreviousPage" [hasNextPage]="hasNextPage"
                            (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
                        </app-pagination>
                    </div>
                }

                <!-- QR chuyển khoản: quét bằng app ngân hàng để kiểm tra tài khoản nhận tiền có tồn tại -->
                <app-modal [(visible)]="isQrVisible" [title]="'ADMIN.BANK_ACCOUNTS.QR_TITLE' | translate" size="md"
                    [showFooter]="false" (closed)="isQrVisible = false">
                    @if (qrItem) {
                        <div class="space-y-3">
                            @if (qrItem.verificationCode) {
                                <div class="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                                    <span>{{ 'ADMIN.BANK_ACCOUNTS.COL_TRANSFER_CODE' | translate }}:</span>
                                    <code class="px-2 py-1 rounded bg-gray-50 border border-gray-200 font-mono text-xs text-gray-800">{{ qrItem.verificationCode }}</code>
                                    <app-button size="sm" variant="outline" [title]="'ADMIN.BANK_ACCOUNTS.CODE_COPY' | translate"
                                        (click)="copyCode(qrItem.verificationCode)">
                                        <i class="fa-regular fa-copy"></i>
                                    </app-button>
                                </div>
                            }

                            @if (qrItemUrl) {
                                <app-payment-qr [url]="qrItemUrl" [accountHolder]="qrItem.accountHolder"
                                    [accountNumber]="qrItem.accountNumber" [bankName]="qrItem.bankName"
                                    [amount]="qrItem.verificationCode ? 1000 : null"
                                    [content]="qrItem.verificationCode">
                                </app-payment-qr>
                            }

                            <p class="text-xs text-gray-500">{{ 'ADMIN.BANK_ACCOUNTS.QR_HINT' | translate }}</p>
                        </div>
                    }
                </app-modal>
            </div>
        </div>
    `
})
export class BankAccountListComponent implements OnInit {
    items: BankAccount[] = [];
    tabs: StatusTabItem[] = [];

    activeTab = 'all';
    keyword = '';

    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;
    isLoading = false;

    constructor(
        private readonly _appService: AppService,
        private readonly _payoutService: PayoutService
    ) { }

    ngOnInit(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('ADMIN.BANK_ACCOUNTS.TAB_ALL'), icon: 'fa-solid fa-list' },
            { key: 'pending', label: this._appService.trans('ADMIN.BANK_ACCOUNTS.TAB_PENDING'), icon: 'fa-solid fa-clock' },
            { key: 'verified', label: this._appService.trans('ADMIN.BANK_ACCOUNTS.TAB_VERIFIED'), icon: 'fa-solid fa-circle-check' }
        ];
        this.loadData();
    }

    /** Có quyền xác thực tài khoản ngân hàng hay không. */
    get canVerify(): boolean {
        return this._appService.permissionService.has(Permission.VerifyBankAccounts);
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

    /** Ghi nhận đã xác thực thông tin ngân hàng của thành viên. */
    verify(item: BankAccount): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.BANK_ACCOUNTS.CONFIRM_VERIFY_TITLE'),
            message: this._appService.trans('ADMIN.BANK_ACCOUNTS.CONFIRM_VERIFY_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.BANK_ACCOUNTS.ACTION_VERIFY'),
            confirmVariant: 'primary'
        }).then(confirmed => {
            if (!confirmed) return;

            this.saveVerification(item, true, 'ADMIN.BANK_ACCOUNTS.SUCCESS_VERIFY');
        });
    }

    /** Bỏ xác thực (thành viên đổi số tài khoản hoặc thông tin không khớp). */
    unverify(item: BankAccount): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.BANK_ACCOUNTS.CONFIRM_UNVERIFY_TITLE'),
            message: this._appService.trans('ADMIN.BANK_ACCOUNTS.CONFIRM_UNVERIFY_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.BANK_ACCOUNTS.ACTION_UNVERIFY'),
            confirmVariant: 'danger'
        }).then(confirmed => {
            if (!confirmed) return;

            this.saveVerification(item, false, 'ADMIN.BANK_ACCOUNTS.SUCCESS_UNVERIFY');
        });
    }

    /** QR đang xem để đối chiếu tài khoản nhận tiền của thành viên. */
    qrItem: BankAccount | null = null;
    isQrVisible = false;

    /** Mở hộp thoại QR chuyển khoản của một tài khoản. */
    openQr(item: BankAccount): void {
        this.qrItem = item;
        this.isQrVisible = true;
    }

    /** URL ảnh QR của tài khoản đang xem (kèm số tiền và nội dung xác thực nếu có). */
    get qrItemUrl(): string | null {
        return this.qrItem ? this.qrUrlOf(this.qrItem) : null;
    }

    /** QR chuyển khoản của một tài khoản; chưa nhận ra ngân hàng thì trả về null. */
    qrUrlOf(item: BankAccount): string | null {
        return buildAccountQr(item, item.verificationCode ? 1000 : null, item.verificationCode ?? null);
    }

    /** Chép mã đối chiếu để đối chiếu với sao kê ngân hàng. */
    copyCode(code: string | null | undefined): void {
        if (!code) return;

        copyToClipboard(code).then(() => this._appService.showSuccess(this._appService.trans('ADMIN.BANK_ACCOUNTS.CODE_COPIED')));
    }

    loadData(): void {
        this.isLoading = true;

        const keyword = this.keyword.trim();
        // Chỉ gắn tham số khi thực sự có giá trị: HttpParams biến undefined/null thành chuỗi
        // "undefined"/"null" nên API báo lỗi dữ liệu không hợp lệ và danh sách luôn rỗng.
        const query: BankAccountQuery = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize
        };
        if (keyword) query.search = keyword;

        const isVerified = this.verifiedOfTab(this.activeTab);
        if (isVerified !== null) query.isVerified = isVerified;

        this._payoutService.getBankAccounts(query).subscribe({
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

    /** Gửi kết quả xác thực lên API rồi nạp lại danh sách. */
    private saveVerification(item: BankAccount, isVerified: boolean, successKey: string): void {
        if (!item.userId) {
            this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            return;
        }

        this._payoutService.verifyBankAccount(item.userId, { isVerified }).subscribe({
            next: () => {
                this._appService.showSuccess(this._appService.trans(successKey));
                this.loadData();
            },
            error: error => this._appService.showError(this._appService.extractErrorMessage(error))
        });
    }

    /** Trạng thái xác thực tương ứng với tab đang chọn; tab "Tất cả" thì không lọc. */
    private verifiedOfTab(tab: string): boolean | null {
        if (tab === 'pending') return false;
        if (tab === 'verified') return true;
        return null;
    }
}
