import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { collaboratorSearchFields } from '@core/constants/search-fields';
import { Collaborator, CollaboratorStatus } from '@core/models/collaborator.model';
import { PagedResponse } from '@core/models/paged-response.model';
import { Permission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { CodeListComponent } from '@shared/components/code-list/code-list.component';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';

@Component({
    selector: 'app-admin-collaborator-list',
    standalone: true,
    imports: [
        PurgeBarComponent,
        CommonModule,
        RouterModule,
        FormsModule,
        TranslateModule,
        CodeListComponent,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        PaginationComponent,
        BadgeComponent,
        StatusTabsComponent,
        NgxFilterDaterangeComponent,
        AppDatePipe,
        HasPermissionDirective,
        SearchByComponent
    ],
    templateUrl: './collaborator-list.component.html',
    styleUrls: ['./collaborator-list.component.css']
})
export class AdminCollaboratorListComponent implements OnInit {
    /** Các dòng đang tick ở tab "Đã xoá" — dùng cho xoá vĩnh viễn theo lựa chọn. */
    selectedIds: string[] = [];

    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    // Data
    collaborators: Collaborator[] = [];
    isLoading = true;
    isDeleting = false;
    isRestoring = false;

    // Search
    searchText = '';
    fromDate: string | null = null;
    toDate: string | null = null;

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: { value: string; label: string }[] = [];

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
        this.buildTabs();
        this.buildSearchFieldOptions();
        this.loadData();
    }

    /** Các cột tìm kiếm dùng chung (CollaboratorSearchField) khớp tham số searchField của API. */
    private buildSearchFieldOptions(): void {
        this.searchFieldOptions = collaboratorSearchFields((key: string) => this._appService.trans(key));
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: 'pending', label: this._appService.trans('COMMON.STATUS.PENDING') },
            { key: 'approved', label: this._appService.trans('COMMON.STATUS.APPROVED') },
            { key: 'rejected', label: this._appService.trans('COMMON.STATUS.REJECTED') }
        ];

        // Tab "Đã xóa" hiện khi có quyền xem hồ sơ CTV đã xoá (P115) hoặc khôi phục (P027)
        // — đúng cặp mã [HasPermission(ViewRestoreCollaborator, RestoreCollaborator)] của API.
        if (this._appService.permissionService.has([Permission.ViewRestoreCollaborator, Permission.RestoreCollaborator])) {
            this.tabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') });
        }
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
            this._appService.collaboratorService.getDeletedData(
                this.pageNumber,
                this.pageSize,
                this.searchText,
                this.fromDate ?? undefined,
                this.toDate ?? undefined,
                this.searchField ?? undefined
            )
                .subscribe({
                    next: (response: PagedResponse<Collaborator>) => {
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

        let status: CollaboratorStatus | undefined;
        if (this.activeTab !== 'all') {
            switch (this.activeTab) {
                case 'pending': status = CollaboratorStatus.Pending; break;
                case 'approved': status = CollaboratorStatus.Approved; break;
                case 'rejected': status = CollaboratorStatus.Rejected; break;
            }
        }

        this._appService.collaboratorService.getData(
                this.pageNumber,
                this.pageSize,
                this.searchText,
                status,
                this.fromDate ?? undefined,
                this.toDate ?? undefined,
                this.searchField ?? undefined
            )
            .subscribe({
                next: (response: PagedResponse<Collaborator>) => {
                    this.applyPagedResponse(response);                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                }
            });
    }

    private applyPagedResponse(response: PagedResponse<Collaborator>): void {
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

    onDelete(item: Collaborator): void {
        this._appService.confirmDelete(
            this._appService.trans('ADMIN.CTV.DELETE_CONFIRM', { name: item.fullName })
        ).then(confirmed => {
            if (!confirmed) return;
            this.isDeleting = true;
            this._appService.collaboratorService.delete(item.id).subscribe({
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

    onRestore(item: Collaborator): void {
        this.isRestoring = true;
        this._appService.collaboratorService.restore(item.id).subscribe({
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

    getStatusVariant(status: CollaboratorStatus): BadgeVariant {
        const variants: Record<number, BadgeVariant> = {
            [CollaboratorStatus.Pending]: 'warning',
            [CollaboratorStatus.Approved]: 'success',
            [CollaboratorStatus.Rejected]: 'danger',
            [CollaboratorStatus.Suspended]: 'secondary',
            [CollaboratorStatus.Active]: 'success'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: CollaboratorStatus): string {
        const keys: Record<number, string> = {
            [CollaboratorStatus.Pending]: 'pending',
            [CollaboratorStatus.Approved]: 'approved',
            [CollaboratorStatus.Rejected]: 'rejected',
            [CollaboratorStatus.Suspended]: 'suspended',
            [CollaboratorStatus.Active]: 'approved'
        };
        return keys[status] || 'pending';
    }

    navigateToDetail(id: string): void {
        this._router.navigate(['/admin/collaborator', id]);
    }

    /** Sau khi xoá vĩnh viễn: nạp lại danh sách của tab 'Đã xoá'. */
    onPurged(): void {
        this.loadData();
    }
}