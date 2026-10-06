import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { userSearchFields } from '@core/constants/search-fields';
import { AdminUser, UserAccountScope } from '@core/models/user.model';
import { Permission } from '@core/models/permission.model';
import { PagedResponse } from '@core/models/paged-response.model';
import { isAdminRole, userRoleLabelKey } from '@core/models/auth.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { CodeListComponent } from '@shared/components/code-list/code-list.component';
import { AdminUserFormComponent } from './user-form-modal.component';

/**
 * Quản lý người dùng: tách tab tài khoản thường / tài khoản quản trị, tạo tài khoản quản trị và sửa
 * thông tin tập trung (kèm hồ sơ CTV/đối tác liên kết). Mọi thao tác đều theo quyền riêng.
 */
@Component({
    selector: 'app-admin-user-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        CodeListComponent,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        PaginationComponent,
        BadgeComponent,
        StatusTabsComponent,
        AppDatePipe,
        SearchByComponent,
        AdminUserFormComponent
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class AdminUserListComponent implements OnInit {
    /** Mã quyền dùng trong template. */
    readonly Permission = Permission;

    tabs: StatusTabItem[] = [];
    activeScope: UserAccountScope = 'Customer';

    users: AdminUser[] = [];
    isLoading = true;
    resettingId: string | null = null;

    // Search
    searchText = '';

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: { value: string; label: string }[] = [];

    // Form tạo / sửa tài khoản
    formVisible = false;
    formUserId: string | null = null;

    // Pagination
    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        this.tabs = [
            { key: 'Customer', label: this._appService.trans('ADMIN.USERS.TAB_CUSTOMER'), icon: 'fa-solid fa-user' },
            { key: 'Admin', label: this._appService.trans('ADMIN.USERS.TAB_ADMIN'), icon: 'fa-solid fa-user-shield' }
        ];
        this.buildSearchFieldOptions();
        this.loadData();
    }

    // ===== Quyền =====

    /** Tạo tài khoản quản trị (P156). */
    canCreateAdmin(): boolean {
        return this._appService.permissionService.has(Permission.CreateAdminAccount);
    }

    /** Sửa thông tin tài khoản (P155). */
    canEdit(): boolean {
        return this._appService.permissionService.has(Permission.UpdateUserInfo);
    }

    /** Cấp lại mật khẩu: cần quyền + tài khoản phải có SĐT và không phải tài khoản quản trị. */
    canResetPassword(user: AdminUser): boolean {
        return this._appService.permissionService.has(Permission.ResetUserPassword)
            && !!user.phone
            && !this.isAdmin(user);
    }

    // ===== Tab =====

    onTabChange(key: string): void {
        if (key === this.activeScope) return;
        this.activeScope = key === 'Admin' ? 'Admin' : 'Customer';
        this.pageNumber = 1;
        this.loadData();
    }

    /** Các cột tìm kiếm dùng chung (UserSearchField) khớp tham số searchField của API. */
    private buildSearchFieldOptions(): void {
        this.searchFieldOptions = userSearchFields((key: string) => this._appService.trans(key));
    }

    loadData(): void {
        this.isLoading = true;

        this._appService.userService
            .getData(this.pageNumber, this.pageSize, this.searchText, this.searchField ?? undefined, this.activeScope)
            .subscribe({
                next: (response: PagedResponse<AdminUser>) => {
                    this.applyPagedResponse(response);
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

    onPageChange(pageNumber: number): void {
        this.pageNumber = pageNumber;
        this.loadData();
    }

    onPageSizeChange(pageSize: number): void {
        this.pageSize = pageSize;
        this.pageNumber = 1;
        this.loadData();
    }

    // ===== Tạo / sửa =====

    openCreate(): void {
        this.formUserId = null;
        this.formVisible = true;
    }

    openEdit(user: AdminUser): void {
        this.formUserId = user.id;
        this.formVisible = true;
    }

    onFormVisibilityChange(visible: boolean): void {
        this.formVisible = visible;
    }

    onSaved(): void {
        this.loadData();
    }

    /** Nhãn vai trò — API trả dạng chữ, dữ liệu cũ dạng số. */
    roleKey(role: unknown): string {
        return userRoleLabelKey(role);
    }

    /** Cấp lại mật khẩu về số điện thoại cho người dùng quên mật khẩu — có xác nhận trước khi đổi. */
    onResetPassword(user: AdminUser): void {
        this._appService.modal.confirm({
            title: this._appService.trans('ADMIN.USERS.RESET_CONFIRM_TITLE'),
            message: `${user.fullName || user.username} (${user.phone}) - ${this._appService.trans('ADMIN.USERS.RESET_CONFIRM_MESSAGE')}`,
            confirmText: this._appService.trans('ADMIN.USERS.RESET_PASSWORD'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL')
        }).then(confirmed => {
            if (!confirmed) {
                return;
            }

            this.resettingId = user.id;

            this._appService.userService.resetPassword(user.id)
                .subscribe({
                    next: () => {
                        this.resettingId = null;
                        this._appService.showSuccess(`${this._appService.trans('ADMIN.USERS.RESET_SUCCESS')} ${user.phone}`);
                        this.loadData();
                    },
                    error: (error) => {
                        this.resettingId = null;
                        this._appService.showError(error?.error?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                    }
                });
        });
    }

    private isAdmin(user: AdminUser): boolean {
        return isAdminRole(user.role);
    }

    private applyPagedResponse(response: PagedResponse<AdminUser>): void {
        this.users = response.data;
        this.pageNumber = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.hasPreviousPage = response.hasPreviousPage;
        this.hasNextPage = response.hasNextPage;
    }
}
