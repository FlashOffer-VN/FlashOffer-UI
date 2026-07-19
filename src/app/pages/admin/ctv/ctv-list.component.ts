import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { CtvRegistration, CTVRegistrationStatus, getCTVStatusLabel, getSalesChannelLabel } from '@core/models/ctv.model';
import { PagedResponse } from '@core/models/paged-response.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

interface StatusOption {
    value: CTVRegistrationStatus | null;
    label: string;
}

@Component({
    selector: 'app-admin-ctv-list',
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
        BadgeComponent,
        NgSelectWrapperComponent
    ],
    templateUrl: './ctv-list.component.html',
    styleUrls: ['./ctv-list.component.css']
})
export class AdminCtvListComponent implements OnInit {
    // Data
    ctvs: CtvRegistration[] = [];
    isLoading = true;

    // Filter
    searchText = '';
    selectedStatus: CTVRegistrationStatus | null = null;

    // Status options for filter dropdown
    statusOptions: StatusOption[] = [];

    // Pagination
    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    // Translate keys for sales channel
    salesChannelKeys: Record<number, string> = {
        1: 'FIND_SUPPLIER.SALES_CHANNEL_RETAIL',
        2: 'FIND_SUPPLIER.SALES_CHANNEL_WHOLESALE',
        3: 'FIND_SUPPLIER.SALES_CHANNEL_ONLINE',
        4: 'FIND_SUPPLIER.SALES_CHANNEL_OFFLINE',
        5: 'FIND_SUPPLIER.SALES_CHANNEL_OTHER'
    };

    constructor(private _appService: AppService, private _router: Router) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.statusOptions = [
            { value: null, label: this._appService.instant('COMMON.ALL') },
            { value: CTVRegistrationStatus.Pending, label: this._appService.instant('COMMON.STATUS.PENDING') },
            { value: CTVRegistrationStatus.Approved, label: this._appService.instant('COMMON.STATUS.APPROVED') },
            { value: CTVRegistrationStatus.Rejected, label: this._appService.instant('COMMON.STATUS.REJECTED') }
        ];

        this._appService.ctvService
            .getData(
                this.pageNumber,
                this.pageSize,
                this.searchText,
                this.selectedStatus ?? undefined
            )
            .subscribe({
                next: (response: PagedResponse<CtvRegistration>) => {
                    this.ctvs = response.data;
                    this.pageNumber = response.pageNumber;
                    this.pageSize = response.pageSize;
                    this.totalCount = response.totalCount;
                    this.totalPages = response.totalPages;
                    this.hasPreviousPage = response.hasPreviousPage;
                    this.hasNextPage = response.hasNextPage;
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this._appService.showError(this._appService.instant('COMMON.ERROR.LOAD_FAILED'));
                }
            });
    }

    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onStatusChange(status: CTVRegistrationStatus | null): void {
        this.selectedStatus = status;
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

    getStatusVariant(status: CTVRegistrationStatus): BadgeVariant {
        const variants: Record<CTVRegistrationStatus, BadgeVariant> = {
            [CTVRegistrationStatus.Pending]: 'warning',
            [CTVRegistrationStatus.Approved]: 'success',
            [CTVRegistrationStatus.Rejected]: 'danger'
        };
        return variants[status] || 'secondary';
    }

    getSalesChannelLabel(channel: number | undefined): string {
        if (channel === undefined) return '--';
        return this.salesChannelKeys[channel] || channel.toString();
    }

    getStatusKey(status: CTVRegistrationStatus): string {
        const keys: Record<CTVRegistrationStatus, string> = {
            [CTVRegistrationStatus.Pending]: 'pending',
            [CTVRegistrationStatus.Approved]: 'approved',
            [CTVRegistrationStatus.Rejected]: 'rejected'
        };
        return keys[status] || 'pending';
    }

    formatId(id: string): string {
        return id.substring(0, 8).toUpperCase();
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    navigateToDetail(id: string): void {
        this._router.navigate(['/admin/ctv', id]);
    }
}