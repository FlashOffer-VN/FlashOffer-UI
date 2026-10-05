// src/app/pages/user/my-requests/my-requests.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { requestSearchFields, SearchFieldOption } from '@core/constants/search-fields';
import { PagedResponse } from '@core/models/paged-response.model';
import { PurchaseRequest, PurchaseRequestStatus } from '@core/models/purchase-request.model';
import { OfferRequest, OfferStatus } from '@core/models/offer-request.model';

import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { ShortIdPipe } from '@shared/pipes/short-id.pipe';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

/** Loại yêu cầu xem trong khu vực thành viên */
type MyRequestType = 'purchase' | 'offer';

/** Trạng thái hiển thị trên bảng: từ khoá cho app-badge + key dịch dùng chung */
interface MyRequestStatusView {
    key: string;
    label: string;
    variant: BadgeVariant;
}

/** Yêu cầu của tôi: yêu cầu tìm nhà cung cấp và yêu cầu nhận offer do chính mình gửi */
@Component({
    selector: 'app-my-requests',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TranslateModule,
        AppDatePipe, AppPricePipe, ShortIdPipe,
        BadgeComponent, ButtonComponent, InputComponent, LoadingComponent,
        ModalComponent, PaginationComponent, StatusTabsComponent, SearchByComponent, NgxFilterDaterangeComponent
    ],
    template: `
        <div class="space-y-6">
            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div class="mb-5">
                    <h1 class="text-xl font-bold text-slate-800">{{ 'USER.MY_REQUESTS.TITLE' | translate }}</h1>
                    <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_REQUESTS.DESCRIPTION' | translate }}</p>
                </div>

                <!-- Loại yêu cầu -->
                <div class="mb-5 flex flex-wrap gap-2">
                    <button type="button" (click)="setType('purchase')"
                        class="rounded-full px-4 py-2 text-sm font-semibold transition"
                        [class]="type === 'purchase' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                        {{ 'USER.MY_REQUESTS.TYPE_PURCHASE' | translate }}
                    </button>
                    <button type="button" (click)="setType('offer')"
                        class="rounded-full px-4 py-2 text-sm font-semibold transition"
                        [class]="type === 'offer' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                        {{ 'USER.MY_REQUESTS.TYPE_OFFER' | translate }}
                    </button>
                </div>

                <div class="flex flex-wrap items-end gap-x-4 gap-y-4" style="--control-h: 2.5rem">
                    <!-- Nhóm tìm kiếm: chọn cột + từ khoá + nút -->
                    <div class="flex w-full flex-wrap items-end gap-3 lg:flex-1 lg:min-w-0">
                        <app-search-by [options]="searchFieldOptions" [(value)]="searchField"></app-search-by>
                        <div class="w-full lg:flex-1 lg:min-w-0">
                            <app-input [(ngModel)]="searchText" [label]="'USER.MY_REQUESTS.SEARCH_LABEL' | translate"
                                [placeholder]="'USER.MY_REQUESTS.SEARCH_PLACEHOLDER' | translate"
                                (keyup.enter)="onSearch()"></app-input>
                        </div>
                        <app-button variant="primary" (onClick)="onSearch()">
                            <i class="fas fa-search mr-2"></i>{{ 'COMMON.BUTTON.SEARCH' | translate }}
                        </app-button>
                        <app-button variant="outline" (onClick)="onReset()">
                            <i class="fas fa-rotate-left mr-2"></i>{{ 'COMMON.BUTTON.RESET' | translate }}
                        </app-button>
                    </div>

                    <!-- Nhóm lọc: khoảng ngày -->
                    <div
                        class="flex w-full flex-wrap items-end gap-3 border-t border-gray-200 pt-3 lg:w-auto lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                        <ngx-filter-daterange [from]="fromDate" [to]="toDate"
                            (rangeChange)="onRangeChange($event)"></ngx-filter-daterange>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div class="px-6 pt-5">
                    <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)"></app-status-tabs>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead class="bg-slate-50">
                            @if (type === 'purchase') {
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.PRODUCT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.QUANTITY' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.EXPECTED_PRICE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.CREATED_AT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'COMMON.BUTTON.ACTION' | translate }}</th>
                            </tr>
                            } @else {
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.PRODUCT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.QUANTITY' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.CURRENT_PRICE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.EXPECTED_PRICE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.CREATED_AT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_REQUESTS.STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'COMMON.BUTTON.ACTION' | translate }}</th>
                            </tr>
                            }
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @if (isLoading) {
                            <tr>
                                <td [attr.colspan]="type === 'purchase' ? 6 : 7" class="px-4 py-10 text-center">
                                    <app-loading></app-loading>
                                </td>
                            </tr>
                            } @else if (type === 'purchase') {
                            @if (purchaseItems.length === 0) {
                            <tr>
                                <td colspan="6" class="px-4 py-10 text-center">
                                    <p class="text-sm font-medium text-slate-600">{{ 'USER.MY_REQUESTS.EMPTY' | translate }}</p>
                                    <p class="mt-1 text-xs text-slate-400">{{ 'USER.MY_REQUESTS.EMPTY_HINT' | translate }}</p>
                                </td>
                            </tr>
                            } @else {
                            @for (item of purchaseItems; track item.id) {
                            <tr class="cursor-pointer transition-colors hover:bg-slate-50" (click)="openPurchase(item)">
                                <td class="px-4 py-3">
                                    <div class="text-sm font-medium text-slate-800">{{ item.productName }}</div>
                                    <div class="text-xs text-slate-400">
                                        {{ item.purchaseRequestCode || (item.id | shortId) }}
                                        @if (item.productCategory) {
                                        <span> · {{ item.productCategory }}</span>
                                        }
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-700">{{ item.quantity }} {{ item.unit }}</td>
                                <td class="px-4 py-3 text-sm text-slate-700">{{ item.expectedPrice | appPrice }}</td>
                                <td class="px-4 py-3 text-sm text-slate-500">{{ item.createdAt | appDate }}</td>
                                <td class="px-4 py-3">
                                    <app-badge [status]="purchaseStatus(item.status).key"
                                        [variant]="purchaseStatus(item.status).variant"
                                        [label]="purchaseStatus(item.status).label | translate"></app-badge>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <app-button variant="secondary" size="sm"
                                        (onClick)="$event.stopPropagation(); openPurchase(item)">
                                        {{ 'COMMON.BUTTON.VIEW_DETAIL' | translate }}
                                    </app-button>
                                </td>
                            </tr>
                            }
                            }
                            } @else {
                            @if (offerItems.length === 0) {
                            <tr>
                                <td colspan="7" class="px-4 py-10 text-center">
                                    <p class="text-sm font-medium text-slate-600">{{ 'USER.MY_REQUESTS.EMPTY' | translate }}</p>
                                    <p class="mt-1 text-xs text-slate-400">{{ 'USER.MY_REQUESTS.EMPTY_HINT' | translate }}</p>
                                </td>
                            </tr>
                            } @else {
                            @for (item of offerItems; track item.id) {
                            <tr class="cursor-pointer transition-colors hover:bg-slate-50" (click)="openOffer(item)">
                                <td class="px-4 py-3">
                                    <div class="text-sm font-medium text-slate-800">{{ item.productName }}</div>
                                    <div class="text-xs text-slate-400">{{ item.offerRequestCode || (item.id | shortId) }}</div>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-700">{{ item.quantity }} {{ item.unit }}</td>
                                <td class="px-4 py-3 text-sm text-slate-700">{{ item.currentPrice | appPrice }}</td>
                                <td class="px-4 py-3 text-sm text-slate-700">{{ item.expectedPrice | appPrice }}</td>
                                <td class="px-4 py-3 text-sm text-slate-500">{{ item.createdAt | appDate }}</td>
                                <td class="px-4 py-3">
                                    <app-badge [status]="offerStatus(item.status).key"
                                        [variant]="offerStatus(item.status).variant"
                                        [label]="offerStatus(item.status).label | translate"></app-badge>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <app-button variant="secondary" size="sm"
                                        (onClick)="$event.stopPropagation(); openOffer(item)">
                                        {{ 'COMMON.BUTTON.VIEW_DETAIL' | translate }}
                                    </app-button>
                                </td>
                            </tr>
                            }
                            }
                            }
                        </tbody>
                    </table>
                </div>

                <div class="border-t border-slate-100 px-4 py-3">
                    <app-pagination [pageNumber]="pageNumber" [pageSize]="pageSize" [totalCount]="totalCount"
                        [totalPages]="totalPages" [hasPreviousPage]="hasPreviousPage" [hasNextPage]="hasNextPage"
                        (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)"></app-pagination>
                </div>
            </section>
        </div>

        <!-- Chi tiết yêu cầu tìm nhà cung cấp -->
        <app-modal [(visible)]="showDetail" [title]="'USER.MY_REQUESTS.DETAIL_TITLE' | translate" size="lg"
            [showFooter]="false">
            @if (selectedPurchase) {
            <div class="space-y-4">
                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CODE' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">
                            {{ selectedPurchase.purchaseRequestCode || (selectedPurchase.id | shortId) }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.STATUS' | translate }}</p>
                        <div class="mt-1">
                            <app-badge [status]="purchaseStatus(selectedPurchase.status).key"
                                [variant]="purchaseStatus(selectedPurchase.status).variant"
                                [label]="purchaseStatus(selectedPurchase.status).label | translate"></app-badge>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.PRODUCT' | translate }}</p>
                        <p class="mt-1 break-words font-semibold text-slate-800">{{ selectedPurchase.productName }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CATEGORY' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedPurchase.productCategory || '--' }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.QUANTITY' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedPurchase.quantity }} {{ selectedPurchase.unit }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.EXPECTED_PRICE' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedPurchase.expectedPrice | appPrice }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CREATED_AT' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedPurchase.createdAt | appDate }}</p>
                    </div>
                </div>

                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.NOTE' | translate }}</p>
                    <p class="mt-1 whitespace-pre-line break-words text-sm text-slate-700">{{ selectedPurchase.note || '--' }}</p>
                </div>

                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CONTACT' | translate }}</p>
                    <p class="mt-1 text-sm text-slate-700">{{ selectedPurchase.fullName || '--' }}</p>
                    <p class="text-sm text-slate-700">{{ selectedPurchase.phone || '--' }}</p>
                    <p class="break-words text-sm text-slate-700">{{ selectedPurchase.email || '--' }}</p>
                    @if (selectedPurchase.zalo) {
                    <p class="text-sm text-slate-700">Zalo: {{ selectedPurchase.zalo }}</p>
                    }
                </div>
            </div>
            }
        </app-modal>

        <!-- Chi tiết yêu cầu nhận offer -->
        <app-modal [(visible)]="showDetail" [title]="'USER.MY_REQUESTS.DETAIL_TITLE' | translate" size="lg"
            [showFooter]="false">
            @if (selectedOffer) {
            <div class="space-y-4">
                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CODE' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedOffer.offerRequestCode || (selectedOffer.id | shortId) }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.STATUS' | translate }}</p>
                        <div class="mt-1">
                            <app-badge [status]="offerStatus(selectedOffer.status).key"
                                [variant]="offerStatus(selectedOffer.status).variant"
                                [label]="offerStatus(selectedOffer.status).label | translate"></app-badge>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.PRODUCT' | translate }}</p>
                        <p class="mt-1 break-words font-semibold text-slate-800">{{ selectedOffer.productName }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.PRODUCT_LINK' | translate }}</p>
                        @if (selectedOffer.productLink) {
                        <a class="mt-1 block break-all text-sm font-semibold text-primary underline"
                            [href]="selectedOffer.productLink" target="_blank" rel="noopener">{{ selectedOffer.productLink }}</a>
                        } @else {
                        <p class="mt-1 font-semibold text-slate-800">--</p>
                        }
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.QUANTITY' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedOffer.quantity }} {{ selectedOffer.unit }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CURRENT_PRICE' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedOffer.currentPrice | appPrice }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.EXPECTED_PRICE' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedOffer.expectedPrice | appPrice }}</p>
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CREATED_AT' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ selectedOffer.createdAt | appDate }}</p>
                    </div>
                </div>

                <div>
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.NOTE' | translate }}</p>
                    <p class="mt-1 whitespace-pre-line break-words text-sm text-slate-700">{{ selectedOffer.note || '--' }}</p>
                </div>

                <div class="rounded-xl bg-slate-50 p-4">
                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.MY_REQUESTS.CONTACT' | translate }}</p>
                    <p class="mt-1 text-sm text-slate-700">{{ selectedOffer.fullName || '--' }}</p>
                    <p class="text-sm text-slate-700">{{ selectedOffer.phone || '--' }}</p>
                    <p class="break-words text-sm text-slate-700">{{ selectedOffer.email || '--' }}</p>
                    @if (selectedOffer.zalo) {
                    <p class="text-sm text-slate-700">Zalo: {{ selectedOffer.zalo }}</p>
                    }
                </div>
            </div>
            }
        </app-modal>
    `,
})
export class MyRequestsPageComponent implements OnInit {
    type: MyRequestType = 'purchase';

    purchaseItems: PurchaseRequest[] = [];
    offerItems: OfferRequest[] = [];

    /** Nhãn trạng thái dùng chung key COMMON.STATUS.* (khớp màn quản trị) */
    private readonly purchaseStatusViews: Record<PurchaseRequestStatus, MyRequestStatusView> = {
        [PurchaseRequestStatus.PENDING]: { key: 'pending', label: 'COMMON.STATUS.PENDING', variant: 'warning' },
        [PurchaseRequestStatus.CONTACTED]: { key: 'contacted', label: 'COMMON.STATUS.CONTACTED', variant: 'info' },
        [PurchaseRequestStatus.COMPLETED]: { key: 'completed', label: 'COMMON.STATUS.COMPLETED', variant: 'success' }
    };

    private readonly offerStatusViews: Record<OfferStatus, MyRequestStatusView> = {
        [OfferStatus.PENDING]: { key: 'pending', label: 'COMMON.STATUS.PENDING', variant: 'warning' },
        [OfferStatus.APPROVED]: { key: 'approved', label: 'COMMON.STATUS.APPROVED', variant: 'success' },
        [OfferStatus.REJECTED]: { key: 'rejected', label: 'COMMON.STATUS.REJECTED', variant: 'danger' },
        [OfferStatus.EXPIRED]: { key: 'expired', label: 'COMMON.STATUS.EXPIRED', variant: 'secondary' }
    };

    isLoading = true;
    searchText = '';

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: SearchFieldOption[] = [];

    /** Khoảng ngày gửi yêu cầu (YYYY-MM-DD) */
    fromDate: string | null = null;
    toDate: string | null = null;

    activeTab = 'all';
    tabs: { key: string; label: string }[] = [];

    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    showDetail = false;
    selectedPurchase: PurchaseRequest | null = null;
    selectedOffer: OfferRequest | null = null;

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this.buildTabs();
        this.buildSearchFieldOptions();
        this.loadData();
    }

    /** Các cột tìm kiếm dùng chung (RequestSearchField), áp cho cả yêu cầu mua hàng và offer. */
    private buildSearchFieldOptions(): void {
        const t = (key: string) => this._appService.trans(key);
        this.searchFieldOptions = requestSearchFields(t);
    }

    setType(type: MyRequestType): void {
        if (this.type === type) return;

        this.type = type;
        this.activeTab = 'all';
        this.pageNumber = 1;
        this.buildTabs();
        this.loadData();
    }

    purchaseStatus(status: PurchaseRequestStatus): MyRequestStatusView {
        return this.purchaseStatusViews[status] || this.purchaseStatusViews[PurchaseRequestStatus.PENDING];
    }

    offerStatus(status: OfferStatus): MyRequestStatusView {
        return this.offerStatusViews[status] || this.offerStatusViews[OfferStatus.PENDING];
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        if (this.type === 'purchase') {
            this.loadPurchaseRequests();
            return;
        }

        this.loadOfferRequests();
    }

    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    /** Đổi khoảng ngày thì tải lại (bỏ trống = không lọc ngày). */
    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
        this.pageNumber = 1;
        this.loadData();
    }

    /** Đặt lại toàn bộ bộ lọc: từ khoá, cột tìm kiếm và khoảng ngày. */
    onReset(): void {
        this.searchText = '';
        this.searchField = null;
        this.fromDate = null;
        this.toDate = null;
        this.pageNumber = 1;
        this.loadData();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadData();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.pageNumber = 1;
        this.loadData();
    }

    openPurchase(item: PurchaseRequest): void {
        this.selectedPurchase = item;
        this.selectedOffer = null;
        this.showDetail = true;
    }

    openOffer(item: OfferRequest): void {
        this.selectedOffer = item;
        this.selectedPurchase = null;
        this.showDetail = true;
    }

    private buildTabs(): void {
        this.tabs = this.type === 'purchase'
            ? [
                { key: 'all', label: this._appService.trans('COMMON.ALL') },
                { key: String(PurchaseRequestStatus.PENDING), label: this._appService.trans('COMMON.STATUS.PENDING') },
                { key: String(PurchaseRequestStatus.CONTACTED), label: this._appService.trans('COMMON.STATUS.CONTACTED') },
                { key: String(PurchaseRequestStatus.COMPLETED), label: this._appService.trans('COMMON.STATUS.COMPLETED') }
            ]
            : [
                { key: 'all', label: this._appService.trans('COMMON.ALL') },
                { key: String(OfferStatus.PENDING), label: this._appService.trans('COMMON.STATUS.PENDING') },
                { key: String(OfferStatus.APPROVED), label: this._appService.trans('COMMON.STATUS.APPROVED') },
                { key: String(OfferStatus.REJECTED), label: this._appService.trans('COMMON.STATUS.REJECTED') },
                { key: String(OfferStatus.EXPIRED), label: this._appService.trans('COMMON.STATUS.EXPIRED') }
            ];
    }

    /** Chỉ lấy yêu cầu của chính mình (API cũng giới hạn như vậy với người dùng không phải admin) */
    private loadPurchaseRequests(): void {
        this._appService.purchaseRequest
            .getData(this.pageNumber, this.pageSize, this.searchText, this.currentStatus<PurchaseRequestStatus>(), this.fromDate ?? undefined, this.toDate ?? undefined, true, this.searchField ?? undefined)
            .subscribe({
                next: (response: PagedResponse<PurchaseRequest>) => {
                    this.purchaseItems = response?.data ?? [];
                    this.applyPaging(response);
                },
                error: (error: { message?: string }) => {
                    this.purchaseItems = [];
                    this.applyPaging(null);
                    this._appService.showError(error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                }
            });
    }

    private loadOfferRequests(): void {
        this._appService.offerRequest
            .getData(this.pageNumber, this.pageSize, this.searchText, this.currentStatus<OfferStatus>(), undefined, undefined, this.fromDate ?? undefined, this.toDate ?? undefined, true, this.searchField ?? undefined)
            .subscribe({
                next: (response: PagedResponse<OfferRequest>) => {
                    this.offerItems = response?.data ?? [];
                    this.applyPaging(response);
                },
                error: (error: { message?: string }) => {
                    this.offerItems = [];
                    this.applyPaging(null);
                    this._appService.showError(error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                }
            });
    }

    /** Trạng thái của tab đang chọn (tab "Tất cả" thì không gửi trạng thái) */
    private currentStatus<T>(): T | undefined {
        return this.activeTab === 'all' ? undefined : (Number(this.activeTab) as T);
    }

    private applyPaging(response: PagedResponse<unknown> | null): void {
        this.pageNumber = response?.pageNumber ?? this.pageNumber;
        this.pageSize = response?.pageSize ?? this.pageSize;
        this.totalCount = response?.totalCount ?? 0;
        this.totalPages = response?.totalPages ?? 0;
        this.hasPreviousPage = response?.hasPreviousPage ?? false;
        this.hasNextPage = response?.hasNextPage ?? false;
        this.isLoading = false;
    }
}
