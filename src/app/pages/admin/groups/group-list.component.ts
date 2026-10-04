import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { BusinessGroup, BusinessGroupType, CreateBusinessGroupRequest, GroupApprovalStatus } from '@core/models/business-group.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabItem, StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

/** Quản lý nhóm theo lĩnh vực kinh doanh (admin) */
@Component({
    selector: 'app-admin-group-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ButtonComponent,
        InputComponent, LoadingComponent, ModalComponent, PaginationComponent, StatusTabsComponent,
        NgSelectWrapperComponent],
    templateUrl: './group-list.component.html',
})
export class AdminGroupListComponent implements OnInit {
    groups: BusinessGroup[] = [];
    isLoading = false;

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
        this.buildSearchFieldOptions();
        this.load();
    }

    /**
     * Các cột tìm kiếm khớp tham số searchField của API; giá trị '' = tất cả.
     * Các cột đúng bằng trường màn danh sách nhóm đang tìm (tên, lĩnh vực, mô tả).
     */
    private buildSearchFieldOptions(): void {
        const t = (key: string) => this._appService.trans(key);
        this.searchFieldOptions = [
            { value: '', label: t('COMMON.SEARCH_FIELD.ALL') },
            { value: 'name', label: t('COMMON.SEARCH_FIELD.GROUP_NAME') },
            { value: 'businessFieldName', label: t('COMMON.SEARCH_FIELD.GROUP_BUSINESS_FIELD') },
            { value: 'description', label: t('COMMON.SEARCH_FIELD.GROUP_DESCRIPTION') }
        ];
    }

    onSearchFieldChange(): void {
        this.load(1);
    }

    load(page = this.page): void {
        this.page = page;
        this.isLoading = true;

        this._appService.businessGroupService.getAdminList({
            page: this.page,
            pageSize: this.pageSize,
            search: this.searchText,
            type: this.typeFilter === 'industry' ? BusinessGroupType.Industry
                : this.typeFilter === 'community' || this.typeFilter === 'clubPending' ? BusinessGroupType.Community
                : null,
            approvalStatus: this.typeFilter === 'clubPending' ? GroupApprovalStatus.Pending : null,
            isActive: this.activeTab === 'all' ? null : this.activeTab === 'active',
            hasPendingMembers: this.onlyPending,
            hasPrivateRequests: this.onlyPrivate,
            searchField: this.searchField ?? undefined
        }).subscribe({
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

            this._appService.businessGroupService.remove(group.id).subscribe({
                next: () => {
                    this._appService.showSuccess(this._appService.trans('ADMIN.GROUPS.DELETE_SUCCESS'));
                    this.load();
                },
                error: (error: unknown) => this._appService.showError(this._appService.extractErrorMessage(error))
            });
        });
    }

    viewDetail(group: BusinessGroup): void {
        this.router.navigate(['/admin/groups', group.id]);
    }
}
