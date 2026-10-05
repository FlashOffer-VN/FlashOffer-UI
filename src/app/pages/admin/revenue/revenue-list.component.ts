// pages/admin/revenue/revenue-list.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import type { ApexOptions } from 'apexcharts';
import { ChartComponent } from 'ng-apexcharts';

import { AppService } from '@core/services/app.service';
import { RevenueService } from '@core/services/revenue.service';
import { isBrowser } from '@core/utils/platform';
import {
    RevenueRecordStatus,
    RevenueStats,
    RevenueTransactionType,
    TransactionRevenue
} from '@core/models/revenue.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';

/** Bảng màu cho biểu đồ: màu đầu là màu thương hiệu, các màu sau để phân biệt chỉ số. */
const CHART_PALETTE = ['var(--primary)', 'var(--chart-violet)', 'var(--orange-dark)', 'var(--success-mid)', 'var(--pink-dark)'];

/** Định dạng số gọn cho nhãn trục tung (VD: 1.234.567 -> 1,2 Tr). */
const AXIS_NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 });

/** Định dạng số đầy đủ cho chú thích khi rê chuột. */
const FULL_NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });

/**
 * Thống kê doanh thu theo tuần/tháng/năm và danh sách bản khai doanh thu của từng giao dịch.
 *
 * Thống kê chỉ tính bản khai đã chốt; số bản còn nháp hiện riêng để nhắc chốt nốt.
 */
@Component({
    selector: 'app-admin-revenue-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TranslateModule,
        ChartComponent,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        PaginationComponent,
        StatusTabsComponent,
        AppDatePipe,
        AppPricePipe
    ],
    templateUrl: './revenue-list.component.html'
})
export class AdminRevenueListComponent implements OnInit, OnDestroy {
    /** Cách gộp nhóm của thống kê: tuần, tháng hay năm. */
    periodTabs: StatusTabItem[] = [];
    period = 'month';
    stats: RevenueStats | null = null;
    isLoadingStats = true;
    statsFailed = false;

    /** Biểu đồ doanh thu theo kỳ; chỉ dựng khi kỳ có số liệu. */
    chartOptions: ApexOptions | null = null;
    /** Kiểu biểu đồ đang chọn: cột hoặc đường. */
    chartType: 'bar' | 'line' = 'line';

    /** Cho phép template chỉ vẽ biểu đồ ở trình duyệt (an toàn khi dựng sẵn). */
    readonly isBrowser = isBrowser;

    /** Lọc danh sách bản khai. */
    statusTabs: StatusTabItem[] = [];
    statusFilter: RevenueRecordStatus | null = null;
    keyword = '';

    records: TransactionRevenue[] = [];
    isLoadingList = true;
    recordsFailed = false;
    page = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 1;
    hasPreviousPage = false;
    hasNextPage = false;

    /** Theo dõi đổi ngôn ngữ để dựng lại nhãn biểu đồ. */
    private langSub: Subscription | null = null;

    constructor(
        private _revenueService: RevenueService,
        private _appService: AppService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.periodTabs = [
            { key: 'week', label: this._appService.trans('ADMIN.REVENUE.PERIOD_WEEK') },
            { key: 'month', label: this._appService.trans('ADMIN.REVENUE.PERIOD_MONTH') },
            { key: 'year', label: this._appService.trans('ADMIN.REVENUE.PERIOD_YEAR') }
        ];

        this.statusTabs = [
            { key: 'all', label: this._appService.trans('ADMIN.REVENUE.STATUS_ALL') },
            { key: 'draft', label: this._appService.trans('ADMIN.REVENUE.STATUS_DRAFT') },
            { key: 'confirmed', label: this._appService.trans('ADMIN.REVENUE.STATUS_CONFIRMED') }
        ];

        // Tên series và nhãn kỳ lấy từ bản dịch nên dựng lại biểu đồ khi đổi ngôn ngữ.
        this.langSub = this._appService.onLanguageChange().subscribe(() => this.buildChart());

        this.loadStats();
        this.loadRecords();
    }

    ngOnDestroy(): void {
        this.langSub?.unsubscribe();
    }

    /** Đổi kỳ thống kê. */
    onPeriodChange(period: string): void {
        this.period = period;
        this.loadStats();
    }

    /** Đổi trạng thái lọc của danh sách bản khai. */
    onStatusChange(status: string): void {
        this.statusFilter = status === 'draft'
            ? RevenueRecordStatus.Draft
            : status === 'confirmed' ? RevenueRecordStatus.Confirmed : null;
        this.loadRecords(1);
    }

    /** Tìm theo mã giao dịch. */
    onSearch(): void {
        this.loadRecords(1);
    }

    onPageChange(page: number): void {
        this.loadRecords(page);
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize = pageSize;
        this.loadRecords(1);
    }

    /** Mở màn chi tiết của giao dịch đã khai. */
    openRecord(record: TransactionRevenue): void {
        const path = record.type === RevenueTransactionType.PurchaseRequest
            ? '/admin/purchase-requests'
            : '/admin/group-buying';
        this._router.navigate([path, record.referenceId]);
    }

    /** Nhãn dễ đọc cho khoá kỳ do máy chủ trả về (2026-10-04, 2026-W41, 2026-10 hay 2026). */
    periodLabel(period: string): string {
        if (period.includes('-W')) {
            const [year, week] = period.split('-W');
            return `${this._appService.trans('ADMIN.REVENUE.WEEK_PREFIX')} ${Number(week)}/${year}`;
        }

        const parts = period.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
        return period;
    }

    /** Tên loại giao dịch. */
    typeLabel(type: RevenueTransactionType): string {
        return type === RevenueTransactionType.PurchaseRequest
            ? this._appService.trans('ADMIN.REVENUE.TYPE_PURCHASE_REQUEST')
            : this._appService.trans('ADMIN.REVENUE.TYPE_GROUP_BUYING');
    }

    /** Tải lại số tổng của kỳ đang chọn. */
    loadStats(): void {
        this.isLoadingStats = true;
        this.statsFailed = false;
        const range = this.currentRange();

        this._revenueService.getStats({ from: range.from, to: range.to, groupBy: this.period as 'week' | 'month' | 'year' }).subscribe({
            next: response => {
                this.stats = response.data;
                this.isLoadingStats = false;
                this.buildChart();
            },
            error: () => {
                this.isLoadingStats = false;
                this.statsFailed = true;
            }
        });
    }

    /** Đổi kiểu biểu đồ giữa cột và đường rồi dựng lại. */
    setChartType(chartType: 'bar' | 'line'): void {
        if (this.chartType === chartType) {
            return;
        }

        this.chartType = chartType;
        this.buildChart();
    }

    /**
     * Dựng biểu đồ doanh thu theo kỳ từ `stats.points`; mỗi chỉ số là một series
     * (doanh thu gộp, thuế, hoa hồng, chi phí, thực nhận) nên bấm vào chú giải
     * để ẩn/hiện riêng từng đường.
     */
    private buildChart(): void {
        const points = this.stats?.points ?? [];
        if (points.length === 0) {
            this.chartOptions = null;
            return;
        }

        const isLine = this.chartType === 'line';

        this.chartOptions = {
            chart: { type: this.chartType, height: 340, toolbar: { show: false }, fontFamily: 'inherit' },
            series: [
                { name: this._appService.trans('ADMIN.REVENUE.GROSS_REVENUE'), data: points.map(p => p.grossRevenue) },
                { name: this._appService.trans('ADMIN.REVENUE.TAX_AMOUNT'), data: points.map(p => p.taxAmount) },
                { name: this._appService.trans('ADMIN.REVENUE.TOTAL_COMMISSION'), data: points.map(p => p.totalCommission) },
                { name: this._appService.trans('ADMIN.REVENUE.EXTRA_COST'), data: points.map(p => p.extraCost) },
                { name: this._appService.trans('ADMIN.REVENUE.ACTUAL_REVENUE'), data: points.map(p => p.actualRevenue) }
            ],
            colors: CHART_PALETTE,
            plotOptions: isLine ? {} : { bar: { borderRadius: 4, columnWidth: '60%' } },
            stroke: isLine ? { curve: 'smooth', width: 3 } : { width: 0 },
            markers: isLine ? { size: 4, strokeWidth: 2, hover: { size: 6 } } : { size: 0 },
            dataLabels: { enabled: false },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            xaxis: {
                categories: points.map(p => this.periodLabel(p.period)),
                labels: { style: { colors: 'var(--text-muted)', fontSize: '12px' }, rotate: -45, rotateAlways: points.length > 12 }
            },
            yaxis: {
                labels: {
                    style: { colors: 'var(--text-muted)', fontSize: '12px' },
                    formatter: value => AXIS_NUMBER_FORMATTER.format(value)
                },
                forceNiceScale: true
            },
            legend: { show: true, position: 'bottom' },
            tooltip: { theme: 'light', y: { formatter: value => FULL_NUMBER_FORMATTER.format(value ?? 0) } },
            noData: { text: this._appService.trans('ADMIN.REVENUE.EMPTY') }
        };
    }

    /** Tải lại danh sách bản khai. */
    loadRecords(page = this.page): void {
        this.isLoadingList = true;
        this.recordsFailed = false;
        this.page = page;

        this._revenueService.getPaged({
            keyword: this.keyword?.trim() || undefined,
            status: this.statusFilter,
            page: this.page,
            pageSize: this.pageSize
        }).subscribe({
            next: response => {
                this.records = response.data ?? [];
                this.totalCount = response.totalCount ?? 0;
                this.totalPages = response.totalPages ?? 1;
                this.hasPreviousPage = response.hasPreviousPage ?? false;
                this.hasNextPage = response.hasNextPage ?? false;
                this.isLoadingList = false;
            },
            error: () => {
                this.isLoadingList = false;
                this.recordsFailed = true;
            }
        });
    }

    /** Khoảng ngày của kỳ đang chọn: tuần tính từ thứ Hai, tháng từ ngày 1, năm từ 01/01. */
    private currentRange(): { from: string; to: string } {
        const today = new Date();
        const start = new Date(today);

        if (this.period === 'week') {
            start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
        } else if (this.period === 'month') {
            start.setDate(1);
        } else {
            start.setMonth(0, 1);
        }

        return { from: FormatDate(start), to: FormatDate(today) };
    }
}

/** Ngày dạng yyyy-MM-dd để gửi lên máy chủ. */
function FormatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}
