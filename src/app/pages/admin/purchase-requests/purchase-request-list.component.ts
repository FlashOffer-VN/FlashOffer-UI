import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { requestSearchFields } from '@core/constants/search-fields';
import { PurchaseRequest, PurchaseRequestStatus } from '@core/models/purchase-request.model';
import { Permission } from '@core/models/permission.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

import { GroupPostType } from '@core/models/business-group.model';
import { ShareToGroupComponent } from '@shared/components/share-to-group/share-to-group.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { ShortIdPipe } from '@shared/pipes/short-id.pipe';
import { CodeNamePipe } from '@shared/pipes/code-name.pipe';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

@Component({
    selector: 'app-admin-purchase-request-list',
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
        NgxFilterDaterangeComponent,
        ShareToGroupComponent,
        AppDatePipe,
        ShortIdPipe,
        CodeNamePipe,
        SearchByComponent,
        HasPermissionDirective
    ],
    templateUrl: './purchase-request-list.component.html',
    styleUrls: ['./purchase-request-list.component.css']
})
export class AdminPurchaseRequestListComponent implements OnInit {
    /** Loại bài khi chuyển tiếp vào nhóm ngành */
    readonly groupPostType = GroupPostType;

    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    // Data
    requests: PurchaseRequest[] = [];
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

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: 'pending', label: this._appService.trans('COMMON.STATUS.PENDING') },
            { key: 'contacted', label: this._appService.trans('COMMON.STATUS.CONTACTED') },
            { key: 'completed', label: this._appService.trans('COMMON.STATUS.COMPLETED') }
        ];

        // Tab "Đã xóa" chỉ hiện khi có quyền xem yêu cầu mua hàng đã xoá (P146) hoặc khôi phục (P147)
        // — đúng cặp mã [HasPermission(ViewRestorePurchaseRequest, RestorePurchaseRequest)] của API.
        if (this._appService.permissionService.has([
            Permission.ViewRestorePurchaseRequest,
            Permission.RestorePurchaseRequest
        ])) {
            this.tabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') });
        }
    }

    /** Các cột tìm kiếm dùng chung (RequestSearchField) khớp tham số searchField của API. */
    private buildSearchFieldOptions(): void {
        const t = (key: string) => this._appService.trans(key);
        this.searchFieldOptions = requestSearchFields(t);
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        const isDeleted = this.activeTab === 'deleted';

        let status: PurchaseRequestStatus | undefined;
        if (!isDeleted && this.activeTab !== 'all') {
            switch (this.activeTab) {
                case 'pending': status = PurchaseRequestStatus.PENDING; break;
                case 'contacted': status = PurchaseRequestStatus.CONTACTED; break;
                case 'completed': status = PurchaseRequestStatus.COMPLETED; break;
            }
        }

        this._appService.purchaseRequest
            .getData(
                this.pageNumber,
                this.pageSize,
                this.searchText,
                status,
                this.fromDate ?? undefined,
                this.toDate ?? undefined,
                undefined,
                this.searchField ?? undefined,
                isDeleted ? true : undefined
            )
            .subscribe({
                next: (response: PagedResponse<PurchaseRequest>) => {
                    this.requests = response.data;
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
                    this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                }
            });
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

    /** Xóa mềm một yêu cầu sau khi xác nhận. */
    onDelete(request: PurchaseRequest): void {
        this._appService.confirmDelete(
            this._appService.trans('ADMIN.PURCHASE_REQUESTS.DELETE_CONFIRM', { name: request.productName })
        ).then(confirmed => {
            if (!confirmed) return;

            this.isDeleting = true;
            this._appService.purchaseRequest.delete(request.id).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.PURCHASE_REQUESTS.DELETED_SUCCESS'));
                    this.loadData();
                },
                error: () => {
                    this.isDeleting = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }

    /** Khôi phục một yêu cầu đã xóa mềm. */
    onRestore(request: PurchaseRequest): void {
        this.isRestoring = true;
        this._appService.purchaseRequest.restore(request.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PURCHASE_REQUESTS.RESTORED_SUCCESS'));
                this.loadData();
            },
            error: () => {
                this.isRestoring = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    getStatusVariant(status: PurchaseRequestStatus): BadgeVariant {
        const variants: Record<PurchaseRequestStatus, BadgeVariant> = {
            [PurchaseRequestStatus.PENDING]: 'warning',
            [PurchaseRequestStatus.CONTACTED]: 'info',
            [PurchaseRequestStatus.COMPLETED]: 'success'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: PurchaseRequestStatus): string {
        const keys: Record<PurchaseRequestStatus, string> = {
            [PurchaseRequestStatus.PENDING]: 'pending',
            [PurchaseRequestStatus.CONTACTED]: 'contacted',
            [PurchaseRequestStatus.COMPLETED]: 'completed'
        };
        return keys[status] || 'pending';
    }

    navigateToDetail(id: string): void {
        this._router.navigate(['/admin/purchase-requests', id]);
    }
}