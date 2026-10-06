// src/app/pages/user/my-referral/my-referral.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { ApexOptions } from 'apexcharts';
import { ChartComponent } from 'ng-apexcharts';

import { AppService } from '@core/services/app.service';
import { buildReferralShareUrl, copyToClipboard } from '@core/utils/share-link';
import { isBrowser } from '@core/utils/platform';
import { PagedResponse } from '@core/models/paged-response.model';
import { referralEventSearchFields, SearchFieldOption } from '@core/constants/search-fields';
import {
    ReferralEventItem,
    ReferralEventStatus,
    ReferralEventType,
    ReferralStatsOverview
} from '@core/models/referral-stats.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { InputComponent } from '@shared/components/input/input.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

const CHART_PALETTE = ['var(--primary)', 'var(--chart-violet)', 'var(--orange-dark)', 'var(--success-mid)', 'var(--pink-dark)', 'var(--blue)'];

interface MyReferralCard {
    key: string;
    label: string;
    icon: string;
    total: number;
    note: string | null;
}

/** Mã chia sẻ của tài khoản đang đăng nhập (khu vực thành viên) */
@Component({
    selector: 'app-my-referral',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        ChartComponent,
        ButtonComponent,
        LoadingComponent,
        PaginationComponent,
        BadgeComponent,
        AppDatePipe,
        InputComponent,
        SearchByComponent,
        NgxFilterDaterangeComponent
    ],
    template: `
        <div class="space-y-6">
            <section class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div class="bg-gradient-to-r from-secondary to-primary px-6 py-8 text-white sm:px-10">
                    <h1 class="text-2xl font-bold">{{ 'USER.MY_REFERRAL.TITLE' | translate }}</h1>
                    <p class="mt-1 max-w-2xl text-sm text-cyan-50">{{ 'USER.MY_REFERRAL.DESCRIPTION' | translate }}</p>
                </div>

                <div *ngIf="isLoading" class="flex justify-center py-12">
                    <app-loading></app-loading>
                </div>

                <div *ngIf="!isLoading && !referralCode" class="px-6 py-12 text-center text-slate-500">
                    <i class="fa-solid fa-share-nodes mb-3 text-3xl text-slate-300"></i>
                    <p class="font-medium">{{ 'USER.MY_REFERRAL.EMPTY' | translate }}</p>
                </div>

                <div *ngIf="!isLoading && referralCode" class="grid gap-5 p-6 sm:grid-cols-2">
                    <div class="flex flex-col rounded-xl bg-slate-50 p-5">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {{ 'USER.MY_REFERRAL.CODE_LABEL' | translate }}
                        </p>
                        <p class="mt-2 break-all font-mono text-2xl font-bold text-primary">{{ referralCode }}</p>
                        <p class="mt-2 flex-1 text-xs text-slate-500">{{ 'USER.MY_REFERRAL.CODE_HINT' | translate }}</p>
                        <div class="mt-4">
                            <app-button variant="primary" size="sm" (onClick)="onCopyCode()">
                                <i class="fa-regular fa-copy mr-2"></i>{{ 'USER.MY_REFERRAL.COPY_CODE' | translate }}
                            </app-button>
                        </div>
                    </div>

                    <div class="flex flex-col rounded-xl bg-slate-50 p-5">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {{ 'USER.MY_REFERRAL.LINK_LABEL' | translate }}
                        </p>
                        <p class="mt-2 break-all text-sm font-semibold text-slate-700">{{ shareLink }}</p>
                        <p class="mt-2 flex-1 text-xs text-slate-500">{{ 'USER.MY_REFERRAL.LINK_HINT' | translate }}</p>
                        <div class="mt-4">
                            <app-button variant="primary" size="sm" (onClick)="onCopyLink()">
                                <i class="fa-solid fa-link mr-2"></i>{{ 'USER.MY_REFERRAL.COPY_LINK' | translate }}
                            </app-button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h2 class="text-lg font-semibold text-slate-800">{{ 'USER.MY_REFERRAL.STATS_TITLE' | translate }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_REFERRAL.STATS_DESCRIPTION' | translate }}</p>

                <div *ngIf="statsLoading" class="flex justify-center py-10">
                    <app-loading></app-loading>
                </div>

                <ng-container *ngIf="!statsLoading">
                    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div *ngFor="let card of statCards" class="rounded-xl bg-slate-50 p-4">
                            <div class="flex items-center gap-3">
                                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-primary">
                                    <i [class]="card.icon"></i>
                                </span>
                                <div class="min-w-0">
                                    <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        {{ card.label | translate }}
                                    </p>
                                    <p class="text-xl font-bold text-slate-800">{{ card.total }}</p>
                                </div>
                            </div>
                            <p class="mt-2 text-xs text-slate-500" *ngIf="card.note">{{ card.note }}</p>
                        </div>
                    </div>

                    <div class="mt-6" *ngIf="isBrowser() && chartOptions">
                        <div class="mb-2 flex flex-wrap items-center justify-between gap-3">
                            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {{ 'USER.MY_REFERRAL.STATS_CHART_TITLE' | translate }}
                            </p>
                            <div class="flex items-center gap-2">
                                <app-button [variant]="chartType === 'bar' ? 'primary' : 'secondary'" [size]="'sm'"
                                    (onClick)="setChartType('bar')">
                                    {{ 'COMMON.CHART_TYPE.BAR' | translate }}
                                </app-button>
                                <app-button [variant]="chartType === 'line' ? 'primary' : 'secondary'" [size]="'sm'"
                                    (onClick)="setChartType('line')">
                                    {{ 'COMMON.CHART_TYPE.LINE' | translate }}
                                </app-button>
                            </div>
                        </div>
                        <apx-chart
                            [chart]="chartOptions.chart"
                            [series]="chartOptions.series"
                            [colors]="chartOptions.colors"
                            [plotOptions]="chartOptions.plotOptions"
                            [stroke]="chartOptions.stroke"
                            [markers]="chartOptions.markers"
                            [dataLabels]="chartOptions.dataLabels"
                            [grid]="chartOptions.grid"
                            [xaxis]="chartOptions.xaxis"
                            [yaxis]="chartOptions.yaxis"
                            [legend]="chartOptions.legend"
                            [tooltip]="chartOptions.tooltip"
                            [noData]="chartOptions.noData"
                        ></apx-chart>
                    </div>

                    <div class="mt-6">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {{ 'USER.MY_REFERRAL.STATS_EVENTS_TITLE' | translate }}
                        </p>

                        <div class="mt-3 flex flex-wrap items-end gap-x-4 gap-y-4" style="--control-h: 2.5rem">
                            <!-- Nhóm tìm kiếm: chọn cột + từ khoá + nút -->
                            <div class="flex w-full flex-wrap items-end gap-3 lg:flex-1 lg:min-w-0">
                                <app-search-by [options]="eventSearchFieldOptions" [(value)]="eventSearchField"></app-search-by>
                                <div class="w-full lg:flex-1 lg:min-w-0">
                                    <app-input [(ngModel)]="eventSearchText"
                                        [label]="'COMMON.SEARCH_FIELD.KEYWORD' | translate"
                                        [placeholder]="'USER.MY_REFERRAL.STATS_SEARCH_PLACEHOLDER' | translate"
                                        (keyup.enter)="onEventsSearch()"></app-input>
                                </div>
                                <app-button variant="primary" (onClick)="onEventsSearch()">
                                    <i class="fas fa-search mr-2"></i>{{ 'COMMON.BUTTON.SEARCH' | translate }}
                                </app-button>
                                <app-button variant="outline" (onClick)="onEventsReset()">
                                    <i class="fas fa-rotate-left mr-2"></i>{{ 'COMMON.BUTTON.RESET' | translate }}
                                </app-button>
                            </div>

                            <!-- Nhóm lọc: khoảng ngày -->
                            <div
                                class="flex w-full flex-wrap items-end gap-3 border-t border-gray-200 pt-3 lg:w-auto lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                                <ngx-filter-daterange [from]="eventFromDate" [to]="eventToDate"
                                    (rangeChange)="onEventsRangeChange($event)"></ngx-filter-daterange>
                            </div>
                        </div>

                        <div class="mt-3 overflow-x-auto rounded-xl ring-1 ring-slate-100">
                            <table class="w-full text-sm">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            {{ 'USER.MY_REFERRAL.STATS_COL_TIME' | translate }}
                                        </th>
                                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            {{ 'USER.MY_REFERRAL.STATS_COL_TYPE' | translate }}
                                        </th>
                                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            {{ 'USER.MY_REFERRAL.STATS_COL_TARGET' | translate }}
                                        </th>
                                        <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            {{ 'USER.MY_REFERRAL.STATS_COL_STATUS' | translate }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr *ngIf="eventsLoading">
                                        <td colspan="4" class="px-4 py-6 text-center"><app-loading [inline]="true"></app-loading></td>
                                    </tr>
                                    <tr *ngIf="!eventsLoading && events.length === 0">
                                        <td colspan="4" class="px-4 py-6 text-center text-slate-500">
                                            {{ 'USER.MY_REFERRAL.STATS_EVENTS_EMPTY' | translate }}
                                        </td>
                                    </tr>
                                    <tr *ngFor="let event of events">
                                        <td class="px-4 py-3 text-slate-500">{{ event.createdAt | appDate }}</td>
                                        <td class="px-4 py-3 text-slate-700">{{ eventTypeKey(event.eventType) | translate }}</td>
                                        <td class="px-4 py-3 font-mono text-slate-600">{{ event.refEntityCode || '--' }}</td>
                                        <td class="px-4 py-3">
                                            <app-badge [label]="eventStatusKey(event.status)"
                                                [variant]="eventStatusVariant(event.status)" [size]="'sm'">
                                            </app-badge>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <app-pagination
                            [pageNumber]="eventsPage"
                            [pageSize]="eventsPageSize"
                            [totalCount]="eventsTotalCount"
                            [totalPages]="eventsTotalPages"
                            [hasPreviousPage]="eventsHasPreviousPage"
                            [hasNextPage]="eventsHasNextPage"
                            (pageChange)="onEventsPageChange($event)"
                            (pageSizeChange)="onEventsPageSizeChange($event)">
                        </app-pagination>
                    </div>
                </ng-container>
            </section>

            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h2 class="text-lg font-semibold text-slate-800">{{ 'USER.MY_REFERRAL.USED_TITLE' | translate }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_REFERRAL.USED_DESCRIPTION' | translate }}</p>

                <ul class="mt-4 space-y-3 text-sm text-slate-600">
                    <li *ngFor="let key of usedFlows" class="flex gap-3">
                        <i class="fa-solid fa-circle-check mt-0.5 text-primary"></i>
                        <span>{{ key | translate }}</span>
                    </li>
                </ul>
            </section>
        </div>
    `,
})
export class MyReferralPageComponent implements OnInit, OnDestroy {
    referralCode: string | null = null;
    shareLink = '';
    isLoading = true;

    readonly isBrowser = isBrowser;

    // Thống kê giới thiệu của chính tài khoản này
    statsLoading = true;
    overview: ReferralStatsOverview | null = null;
    statCards: MyReferralCard[] = [];
    chartOptions: ApexOptions | null = null;
    /** Kiểu biểu đồ phát sinh theo ngày — dạng đường dễ nhìn hơn khi nhiều mốc. */
    chartType: 'bar' | 'line' = 'line';

    events: ReferralEventItem[] = [];
    eventsLoading = false;
    eventsPage = 1;
    eventsPageSize = 10;
    eventsTotalCount = 0;
    eventsTotalPages = 0;
    eventsHasPreviousPage = false;
    eventsHasNextPage = false;

    /** Bộ lọc danh sách phát sinh giới thiệu (mã chia sẻ/mã đối tượng/trạng thái + khoảng ngày) */
    eventSearchText = '';
    eventSearchField: string | null = null;
    eventSearchFieldOptions: SearchFieldOption[] = [];
    eventFromDate: string | null = null;
    eventToDate: string | null = null;

    private langSub: Subscription | null = null;

    /** Các luồng ghi nhận mã chia sẻ (cột ReferralCode ở các bảng nghiệp vụ) */
    readonly usedFlows: string[] = [
        'USER.MY_REFERRAL.USED_GROUP_BUYING_CREATE',
        'USER.MY_REFERRAL.USED_GROUP_BUYING_JOIN',
        'USER.MY_REFERRAL.USED_PURCHASE_REQUEST',
        'USER.MY_REFERRAL.USED_OFFER_REQUEST',
        'USER.MY_REFERRAL.USED_GROUP_POST'
    ];

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this._appService.collaboratorService.getMyReferralCode().subscribe({
            next: (code) => {
                this.referralCode = code;
                this.shareLink = buildReferralShareUrl(code);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });

        this.loadStats();
        this.eventSearchFieldOptions = referralEventSearchFields((key: string) => this._appService.trans(key));
        this.loadEvents();

        // Tên series của chart được gắn lúc dựng -> dựng lại khi đổi ngôn ngữ
        this.langSub = this._appService.onLanguageChange().subscribe(() => this.buildChart());
    }

    ngOnDestroy(): void {
        this.langSub?.unsubscribe();
    }

    // ===== Thống kê của tôi =====

    private loadStats(): void {
        this.statsLoading = true;
        this._appService.referralService.getMyStats({})
            .pipe(finalize(() => { this.statsLoading = false; }))
            .subscribe({
                next: (response) => {
                    this.buildCards(response.data);
                    this.overview = response.data;
                    this.buildChart();
                },
                error: () => { this.statCards = []; }
            });
    }

    private buildCards(overview: ReferralStatsOverview | null): void {
        const s = overview?.summary;
        if (!s) {
            this.statCards = [];
            return;
        }

        this.statCards = [
            {
                key: 'REFERRED_USERS',
                label: 'ADMIN.REFERRAL_STATS.CARD_REFERRED_USERS',
                icon: 'fa-solid fa-user-plus',
                total: s.totalReferredUsers,
                note: s.totalReferredGuestUsers > 0
                    ? this._appService.trans('ADMIN.REFERRAL_STATS.GUEST_NOTE', { count: s.totalReferredGuestUsers })
                    : null
            },
            {
                key: 'GROUP_BUYING',
                label: 'ADMIN.REFERRAL_STATS.CARD_GROUP_BUYING',
                icon: 'fa-solid fa-people-group',
                total: s.totalGroupBuyingRequests,
                note: null
            },
            {
                key: 'PURCHASE_REQUESTS',
                label: 'ADMIN.REFERRAL_STATS.CARD_PURCHASE_REQUESTS',
                icon: 'fa-solid fa-cart-shopping',
                total: s.totalPurchaseRequests,
                note: null
            },
            {
                key: 'OFFER_REQUESTS',
                label: 'ADMIN.REFERRAL_STATS.CARD_OFFER_REQUESTS',
                icon: 'fa-solid fa-tags',
                total: s.totalOfferRequests,
                note: null
            },
            {
                key: 'GROUP_MEMBERS',
                label: 'ADMIN.REFERRAL_STATS.COL_GROUP_MEMBERS',
                icon: 'fa-solid fa-people-roof',
                total: s.totalGroupMemberJoins,
                note: null
            },
            {
                key: 'CANCELLED',
                label: 'ADMIN.REFERRAL_STATS.CARD_CANCELLED',
                icon: 'fa-solid fa-ban',
                total: s.totalCancelledEvents,
                note: s.totalCancelledEvents > 0 ? this._appService.trans('ADMIN.REFERRAL_STATS.CANCELLED_NOTE') : null
            }
        ];
    }

    setChartType(chartType: 'bar' | 'line'): void {
        if (this.chartType === chartType) {
            return;
        }

        this.chartType = chartType;
        this.buildChart();
    }

    private buildChart(): void {
        const timeline = this.overview?.timeline ?? [];
        if (timeline.length === 0) {
            this.chartOptions = null;
            return;
        }

        const isLine = this.chartType === 'line';

        this.chartOptions = {
            chart: { type: this.chartType, height: 260, toolbar: { show: false }, fontFamily: 'inherit' },
            series: [{
                name: this._appService.trans('USER.MY_REFERRAL.STATS_CHART_TITLE'),
                data: timeline.map(x => x.count)
            }],
            colors: [CHART_PALETTE[0]],
            plotOptions: isLine ? {} : { bar: { borderRadius: 4, columnWidth: '45%' } },
            stroke: isLine ? { curve: 'smooth', width: 3 } : { width: 0 },
            markers: isLine ? { size: 4, strokeWidth: 2, hover: { size: 6 } } : { size: 0 },
            dataLabels: { enabled: false },
            grid: { borderColor: 'var(--border-slate)', strokeDashArray: 4 },
            xaxis: {
                categories: timeline.map(x => new Date(x.date).toLocaleDateString()),
                labels: { style: { colors: 'var(--slate-400)', fontSize: '12px' } }
            },
            yaxis: { labels: { style: { colors: 'var(--slate-400)', fontSize: '12px' } }, forceNiceScale: true },
            legend: { show: false },
            tooltip: { theme: 'light' },
            noData: { text: this._appService.trans('PAGINATION.NO_ITEMS') }
        };
    }

    // ===== Phát sinh của tôi =====

    private loadEvents(): void {
        this.eventsLoading = true;
        this._appService.referralService.getMyEvents({
            page: this.eventsPage,
            pageSize: this.eventsPageSize,
            from: this.eventFromDate,
            to: this.eventToDate,
            search: this.eventSearchText.trim() || null,
            searchField: this.eventSearchField
        })
            .pipe(finalize(() => { this.eventsLoading = false; }))
            .subscribe({
                next: (response: PagedResponse<ReferralEventItem>) => {
                    this.events = response.data;
                    this.eventsPage = response.pageNumber;
                    this.eventsPageSize = response.pageSize;
                    this.eventsTotalCount = response.totalCount;
                    this.eventsTotalPages = response.totalPages;
                    this.eventsHasPreviousPage = response.hasPreviousPage;
                    this.eventsHasNextPage = response.hasNextPage;
                },
                error: () => { this.events = []; }
            });
    }

    onEventsPageChange(page: number): void {
        this.eventsPage = page;
        this.loadEvents();
    }

    onEventsPageSizeChange(size: number): void {
        this.eventsPageSize = size;
        this.eventsPage = 1;
        this.loadEvents();
    }

    /** Tìm phát sinh: bấm nút/Enter đều tải lại từ trang đầu. */
    onEventsSearch(): void {
        this.eventsPage = 1;
        this.loadEvents();
    }

    /** Đổi khoảng ngày phát sinh thì tải lại (bỏ trống = không lọc ngày). */
    onEventsRangeChange(range: { from: string | null; to: string | null }): void {
        this.eventFromDate = range.from;
        this.eventToDate = range.to;
        this.eventsPage = 1;
        this.loadEvents();
    }

    /** Đặt lại bộ lọc phát sinh: từ khoá, cột tìm kiếm và khoảng ngày. */
    onEventsReset(): void {
        this.eventSearchText = '';
        this.eventSearchField = null;
        this.eventFromDate = null;
        this.eventToDate = null;
        this.eventsPage = 1;
        this.loadEvents();
    }

    eventTypeKey(type: ReferralEventType): string {
        const keys: Record<number, string> = {
            [ReferralEventType.UserReferred]: 'USER_REFERRED',
            [ReferralEventType.GroupBuyingRequest]: 'GROUP_BUYING_REQUEST',
            [ReferralEventType.GroupBuyingJoin]: 'GROUP_BUYING_JOIN',
            [ReferralEventType.PurchaseRequest]: 'PURCHASE_REQUEST',
            [ReferralEventType.OfferRequest]: 'OFFER_REQUEST',
            [ReferralEventType.GroupMemberJoin]: 'GROUP_MEMBER_JOIN',
            [ReferralEventType.PartnerRegister]: 'PARTNER_REGISTER'
        };
        return `ADMIN.REFERRAL_STATS.EVENT_TYPE.${keys[type] ?? 'USER_REFERRED'}`;
    }

    eventStatusKey(status: ReferralEventStatus): string {
        const keys: Record<number, string> = {
            [ReferralEventStatus.Pending]: 'PENDING',
            [ReferralEventStatus.Approved]: 'APPROVED',
            [ReferralEventStatus.Rejected]: 'REJECTED',
            [ReferralEventStatus.Cancelled]: 'CANCELLED',
            [ReferralEventStatus.Paid]: 'PAID'
        };
        return `ADMIN.REFERRAL_STATS.EVENT_STATUS.${keys[status] ?? 'PENDING'}`;
    }

    eventStatusVariant(status: ReferralEventStatus): BadgeVariant {
        const variants: Record<number, BadgeVariant> = {
            [ReferralEventStatus.Pending]: 'warning',
            [ReferralEventStatus.Approved]: 'success',
            [ReferralEventStatus.Rejected]: 'danger',
            [ReferralEventStatus.Cancelled]: 'secondary',
            [ReferralEventStatus.Paid]: 'success'
        };
        return variants[status] ?? 'secondary';
    }

    onCopyCode(): void {
        this.copy(this.referralCode, 'USER.MY_REFERRAL.COPY_CODE_SUCCESS');
    }

    onCopyLink(): void {
        this.copy(this.shareLink, 'USER.MY_REFERRAL.COPY_LINK_SUCCESS');
    }

    private copy(value: string | null, successKey: string): void {
        if (!value) return;

        copyToClipboard(value).then(() => this._appService.showSuccess(this._appService.trans(successKey)));
    }
}
