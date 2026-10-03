import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { AdminUser } from '@core/models/user.model';
import { PagedResponse } from '@core/models/paged-response.model';
import { userRoleLabelKey } from '@core/models/auth.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';

@Component({
    selector: 'app-admin-user-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        PaginationComponent,
        BadgeComponent,
        AppDatePipe
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class AdminUserListComponent implements OnInit {
    users: AdminUser[] = [];
    isLoading = true;
    resettingId: string | null = null;

    // Search
    searchText = '';

    // Pagination
    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;

        this._appService.userService.getData(this.pageNumber, this.pageSize, this.searchText)
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

    /** Nhãn vai trò — API trả dạng chữ, dữ liệu cũ dạng số. */
    roleKey(role: unknown): string {
        return userRoleLabelKey(role);
    }

    /** Tài khoản quản trị không cấp lại mật khẩu theo cách này (khớp ràng buộc của API). */
    canResetPassword(user: AdminUser): boolean {
        return !!user.phone && !this.isAdmin(user);
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
        return userRoleLabelKey(user.role) === 'USER_ROLE.ADMIN';
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
