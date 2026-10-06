import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { businessGroupSearchFields } from '@core/constants/search-fields';
import { BusinessGroup, BusinessGroupType, CreateBusinessGroupRequest, GroupApprovalStatus } from '@core/models/business-group.model';
import { Permission } from '@core/models/permission.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabItem, StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { HasPermissionDirective } from '@shared/directives/has-permission.directive';
import { PurgeBarComponent } from '@shared/components/purge-bar/purge-bar.component';

/** Quản lý nhóm theo lĩnh vực kinh doanh (admin) */
@Component({
    selector: 'app-admin-group-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ButtonComponent,
        InputComponent, LoadingComponent, ModalComponent, PaginationComponent, StatusTabsComponent,
        SearchByComponent, HasPermissionDirective, PurgeBarComponent],
    templateUrl: './group-list.component.html',
})
export class AdminGroupListComponent implements OnInit {
    /** Các dòng đang tick ở tab "Đã xoá" — dùng cho xoá vĩnh viễn theo lựa chọn. */
    selectedIds: string[] = [];

    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    groups: BusinessGroup[] = [];
    isLoading = false;
    isDeleting = false;
    isRestoring = false;

    searchText = '';

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: { value: string; label: string }[] = [];

    activeTab = 'all';
    onlyPending = false;
    onlyPrivate = false;
    statusTabs: StatusTabItem[] = [];

    /** Lọc theo loại: nhóm ngành / hội nhóm / hội nhóm chờ duyệt */
    typeFilter = 'all';
    typeTabs: StatusTabItem[] = [];

    page = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 1;

    formVisible = false;
    isSaving = false;
    editingId: string | null = null;
    form: FormGroup;

    constructor(
        private readonly fb: FormBuilder,
        private readonly _appService: AppService,
        private readonly router: Router
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
            description: ['', [Validators.maxLength(1000)]],
            businessFieldName: ['', [Validators.maxLength(200)]],
            coverImageUrl: ['', [Validators.maxLength(500)]],
            requiresApproval: [true],
            isActive: [true]
        });
    }

    ngOnInit(): void {
        this.typeTabs = [
            { key: 'all', label: this._appService.trans('ADMIN.GROUPS.TAB_ALL') },
            { key: 'industry', label: this._appService.trans('ADMIN.CLUBS.TAB_INDUSTRY') },
            { key: 'community', label: this._appService.trans('ADMIN.CLUBS.TAB_COMMUNITY') },
            { key: 'clubPending', label: this._appService.trans('ADMIN.CLUBS.TAB_CLUB_PENDING') }
        ];
        this.statusTabs = [
            { key: 'all', label: this._appService.trans('ADMIN.GROUPS.TAB_ALL') },
            { key: 'active', label: this._appService.trans('ADMIN.GROUPS.TAB_ACTIVE') },
            { key: 'inactive', label: this._appService.trans('ADMIN.GROUPS.TAB_INACTIVE') }
        ];

        // Tab "Đã xóa" hiện khi có quyền xem nhóm đã xoá (P137), khôi phục (P138) hoặc xem danh sách (P070)
        // — đúng cặp mã [HasPermission(ViewRestoreGroup, RestoreGroup, ViewGroups)] của API.
        if (this._appService.permissionService.has([Permission.ViewRestoreGroup, Permission.RestoreGroup, Permission.ViewGroups])) {
            this.statusTabs.push({ key: 'deleted', label: this._appService.trans('COMMON.STATUS.DELETED') });
        }
        this.buildSearchFieldOptions();
        this.load();
    }

    /** Các cột tìm kiếm dùng chung (BusinessGroupSearchField) khớp tham số searchField của API. */
    private buildSearchFieldOptions(): void {
        const t = (key: string) => this._appService.trans(key);
        this.searchFieldOptions = businessGroupSearchFields(t);
    }

    load(page = this.page): void {
        this.page = page;
        this.isLoading = true;

        const isDeleted = this.activeTab === 'deleted';
        const query = {
            page: this.page,
            pageSize: this.pageSize,
            search: this.searchText,
            type: this.typeFilter === 'industry' ? BusinessGroupType.Industry
                : this.typeFilter === 'community' || this.typeFilter === 'clubPending' ? BusinessGroupType.Community
                : null,
            approvalStatus: this.typeFilter === 'clubPending' ? GroupApprovalStatus.Pending : null,
            isActive: isDeleted || this.activeTab === 'all' ? null : this.activeTab === 'active',
            hasPendingMembers: this.onlyPending,
            hasPrivateRequests: this.onlyPrivate,
            searchField: this.searchField ?? undefined
        };

        const request = isDeleted
            ? this._appService.businessGroupService.getDeletedList(query)
            : this._appService.businessGroupService.getAdminList(query);

        request.subscribe({
            next: (response) => {
                this.isLoading = false;
                this.groups = response?.data ?? [];
                this.totalCount = response?.totalCount ?? 0;
                this.totalPages = response?.totalPages ?? 1;
            },
            error: (error: unknown) => {
                this.isLoading = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    onSearch(): void {
        this.load(1);
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        // Cả hàng lọc chỉ giữ một lựa chọn: chọn tab trạng thái thì bỏ hai nút lọc cờ.
        this.onlyPending = false;
        this.onlyPrivate = false;
        this.load(1);
    }

    onTypeTabChange(tab: string): void {
        this.typeFilter = tab;
        this.load(1);
    }

    /** Bật "có yêu cầu chờ duyệt": tắt nút lọc còn lại và đưa trạng thái về Tất cả. */
    togglePending(): void {
        const next = !this.onlyPending;
        this.onlyPending = next;
        this.onlyPrivate = false;
        if (next) {
            this.activeTab = 'all';
        }
        this.load(1);
    }

    /** Bật "có yêu cầu kín": tắt nút lọc còn lại và đưa trạng thái về Tất cả. */
    togglePrivate(): void {
        const next = !this.onlyPrivate;
        this.onlyPrivate = next;
        this.onlyPending = false;
        if (next) {
            this.activeTab = 'all';
        }
        this.load(1);
    }

    onPageChange(page: number): void {
        this.load(page);
    }

    openCreate(): void {
        this.editingId = null;
        this.form.reset({ requiresApproval: true, isActive: true });
        this.formVisible = true;
    }

    openEdit(group: BusinessGroup): void {
        this.editingId = group.id;
        this.form.reset({
            name: group.name,
            description: group.description ?? '',
            businessFieldName: group.businessFieldName ?? '',
            coverImageUrl: group.coverImageUrl ?? '',
            requiresApproval: group.requiresApproval,
            isActive: group.isActive
        });
        this.formVisible = true;
    }

    onSave(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const payload: CreateBusinessGroupRequest = {
            name: this.form.value.name,
            description: this.form.value.description || undefined,
            businessFieldName: this.form.value.businessFieldName || undefined,
            coverImageUrl: this.form.value.coverImageUrl || undefined,
            requiresApproval: this.form.value.requiresApproval === true,
            isActive: this.form.value.isActive === true
        };

        this.isSaving = true;
        const request = this.editingId
            ? this._appService.businessGroupService.update(this.editingId, payload)
            : this._appService.businessGroupService.create(payload);

        request.subscribe({
            next: (response) => {
                this.isSaving = false;
                this.formVisible = false;
                this._appService.showSuccess(response?.message || this._appService.trans('ADMIN.GROUPS.SAVE_SUCCESS'));
                this.load(this.editingId ? this.page : 1);
            },
            error: (error: unknown) => {
                this.isSaving = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    remove(group: BusinessGroup): void {
        this._appService.confirmDelete(this._appService.trans('ADMIN.GROUPS.CONFIRM_DELETE_MESSAGE')).then((confirmed) => {
            if (!confirmed) return;

            this.isDeleting = true;
            this._appService.businessGroupService.remove(group.id).subscribe({
                next: () => {
                    this.isDeleting = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.GROUPS.DELETE_SUCCESS'));
                    this.load();
                },
                error: (error: unknown) => {
                    this.isDeleting = false;
                    this._appService.showError(this._appService.extractErrorMessage(error));
                }
            });
        });
    }

    /** Khôi phục nhóm đã xoá mềm (tab "Đã xóa"). */
    restore(group: BusinessGroup): void {
        this.isRestoring = true;
        this._appService.businessGroupService.restore(group.id).subscribe({
            next: () => {
                this.isRestoring = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.GROUPS.RESTORE_SUCCESS'));
                this.load();
            },
            error: (error: unknown) => {
                this.isRestoring = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    viewDetail(group: BusinessGroup): void {
        this.router.navigate(['/admin/groups', group.id]);
    }

    /** Sau khi xoá vĩnh viễn: nạp lại danh sách của tab 'Đã xoá'. */
    onPurged(): void {
        this.load();
    }
}
