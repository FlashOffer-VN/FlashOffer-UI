// src/app/pages/admin/group-buying/group-buying-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { GroupBuyingRequest, GroupBuyingStatus } from '@core/models/group-buying-request.model';
import { Permission } from '@core/models/permission.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';

import { GroupPostType } from '@core/models/business-group.model';
import { ShareToGroupComponent } from '@shared/components/share-to-group/share-to-group.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { ShortIdPipe } from '@shared/pipes/short-id.pipe';
import { CodeNamePipe } from '@shared/pipes/code-name.pipe';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';

@Component({
    selector: 'app-admin-group-buying-list',
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
        ShareToGroupComponent,
        AppDatePipe,
        AppPricePipe,
        ShortIdPipe,
        CodeNamePipe,
        NgSelectWrapperComponent,
        HasPermissionDirective
    ],
    templateUrl: './group-buying-list.component.html',
    styleUrls: ['./group-buying-list.component.css']
})
export class AdminGroupBuyingListComponent implements OnInit {
    /** Loại bài khi chuyển tiếp vào nhóm ngành */
    readonly groupPostType = GroupPostType;

    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    requests: GroupBuyingRequest[] = [];
    isLoading = true;
    isDeleting = false;
    isRestoring = false;

    searchText = '';

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
            { key: 'pending', label: this._appService.trans('GROUP_BUYING.STATUS.PENDING') },
            { key: 'active', label: this._appService.trans('GROUP_BUYING.STATUS.ACTIVE') },
            { key: 'completed', label: this._appService.trans('GROUP_BUYING.STATUS.COMPLETED') },
            { key: 'cancelled', label: this._appService.trans('GROUP_BUYING.STATUS.CANCELLED') }
        ];

        // Tab "Đã xóa" hiện khi có quyền xem yêu cầu mua chung đã xoá (P135), khôi phục (P136)
        // hoặc xem danh sách (P066) — đúng cặp mã [HasPermission(ViewRestoreGroupBuyingRequest,
        // RestoreGroupBuyingRequest, ViewGroupBuyingRequests)] của API cho endpoint danh sách đã xoá.
        if (this._appService.permissionService.has([Permission.ViewRestoreGroupBuyingRequest, Permission.RestoreGroupBuyingRequest, Permission.ViewGroupBuyingRequests])) {
            this.tabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') });
        }
    }

    /**
     * Các cột tìm kiếm khớp tham số searchField của API; giá trị '' = tất cả.
     * Các cột đúng bằng trường màn mua chung đang tìm (mã yêu cầu, tên sản phẩm,
     * người mở nhóm, mã người giới thiệu bản ghi).
     */
    private buildSearchFieldOptions(): void {
        const t = (key: string) => this._appService.trans(key);
        this.searchFieldOptions = [
            { value: '', label: t('COMMON.SEARCH_FIELD.ALL') },
            { value: 'productName', label: t('COMMON.SEARCH_FIELD.PRODUCT_NAME') },
            { value: 'code', label: t('COMMON.SEARCH_FIELD.CODE') },
            { value: 'recordReferrerCode', label: t('COMMON.SEARCH_FIELD.RECORD_REFERRER') },
            { value: 'customerName', label: t('COMMON.SEARCH_FIELD.CREATOR_NAME') },
            { value: 'customerPhone', label: t('COMMON.SEARCH_FIELD.CREATOR_PHONE') }
        ];
    }

    onSearchFieldChange(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        const isDeleted = this.activeTab === 'deleted';
        this._appService.groupBuyingRequest.getData({
            page: this.pageNumber,
            pageSize: this.pageSize,
            search: this.searchText,
            status: (this.activeTab === 'all' || isDeleted) ? undefined : this.activeTab,
            searchField: this.searchField ?? undefined,
            includeDeleted: isDeleted ? true : undefined
        }).subscribe({
            next: (response: PagedResponse<GroupBuyingRequest>) => {
                this.requests = response?.data ?? [];
                this.pageNumber = response?.pageNumber ?? this.pageNumber;
                this.pageSize = response?.pageSize ?? this.pageSize;
                this.totalCount = response?.totalCount ?? 0;
                this.totalPages = response?.totalPages ?? 0;
                this.hasPreviousPage = response?.hasPreviousPage ?? false;
                this.hasNextPage = response?.hasNextPage ?? false;
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this._appService.showError(error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
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

    /** Xóa mềm một yêu cầu mua chung sau khi xác nhận. */
    onDelete(request: GroupBuyingRequest): void {
        this._appService.confirmDelete(
            this._appService.trans('ADMIN.GROUP_BUYING.DELETE_CONFIRM', { name: request.productName })
        ).then(confirmed => {
            if (!confirmed) return;

            this.isDeleting = true;
            this._appService.groupBuyingRequest.delete(request.id).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.GROUP_BUYING.DELETED_SUCCESS'));
                    this.loadData();
                },
                error: () => {
                    this.isDeleting = false;
                    this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }

    /** Khôi phục một yêu cầu mua chung đã xóa mềm. */
    onRestore(request: GroupBuyingRequest): void {
        this.isRestoring = true;
        this._appService.groupBuyingRequest.restore(request.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.GROUP_BUYING.RESTORED_SUCCESS'));
                this.loadData();
            },
            error: () => {
                this.isRestoring = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    getStatusVariant(status: GroupBuyingStatus): BadgeVariant {
        const variants: Record<number, BadgeVariant> = {
            [GroupBuyingStatus.PENDING]: 'warning',
            [GroupBuyingStatus.ACTIVE]: 'info',
            [GroupBuyingStatus.COMPLETED]: 'success',
            [GroupBuyingStatus.CANCELLED]: 'danger'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: GroupBuyingStatus): string {
        const keys: Record<number, string> = {
            [GroupBuyingStatus.PENDING]: 'GROUP_BUYING.STATUS.PENDING',
            [GroupBuyingStatus.ACTIVE]: 'GROUP_BUYING.STATUS.ACTIVE',
            [GroupBuyingStatus.COMPLETED]: 'GROUP_BUYING.STATUS.COMPLETED',
            [GroupBuyingStatus.CANCELLED]: 'GROUP_BUYING.STATUS.CANCELLED'
        };
        return keys[status] || 'GROUP_BUYING.STATUS.PENDING';
    }

    navigateToDetail(id: string): void {
        this._router.navigate(['/admin/group-buying', id]);
    }
}
