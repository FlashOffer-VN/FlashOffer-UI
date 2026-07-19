import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { Partner, PartnerStatus, getPartnerStatusLabel, getBusinessTypeLabel, getCompanySizeLabel } from '@core/models/partner.model';
import { PagedResponse } from '@core/models/paged-response.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

// Define type for status option
interface StatusOption {
    value: PartnerStatus | null;
    label: string;
}

@Component({
    selector: 'app-admin-partner-list',
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
    templateUrl: './partner-list.component.html',
    styleUrls: ['./partner-list.component.css']
})
export class AdminPartnerListComponent implements OnInit {
    // Data
    partners: Partner[] = [];
    isLoading = true;

    // Filter
    searchText = '';
    selectedStatus: PartnerStatus | null = null;

    // Status options for filter dropdown
    statusOptions: StatusOption[] = [];

    // Pagination
    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    // Translate keys for business type
    businessTypeKeys: Record<number, string> = {
        1: 'PARTNER.BUSINESS_TYPE_SME',
        2: 'PARTNER.BUSINESS_TYPE_SOLE_PROPRIETOR',
        3: 'PARTNER.BUSINESS_TYPE_PARTNERSHIP',
        4: 'PARTNER.BUSINESS_TYPE_CORPORATION',
        5: 'PARTNER.BUSINESS_TYPE_LIMITED',
        6: 'PARTNER.BUSINESS_TYPE_OTHER'
    };

    constructor(private _appService: AppService, private _router: Router) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.statusOptions = [
            { value: null, label: this._appService.instant('COMMON.ALL') },
            { value: PartnerStatus.Pending, label: this._appService.instant('COMMON.STATUS.PENDING') },
            { value: PartnerStatus.Approved, label: this._appService.instant('COMMON.STATUS.APPROVED') },
            { value: PartnerStatus.Rejected, label: this._appService.instant('COMMON.STATUS.REJECTED') },
            { value: PartnerStatus.Active, label: this._appService.instant('COMMON.STATUS.ACTIVE') }
        ];
        this._appService.partnerService
            .getData(
                this.pageNumber,
                this.pageSize,
                this.searchText ?? '',
                this.selectedStatus ?? undefined
            )
            .subscribe({
                next: (response: PagedResponse<Partner>) => {
                    this.partners = response.data;
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

    onStatusChange(status: PartnerStatus | null): void {
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

    getStatusVariant(status: PartnerStatus): BadgeVariant {
        const variants: Record<PartnerStatus, BadgeVariant> = {
            [PartnerStatus.Pending]: 'warning',
            [PartnerStatus.Approved]: 'success',
            [PartnerStatus.Rejected]: 'danger',
            [PartnerStatus.Active]: 'success'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: PartnerStatus): string {
        const keys: Record<PartnerStatus, string> = {
            [PartnerStatus.Pending]: 'pending',
            [PartnerStatus.Approved]: 'approved',
            [PartnerStatus.Rejected]: 'rejected',
            [PartnerStatus.Active]: 'active'
        };
        return keys[status] || 'pending';
    }

    getBusinessTypeLabel(type: number): string {
        return this.businessTypeKeys[type] || type.toString();
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
        this._router.navigate(['/admin/partner/', id]);
    }
}