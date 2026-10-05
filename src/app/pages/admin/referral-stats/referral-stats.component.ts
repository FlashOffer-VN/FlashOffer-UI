// src/app/pages/admin/referral-stats/referral-stats.component.ts
import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { ApexOptions } from 'apexcharts';
import { ChartComponent } from 'ng-apexcharts';

import { AppService } from '@core/services/app.service';
import { isBrowser } from '@core/utils/platform';
import { PagedResponse } from '@core/models/paged-response.model';
import {
    ReferralEventItem,
    ReferralEventStatus,
    ReferralEventType,
    ReferralStatsItem,
    ReferralStatsOverview
} from '@core/models/referral-stats.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';

const CHART_PALETTE = ['var(--primary)', 'var(--chart-violet)', 'var(--orange-dark)', 'var(--success-mid)', 'var(--pink-dark)', 'var(--blue)'];

interface ReferralStatCard {
    key: string;
    label: string;
    icon: string;
    color: string;
    total: number;
    note: string | null;
}

@Component({
    selector: 'app-admin-referral-stats',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        ChartComponent,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        PaginationComponent,
        NgxFilterDaterangeComponent,
        BadgeComponent,
        AppDatePipe
    ],
    templateUrl: './referral-stats.component.html',
    styleUrls: ['./referral-stats.component.css']
})
export class AdminReferralStatsComponent implements OnInit, OnDestroy {
    isLoading = true;
    hasError = false;

    readonly isBrowser = isBrowser;

    overview: ReferralStatsOverview | null = null;
    cards: ReferralStatCard[] = [];
    chartOptions: ApexOptions | null = null;
    /** Kiểu biểu đồ phát sinh theo ngày — dạng đường dễ nhìn hơn khi nhiều mốc. */
    chartType: 'bar' | 'line' = 'line';

    // Bộ lọc (mặc định 30 ngày gần nhất theo API)
    searchText = '';
    fromDate: string | null = null;
    toDate: string | null = null;

    // Bảng thống kê theo mã chia sẻ
    items: ReferralStatsItem[] = [];
    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    // Phát sinh của mã đang chọn
    selectedCode: string | null = null;
    /** Bảng phát sinh, dùng để cuộn tới sau khi bấm xem. */
    @ViewChild('eventsPanel') eventsPanel?: ElementRef<HTMLElement>;

    events: ReferralEventItem[] = [];
    eventsLoading = false;
    eventsPage = 1;
    eventsPageSize = 10;
    eventsTotalCount = 0;
    eventsTotalPages = 0;
    eventsHasPreviousPage = false;
    eventsHasNextPage = false;

    private langSub: Subscription | null = null;

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this.loadData();
        // Tên series của chart được gắn lúc dựng -> dựng lại khi đổi ngôn ngữ
        this.langSub = this._appService.onLanguageChange().subscribe(() => {
            this.buildCards();
            this.buildChart();
        });
    }

    ngOnDestroy(): void {
        this.langSub?.unsubscribe();
    }

    loadData(): void {
        this.isLoading = true;
        this.hasError = false;

        const query = {
            from: this.fromDate,
            to: this.toDate,
            search: this.searchText.trim() || null,
            page: this.pageNumber,
            pageSize: this.pageSize
        };

        this._appService.referralService.getOverview(query)
            .pipe(finalize(() => { this.isLoading = false; }))
            .subscribe({
                next: response => {
                    this.overview = response.data;
                    this.buildCards();
                    this.buildChart();
                },
                error: () => { this.hasError = true; }
            });

        this._appService.referralService.getStats(query).subscribe({
            next: (response: PagedResponse<ReferralStatsItem>) => this.applyPagedResponse(response),
            error: () => { this.hasError = true; }
        });
    }

    private applyPagedResponse(response: PagedResponse<ReferralStatsItem>): void {
        this.items = response.data;
        this.pageNumber = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
    }

    // ===== Thẻ tổng quan =====

    private buildCards(): void {
        const s = this.overview?.summary;
        if (!s) {
            this.cards = [];
            return;
        }

        this.cards = [
            {
                key: 'REFERRERS',
                label: 'ADMIN.REFERRAL_STATS.CARD_REFERRERS',
                icon: 'fa-solid fa-share-nodes',
                color: 'blue',
                total: s.totalReferrers,
                note: null
            },
            {
                key: 'REFERRED_USERS',
                label: 'ADMIN.REFERRAL_STATS.CARD_REFERRED_USERS',
                icon: 'fa-solid fa-user-plus',
                color: 'teal',
                total: s.totalReferredUsers,
                note: s.totalReferredGuestUsers > 0
                    ? this._appService.trans('ADMIN.REFERRAL_STATS.GUEST_NOTE', { count: s.totalReferredGuestUsers })
                    : null
            },
            {
                key: 'GROUP_BUYING',
                label: 'ADMIN.REFERRAL_STATS.CARD_GROUP_BUYING',
                icon: 'fa-solid fa-people-group',
                color: 'orange',
                total: s.totalGroupBuyingRequests,
                note: null
            },
            {
                key: 'PURCHASE_REQUESTS',
                label: 'ADMIN.REFERRAL_STATS.CARD_PURCHASE_REQUESTS',
                icon: 'fa-solid fa-cart-shopping',
                color: 'green',
                total: s.totalPurchaseRequests,
                note: null
            },
            {
                key: 'OFFER_REQUESTS',
                label: 'ADMIN.REFERRAL_STATS.CARD_OFFER_REQUESTS',
                icon: 'fa-solid fa-tags',
                color: 'pink',
                total: s.totalOfferRequests,
                note: null
            },
            {
                key: 'CANCELLED',
                label: 'ADMIN.REFERRAL_STATS.CARD_CANCELLED',
                icon: 'fa-solid fa-ban',
                color: 'cyan',
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
            chart: { type: this.chartType, height: 320, toolbar: { show: false }, fontFamily: 'inherit' },
            series: [{
                name: this._appService.trans('ADMIN.REFERRAL_STATS.CHART_SERIES'),
                data: timeline.map(x => x.count)
            }],
            colors: [CHART_PALETTE[0]],
            plotOptions: isLine ? {} : { bar: { borderRadius: 4, columnWidth: '45%' } },
            stroke: isLine ? { curve: 'smooth', width: 3 } : { width: 0 },
            markers: isLine ? { size: 4, strokeWidth: 2, hover: { size: 6 } } : { size: 0 },
            dataLabels: { enabled: false },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            xaxis: {
                categories: timeline.map(x => new Date(x.date).toLocaleDateString()),
                labels: { style: { colors: 'var(--text-muted)', fontSize: '12px' } }
            },
            yaxis: { labels: { style: { colors: 'var(--text-muted)', fontSize: '12px' } }, forceNiceScale: true },
            legend: { show: false },
            tooltip: { theme: 'light' },
            noData: { text: this._appService.trans('PAGINATION.NO_ITEMS') }
        };
    }

    // ===== Bộ lọc =====

    onSearch(): void {
        this.pageNumber = 1;
        this.closeEvents();
        this.loadData();
    }

    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
        this.pageNumber = 1;
        this.closeEvents();
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

    // ===== Phát sinh của một mã =====

    toggleEvents(item: ReferralStatsItem): void {
        if (this.selectedCode === item.recordReferrerCode) {
            this.closeEvents();
            return;
        }

        this.selectedCode = item.recordReferrerCode;
        this.eventsPage = 1;
        this.loadEvents();
    }

    private closeEvents(): void {
        this.selectedCode = null;
        this.events = [];
        this.eventsTotalCount = 0;
        this.eventsTotalPages = 0;
    }

    private loadEvents(): void {
        if (!this.selectedCode) {
            return;
        }

        this.eventsLoading = true;
        this._appService.referralService.getEvents(this.selectedCode, {
            from: this.fromDate,
            to: this.toDate,
            page: this.eventsPage,
            pageSize: this.eventsPageSize
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

                    // Cuộn xuống bảng phát sinh để thấy ngay kết quả sau khi bấm.
                    setTimeout(() => this.eventsPanel?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
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

    // ===== Hiển thị =====

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
}
