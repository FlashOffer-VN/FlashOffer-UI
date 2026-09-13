import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { Partner, PartnerStatus, getPartnerStatusLabel, getBusinessTypeLabel, getCompanySizeLabel } from '@core/models/partner.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

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
        StatusTabsComponent,
        NgxFilterDaterangeComponent
    ],
    templateUrl: './partner-list.component.html',
    styleUrls: ['./partner-list.component.css']
})
export class AdminPartnerListComponent implements OnInit {
    // Data
    partners: Partner[] = [];
    isLoading = true;
    isDeleting = false;
    isRestoring = false;

    // Search
    searchText = '';
    fromDate: string | null = null;
    toDate: string | null = null;

    // Tab lọc status
    activeTab = 'all';
    tabs: { key: string; label: string }[] = [];

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
        this.buildTabs();
        this.loadData();
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: 'pending', label: this._appService.trans('COMMON.STATUS.PENDING') },
            { key: 'approved', label: this._appService.trans('COMMON.STATUS.APPROVED') },
            { key: 'rejected', label: this._appService.trans('COMMON.STATUS.REJECTED') },
            { key: 'active', label: this._appService.trans('COMMON.STATUS.ACTIVE') },
            { key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') }
        ];
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        const isDeleted = this.activeTab === 'deleted';

        if (isDeleted) {
            this._appService.partnerService
                .getDeletedData(this.pageNumber, this.pageSize, this.searchText ?? '')
                .subscribe({
                    next: (response: PagedResponse<Partner>) => {
                        this.applyPagedResponse(response);
                        this.isLoading = false;
                    },
                    error: () => {
                        this.isLoading = false;
                        this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                    }
                });
            return;
        }

        let status: PartnerStatus | undefined;
        if (this.activeTab !== 'all') {
            switch (this.activeTab) {
                case 'pending': status = PartnerStatus.Pending; break;
                case 'approved': status = PartnerStatus.Approved; break;
                case 'rejected': status = PartnerStatus.Rejected; break;
                case 'active': status = PartnerStatus.Active; break;
            }
        }

        this._appService.partnerService
            .getData(
                this.pageNumber,
                this.pageSize,
                this.searchText ?? '',
                status,
                this.fromDate ?? undefined,
                this.toDate ?? undefined
            )
            .subscribe({
                next: (response: PagedResponse<Partner>) => {
                    this.applyPagedResponse(response);
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                }
            });
    }

    private applyPagedResponse(response: PagedResponse<Partner>): void {
        this.partners = response.data;
        this.pageNumber = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
    }

    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
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
        this._router.navigate(['/admin/partner', id]);
    }

    onDelete(partner: Partner): void {
        this._appService.confirmDelete(
            this._appService.trans('ADMIN.PARTNER.DELETE_CONFIRM', { name: partner.fullName })
        ).then(confirmed => {
            if (!confirmed) return;
            this.isDeleting = true;
            this._appService.partnerService.delete(partner.id).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.DELETED_SUCCESS'));
                    this.loadData();
                },
                error: () => {
                    this.isDeleting = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }

    onRestore(partner: Partner): void {
        this.isRestoring = true;
        this._appService.partnerService.restore(partner.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.RESTORED_SUCCESS'));
                this.loadData();
            },
            error: () => {
                this.isRestoring = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }
}