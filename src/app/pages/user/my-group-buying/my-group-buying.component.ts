// src/app/pages/user/my-group-buying/my-group-buying.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { requestSearchFields } from '@core/constants/search-fields';
import {
    GetPublicGroupBuyingQuery,
    GroupBuyingFeedItem,
    GroupBuyingStatus,
    GroupBuyingStatusColor,
    GroupBuyingStatusLabel
} from '@core/models/group-buying-request.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { GroupBuyingDetailModalComponent } from '@pages/social/components/group-buying-detail-modal/group-buying-detail-modal.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

@Component({
    selector: 'app-my-group-buying',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TranslateModule,
        AppDatePipe, AppPricePipe,
        BadgeComponent, ButtonComponent, InputComponent, LoadingComponent,
        PaginationComponent, StatusTabsComponent,
        SearchByComponent, NgxFilterDaterangeComponent,
        GroupBuyingDetailModalComponent
    ],
    template: `
        <div class="space-y-6">
            <!-- Tìm kiếm -->
            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 class="text-xl font-bold text-slate-800">{{ 'USER.MY_GROUP_BUYING.TITLE' | translate }}</h1>
                        <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_GROUP_BUYING.DESCRIPTION' | translate }}</p>
                    </div>
                    <app-button variant="primary" size="sm" (onClick)="onCreate()">
                        <i class="fa-solid fa-plus mr-2"></i>{{ 'USER.MY_GROUP_BUYING.CREATE_NEW' | translate }}
                    </app-button>
                </div>

                <div class="flex flex-wrap items-end gap-3" style="--control-h: 2.5rem">
                    <!-- Chọn cột tìm kiếm (bỏ trống = tất cả) — component dùng chung <app-search-by> -->
                    <app-search-by [options]="searchFieldOptions" [(value)]="searchField"></app-search-by>

                    <div class="w-full sm:flex-1 sm:min-w-0">
                        <app-input [(ngModel)]="searchText" [label]="'USER.MY_GROUP_BUYING.SEARCH_LABEL' | translate"
                            [placeholder]="'USER.MY_GROUP_BUYING.SEARCH_PLACEHOLDER' | translate"
                            (keyup.enter)="onSearch()"></app-input>
                    </div>
                    <app-button variant="primary" (onClick)="onSearch()">
                        <i class="fas fa-search mr-2"></i>{{ 'COMMON.BUTTON.SEARCH' | translate }}
                    </app-button>
                    <app-button variant="outline" (onClick)="onReset()">
                        <i class="fas fa-rotate-left mr-2"></i>{{ 'COMMON.BUTTON.RESET' | translate }}
                    </app-button>
                    <ngx-filter-daterange [from]="fromDate" [to]="toDate"
                        (rangeChange)="onRangeChange($event)"></ngx-filter-daterange>
                </div>
            </section>

            <!-- Danh sách -->
            <section class="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div class="px-6 pt-5">
                    <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)"></app-status-tabs>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-100">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_GROUP_BUYING.PRODUCT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_GROUP_BUYING.TARGET_PRICE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_GROUP_BUYING.PEOPLE' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_GROUP_BUYING.CREATED_AT' | translate }}</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'USER.MY_GROUP_BUYING.STATUS' | translate }}</th>
                                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {{ 'COMMON.BUTTON.ACTION' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 bg-white">
                            @if (isLoading) {
                            <tr>
                                <td colspan="6" class="px-4 py-10 text-center">
                                    <app-loading></app-loading>
                                </td>
                            </tr>
                            } @else if (items.length === 0) {
                            <tr>
                                <td colspan="6" class="px-4 py-10 text-center">
                                    <p class="text-sm font-medium text-slate-600">{{ 'USER.MY_GROUP_BUYING.EMPTY' | translate }}</p>
                                    <p class="mt-1 text-xs text-slate-400">{{ 'USER.MY_GROUP_BUYING.EMPTY_HINT' | translate }}</p>
                                </td>
                            </tr>
                            } @else {
                            @for (item of items; track item.id; let i = $index) {
                            <tr class="cursor-pointer transition-colors hover:bg-slate-50" (click)="openDetail(item)">
                                <td class="px-4 py-3">
                                    <div class="text-sm font-medium text-slate-800">{{ item.productName }}</div>
                                    <div class="text-xs text-slate-400">
                                        {{ item.groupBuyingRequestCode || '--' }}
                                        @if (item.businessFieldName) {
                                        <span> · {{ item.businessFieldName }}</span>
                                        }
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-700">{{ item.targetPrice | appPrice }}</td>
                                <td class="px-4 py-3 text-sm text-slate-700">
                                    <span class="font-semibold text-primary">{{ item.currentPeopleCount }}</span>
                                    / {{ item.targetPeopleCount }}
                                </td>
                                <td class="px-4 py-3 text-sm text-slate-500">{{ item.createdAt | appDate }}</td>
                                <td class="px-4 py-3">
                                    <app-badge [status]="getStatusKey(item.status)" [variant]="getStatusVariant(item.status)"
                                        [label]="getStatusKey(item.status) | translate"></app-badge>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <app-button variant="secondary" size="sm"
                                        (onClick)="$event.stopPropagation(); openDetail(item)">
                                        {{ 'COMMON.BUTTON.VIEW_DETAIL' | translate }}
                                    </app-button>
                                </td>
                            </tr>
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

        <app-group-buying-detail-modal [visible]="showDetail" [requestId]="selectedRequestId"
            (closed)="onDetailClosed()" (joined)="onDetailJoined()"></app-group-buying-detail-modal>
    `,
})
export class MyGroupBuyingPageComponent implements OnInit {
    items: GroupBuyingFeedItem[] = [];
    isLoading = true;

    searchText = '';

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: { value: string; label: string }[] = [];

    /** Khoảng ngày mở đơn (YYYY-MM-DD) */
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
    selectedRequestId: string | null = null;

    constructor(
        private readonly _appService: AppService,
        private readonly _router: Router
    ) { }

    ngOnInit(): void {
        this.buildTabs();
        this.buildSearchFieldOptions();
        this.loadData();
    }

    /** Các cột tìm kiếm dùng chung (RequestSearchField) khớp tham số searchField của API. */
    private buildSearchFieldOptions(): void {
        this.searchFieldOptions = requestSearchFields((key: string) => this._appService.trans(key));
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: String(GroupBuyingStatus.PENDING), label: this._appService.trans('GROUP_BUYING.STATUS.PENDING') },
            { key: String(GroupBuyingStatus.ACTIVE), label: this._appService.trans('GROUP_BUYING.STATUS.ACTIVE') },
            { key: String(GroupBuyingStatus.COMPLETED), label: this._appService.trans('GROUP_BUYING.STATUS.COMPLETED') },
            { key: String(GroupBuyingStatus.CANCELLED), label: this._appService.trans('GROUP_BUYING.STATUS.CANCELLED') }
        ];
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        const query: GetPublicGroupBuyingQuery = {
            page: this.pageNumber,
            pageSize: this.pageSize,
            search: this.searchText,
            // Chỉ lấy đơn do chính mình mở, mọi trạng thái (kể cả đã hoàn thành / đã hủy)
            mineOnly: true,
            status: this.activeTab === 'all' ? undefined : Number(this.activeTab) as GroupBuyingStatus,
            searchField: this.searchField ?? undefined,
            fromDate: this.fromDate ?? undefined,
            toDate: this.toDate ?? undefined
        };

        this._appService.groupBuyingRequest.getPublic(query).subscribe({
            next: (response: PagedResponse<GroupBuyingFeedItem>) => {
                this.items = response?.data ?? [];
                this.pageNumber = response?.pageNumber ?? this.pageNumber;
                this.pageSize = response?.pageSize ?? this.pageSize;
                this.totalCount = response?.totalCount ?? 0;
                this.totalPages = response?.totalPages ?? 0;
                this.hasPreviousPage = response?.hasPreviousPage ?? false;
                this.hasNextPage = response?.hasNextPage ?? false;
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this.items = [];
                this._appService.showError(error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
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

    onCreate(): void {
        this._router.navigate(['/group-buying']);
    }

    openDetail(item: GroupBuyingFeedItem): void {
        this.selectedRequestId = item.id;
        this.showDetail = true;
    }

    onDetailClosed(): void {
        this.showDetail = false;
        this.selectedRequestId = null;
    }

    onDetailJoined(): void {
        this.loadData();
    }

    getStatusKey(status: GroupBuyingStatus): string {
        return GroupBuyingStatusLabel[status] || 'GROUP_BUYING.STATUS.PENDING';
    }

    getStatusVariant(status: GroupBuyingStatus): BadgeVariant {
        return (GroupBuyingStatusColor[status] as BadgeVariant) || 'secondary';
    }
}
