import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { CtvRegistration, CTVRegistrationStatus } from '@core/models/ctv.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';

@Component({
    selector: 'app-admin-collaborator-list',
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
        StatusTabsComponent
    ],
    templateUrl: './collaborator-list.component.html',
    styleUrls: ['./collaborator-list.component.css']
})
export class AdminCollaboratorListComponent implements OnInit {
    // Data
    collaborators: CtvRegistration[] = [];
    isLoading = true;
    isDeleting = false;
    isRestoring = false;

    // Search
    searchText = '';

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

    constructor(private _appService: AppService, private _router: Router) { }

    ngOnInit(): void {
        this.buildTabs();        this.loadData();
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: 'pending', label: this._appService.trans('COMMON.STATUS.PENDING') },
            { key: 'approved', label: this._appService.trans('COMMON.STATUS.APPROVED') },
            { key: 'rejected', label: this._appService.trans('COMMON.STATUS.REJECTED') },
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
            this._appService.ctvService.getDeletedData(this.pageNumber, this.pageSize, this.searchText)
                .subscribe({
                    next: (response: PagedResponse<CtvRegistration>) => {
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

        let status: CTVRegistrationStatus | undefined;
        if (this.activeTab !== 'all') {
            switch (this.activeTab) {
                case 'pending': status = CTVRegistrationStatus.Pending; break;
                case 'approved': status = CTVRegistrationStatus.Approved; break;
                case 'rejected': status = CTVRegistrationStatus.Rejected; break;
            }
        }

        this._appService.ctvService.getData(this.pageNumber, this.pageSize, this.searchText, status)
            .subscribe({
                next: (response: PagedResponse<CtvRegistration>) => {
                    this.applyPagedResponse(response);                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                }
            });
    }

    private applyPagedResponse(response: PagedResponse<CtvRegistration>): void {
        this.collaborators = response.data;
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

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadData();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.pageNumber = 1;
        this.loadData();
    }

    onDelete(item: CtvRegistration): void {
        this._appService.confirmDelete(
            this._appService.trans('ADMIN.CTV.DELETE_CONFIRM', { name: item.fullName })
        ).then(confirmed => {
            if (!confirmed) return;
            this.isDeleting = true;
            this._appService.ctvService.delete(item.id).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.CTV.DELETED_SUCCESS'));
                    this.loadData();
                },
                error: () => {
                    this.isDeleting = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }

    onRestore(item: CtvRegistration): void {
        this.isRestoring = true;
        this._appService.ctvService.restore(item.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.CTV.RESTORED_SUCCESS'));
                this.loadData();
            },
            error: () => {
                this.isRestoring = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    getStatusVariant(status: CTVRegistrationStatus): BadgeVariant {
        const variants: Record<CTVRegistrationStatus, BadgeVariant> = {
            [CTVRegistrationStatus.Pending]: 'warning',
            [CTVRegistrationStatus.Approved]: 'success',
            [CTVRegistrationStatus.Rejected]: 'danger'
        };
        return variants[status] || 'secondary';
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
        this._router.navigate(['/admin/collaborator', id]);
    }
}