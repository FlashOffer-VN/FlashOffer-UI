// pages/admin/revenue/revenue-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { RevenueService } from '@core/services/revenue.service';
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
export class AdminRevenueListComponent implements OnInit {
    /** Cách gộp nhóm của thống kê: tuần, tháng hay năm. */
    periodTabs: StatusTabItem[] = [];
    period = 'month';
    stats: RevenueStats | null = null;
    isLoadingStats = true;

    /** Lọc danh sách bản khai. */
    statusTabs: StatusTabItem[] = [];
    statusFilter: RevenueRecordStatus | null = null;
    keyword = '';

    records: TransactionRevenue[] = [];
    isLoadingList = true;
    page = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 1;
    hasPreviousPage = false;
    hasNextPage = false;

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

        this.loadStats();
        this.loadRecords();
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

    private loadStats(): void {
        this.isLoadingStats = true;
        const range = this.currentRange();

        this._revenueService.getStats({ from: range.from, to: range.to, groupBy: this.period as 'week' | 'month' | 'year' }).subscribe({
            next: response => {
                this.stats = response.data;
                this.isLoadingStats = false;
            },
            error: () => {
                this.isLoadingStats = false;
            }
        });
    }

    private loadRecords(page = this.page): void {
        this.isLoadingList = true;
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
