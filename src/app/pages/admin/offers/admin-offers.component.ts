import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { requestSearchFields } from '@core/constants/search-fields';
import { OfferRequest, OfferStatus } from '@core/models/offer-request.model';
import { Permission } from '@core/models/permission.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { ShortIdPipe } from '@shared/pipes/short-id.pipe';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { CodeListComponent } from '@shared/components/code-list/code-list.component';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';

@Component({
    selector: 'app-admin-offers',
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
        ShortIdPipe,
        SearchByComponent,
        HasPermissionDirective
    ],
    templateUrl: './admin-offers.component.html',
    styleUrls: ['./admin-offers.component.css']
})
export class AdminOffersComponent implements OnInit {
    /** Các dòng đang tick ở tab "Đã xoá" — dùng cho xoá vĩnh viễn theo lựa chọn. */
    selectedIds: string[] = [];

    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    offers: OfferRequest[] = [];
    isLoading = true;
    isDeleting = false;
    isRestoring = false;

    searchText = '';
    fromDate: string | null = null;
    toDate: string | null = null;

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: { value: string; label: string }[] = [];

    activeTab = 'all';
    tabs: { key: string; label: string }[] = [];

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
            { key: 'approved', label: this._appService.trans('COMMON.STATUS.APPROVED') },
            { key: 'rejected', label: this._appService.trans('COMMON.STATUS.REJECTED') },
            { key: 'expired', label: this._appService.trans('COMMON.STATUS.EXPIRED') }
        ];

        // Tab "Đã xóa" hiện khi có quyền xem offer đã xoá (P133), khôi phục (P119) hoặc xoá (P065)
        // — đúng cặp mã [HasPermission(ViewRestoreOfferRequest, RestoreOfferRequest, DeleteOfferRequest)] của API.
        if (this._appService.permissionService.has([Permission.ViewRestoreOfferRequest, Permission.RestoreOfferRequest, Permission.DeleteOfferRequest])) {
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

        let status: OfferStatus | undefined;
        if (!isDeleted && this.activeTab !== 'all') {
            switch (this.activeTab) {
                case 'pending': status = OfferStatus.PENDING; break;
                case 'approved': status = OfferStatus.APPROVED; break;
                case 'rejected': status = OfferStatus.REJECTED; break;
                case 'expired': status = OfferStatus.EXPIRED; break;
            }
        }

        this._appService.offerRequest
            .getData(
                this.pageNumber,
                this.pageSize,
                this.searchText,
                status,
                undefined,
                isDeleted ? true : undefined,
                this.fromDate ?? undefined,
                this.toDate ?? undefined,
                undefined,
                this.searchField ?? undefined
            )
            .subscribe({
                next: (response: PagedResponse<OfferRequest>) => {
                    this.offers = response.data;
                    this.pageNumber = response.pageNumber;
                    // Chỉ nhận pageSize hợp lệ (backend yêu cầu 1-100)
                    if (response.pageSize >= 1 && response.pageSize <= 100) {
                        this.pageSize = response.pageSize;
                    }
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
        if (!size || size < 1) size = 10;
        this.pageSize = size;
        this.pageNumber = 1;
        this.loadData();
    }

    onDelete(offer: OfferRequest): void {
        this._appService.confirmDelete(
            this._appService.trans('ADMIN.OFFERS.DELETE_CONFIRM', { name: offer.productName })
        ).then(confirmed => {
            if (!confirmed) return;

            this.isDeleting = true;
            this._appService.offerRequest.delete(offer.id).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.OFFERS.DELETED_SUCCESS'));
                    this.loadData();
                },
                error: () => {
                    this.isDeleting = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }

    onRestore(offer: OfferRequest): void {
        this.isRestoring = true;
        this._appService.offerRequest.restore(offer.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.OFFERS.RESTORED_SUCCESS'));
                this.loadData();
            },
            error: () => {
                this.isRestoring = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    getStatusVariant(status: OfferStatus): BadgeVariant {
        const variants: Record<OfferStatus, BadgeVariant> = {
            [OfferStatus.PENDING]: 'warning',
            [OfferStatus.APPROVED]: 'success',
            [OfferStatus.REJECTED]: 'danger',
            [OfferStatus.EXPIRED]: 'secondary'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: OfferStatus): string {
        const keys: Record<OfferStatus, string> = {
            [OfferStatus.PENDING]: 'pending',
            [OfferStatus.APPROVED]: 'approved',
            [OfferStatus.REJECTED]: 'rejected',
            [OfferStatus.EXPIRED]: 'expired'
        };
        return keys[status] || 'pending';
    }

    navigateToDetail(id: string): void {
        this._router.navigate(['/admin/offers', id]);
    }

    /** Sau khi xoá vĩnh viễn: nạp lại danh sách của tab 'Đã xoá'. */
    onPurged(): void {
        this.loadData();
    }
}