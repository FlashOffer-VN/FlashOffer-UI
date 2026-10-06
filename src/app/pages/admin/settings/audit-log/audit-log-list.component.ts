import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { AuditLogService } from '@core/services/audit-log.service';
import {
    AuditLogEntry,
    AuditLogFilterOptions,
    AuditLogQuery,
    AuthAuditLogEntry,
    AuthAuditLogQuery
} from '@core/models/audit-log.model';
import { Permission } from '@core/models/permission.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';
import { formatDisplayDate } from '@shared/components/filter-daterange/date-range.util';
import { JsonViewerComponent } from '@shared/components/json-viewer/json-viewer.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';

import { DeleteScopeFailure, buildDeleteScope } from './audit-log-delete.util';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';

/**
 * Nhật ký hoạt động: nhật ký thao tác dữ liệu và nhật ký xác thực tài khoản (đăng nhập / đăng ký /
 * đổi mật khẩu...). Lọc theo khoảng ngày, hành động, đối tượng và từ khoá; bấm một dòng để xem chi
 * tiết dạng JSON in đẹp; có thể xoá nhật ký theo dòng được chọn hoặc theo khoảng ngày (quyền riêng).
 */
@Component({
    selector: 'app-admin-audit-log-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        LoadingComponent,
        PaginationComponent,
        StatusTabsComponent,
        NgxFilterDaterangeComponent,
        JsonViewerComponent,
        NgSelectWrapperComponent,
        ButtonComponent,
        InputComponent,
        CheckboxComponent
    ],
    templateUrl: './audit-log-list.component.html',
    styleUrls: ['./audit-log-list.component.css']
})
export class AdminAuditLogListComponent implements OnInit {
    /** Mã quyền dùng trong template (`*appHasPermission`). */
    readonly Permission = Permission;

    tabs: StatusTabItem[] = [];

    activeTab: 'entity' | 'auth' = 'entity';
    entityLogs: AuditLogEntry[] = [];
    authLogs: AuthAuditLogEntry[] = [];

    keyword = '';
    fromDate: string | null = null;
    toDate: string | null = null;
    actionFilter: string | null = null;
    entityFilter: string | null = null;
    /** Kết quả đăng nhập: 'success' | 'fail' (chỉ tab xác thực). */
    resultFilter: string | null = null;

    actionOptions: { value: string; label: string }[] = [];
    entityOptions: { value: string; label: string }[] = [];
    resultOptions: { value: string; label: string }[] = [];

    /** Id các dòng đang tick chọn để xoá. */
    selectedIds = new Set<string>();

    expandedId: string | null = null;
    isLoading = false;
    isDeleting = false;

    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    constructor(
        private readonly _appService: AppService,
        private readonly _auditLogService: AuditLogService
    ) { }

    ngOnInit(): void {
        this.tabs = [
            { key: 'entity', label: this._appService.trans('ADMIN.AUDIT_LOG.TAB_ENTITY'), icon: 'fa-solid fa-database' },
            { key: 'auth', label: this._appService.trans('ADMIN.AUDIT_LOG.TAB_AUTH'), icon: 'fa-solid fa-shield-halved' }
        ];
        this.resultOptions = [
            { value: 'success', label: this._appService.trans('ADMIN.AUDIT_LOG.SUCCESS') },
            { value: 'fail', label: this._appService.trans('ADMIN.AUDIT_LOG.FAILED') }
        ];
        this.buildActionOptions([]);
        this.loadFilterOptions();
        this.loadData();
    }

    // ===== Bộ lọc =====

    onTabChange(key: string): void {
        if (key === this.activeTab) return;
        this.activeTab = key === 'auth' ? 'auth' : 'entity';
        this.pageNumber = 1;
        this.expandedId = null;
        this.clearSelection();
        this.buildActionOptions(this.activeTab === 'entity' ? this.filterOptions.entityActions : this.filterOptions.authActions);
        this.loadData();
    }

    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
        this.pageNumber = 1;
        this.loadData();
    }

    onFilterChange(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onReset(): void {
        this.keyword = '';
        this.fromDate = null;
        this.toDate = null;
        this.actionFilter = null;
        this.entityFilter = null;
        this.resultFilter = null;
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

    /** Nhãn hành động theo ngôn ngữ đang dùng (API trả mã tiếng Anh: Create/Login...). */
    actionLabel(action: string): string {
        const key = `ADMIN.AUDIT_LOG.ACTION_LABEL.${this.actionKey(action)}`;
        const label = this._appService.trans(key);

        return label === key ? action : label;
    }

    // ===== Chi tiết =====

    /** Mở / đóng phần chi tiết của một dòng nhật ký. */
    toggleDetail(id: string): void {
        this.expandedId = this.expandedId === id ? null : id;
    }

    /** Ghép thông tin thiết bị để hiển thị gọn trong một cột. */
    deviceText(deviceType?: string, operatingSystem?: string, browserName?: string): string {
        const parts = [deviceType, operatingSystem, browserName].filter(part => !!part);
        return parts.length > 0 ? parts.join(' · ') : '—';
    }

    // ===== Chọn dòng để xoá =====

    get currentIds(): string[] {
        return this.activeTab === 'auth' ? this.authLogs.map(log => log.id) : this.entityLogs.map(log => log.id);
    }

    get allSelected(): boolean {
        return this.currentIds.length > 0 && this.currentIds.every(id => this.selectedIds.has(id));
    }

    get selectedCount(): number {
        return this.selectedIds.size;
    }

    /** Có quyền xoá nhật ký của tab đang xem hay không. */
    canDelete(): boolean {
        return this._appService.permissionService.has(
            this.activeTab === 'auth' ? Permission.DeleteAuthAuditLogs : Permission.DeleteEntityAuditLogs);
    }

    isSelected(id: string): boolean {
        return this.selectedIds.has(id);
    }

    toggleSelection(id: string, event?: Event): void {
        event?.stopPropagation();
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    toggleSelectAll(): void {
        if (this.allSelected) {
            this.clearSelection();
            return;
        }

        this.currentIds.forEach(id => this.selectedIds.add(id));
    }

    clearSelection(): void {
        this.selectedIds.clear();
    }

    // ===== Xoá =====

    /** Xoá các dòng đang tick chọn (hỏi xác nhận trước). */
    onDeleteSelected(): void {
        const scope = buildDeleteScope({ ids: [...this.selectedIds], fromDate: null, toDate: null });
        if (!scope.ok) {
            this.showScopeError(scope.reason);
            return;
        }

        this._appService.modal.confirm({
            title: this._appService.trans('ADMIN.AUDIT_LOG.DELETE_CONFIRM_TITLE'),
            message: this._appService.trans('ADMIN.AUDIT_LOG.DELETE_SELECTED_CONFIRM', { count: this.selectedCount }),
            confirmText: this._appService.trans('COMMON.BUTTON.DELETE'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL')
        }).then(confirmed => {
            if (confirmed) this.deleteLogs(scope.request);
        });
    }

    /** Xoá nhật ký trong khoảng ngày đang lọc (bắt buộc phải có khoảng ngày). */
    onDeleteByRange(): void {
        const scope = buildDeleteScope({ ids: [], fromDate: this.fromDate, toDate: this.toDate });
        if (!scope.ok) {
            this.showScopeError(scope.reason);
            return;
        }

        this._appService.modal.confirm({
            title: this._appService.trans('ADMIN.AUDIT_LOG.DELETE_CONFIRM_TITLE'),
            message: this._appService.trans('ADMIN.AUDIT_LOG.DELETE_RANGE_CONFIRM', { range: this.rangeText() }),
            confirmText: this._appService.trans('COMMON.BUTTON.DELETE'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL')
        }).then(confirmed => {
            if (confirmed) this.deleteLogs(scope.request);
        });
    }

    private deleteLogs(body: { ids?: string[]; fromDate?: string; toDate?: string }): void {
        this.isDeleting = true;
        const fullView = this._canViewFullLogs();
        const request = this.activeTab === 'auth'
            ? this._auditLogService.deleteAuthLogs(body, fullView)
            : this._auditLogService.deleteEntityLogs(body, fullView);

        request.subscribe({
            next: response => {
                this.isDeleting = false;
                this.clearSelection();
                this.expandedId = null;
                const deleted = response.data?.deletedCount ?? 0;
                this._appService.showSuccess(this._appService.trans('ADMIN.AUDIT_LOG.DELETE_SUCCESS', { count: deleted }));

                // Trang hiện tại có thể vượt quá tổng số trang sau khi xoá.
                if (this.pageNumber > 1) this.pageNumber = 1;
                this.loadData();
            },
            error: error => {
                this.isDeleting = false;
                this._appService.showError(error?.error?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    private showScopeError(reason: DeleteScopeFailure): void {
        const key = reason === 'noCriteria'
            ? 'ADMIN.AUDIT_LOG.DELETE_NEED_CRITERIA'
            : reason === 'invalidRange'
                ? 'ADMIN.AUDIT_LOG.DELETE_RANGE_INVALID'
                : 'ADMIN.AUDIT_LOG.DELETE_TOO_MANY';

        this._appService.showError(this._appService.trans(key));
    }

    private rangeText(): string {
        const from = this.fromDate ? formatDisplayDate(this.fromDate) : '…';
        const to = this.toDate ? formatDisplayDate(this.toDate) : '…';

        return `${from} → ${to}`;
    }

    // ===== Nạp dữ liệu =====

    /**
     * Có được xem toàn bộ nhật ký (kể cả hành động của tài khoản quản trị tối cao) hay không.
     * Không có quyền này thì màn chỉ đọc nhật ký thường — API tự ẩn hành động của quản trị tối cao.
     */
    private _canViewFullLogs(): boolean {
        return this._appService.permissionService.has(Permission.ViewFullAuditLogs);
    }

    loadFilterOptions(): void {
        this._auditLogService.getFilterOptions().subscribe({
            next: response => {
                this.filterOptions = response.data ?? { entityNames: [], entityActions: [], authActions: [] };
                this.entityOptions = this.filterOptions.entityNames.map(name => ({ value: name, label: name }));
                this.buildActionOptions(this.activeTab === 'entity'
                    ? this.filterOptions.entityActions
                    : this.filterOptions.authActions);
            },
            error: () => {
                // Thiếu danh mục lọc không chặn màn: người dùng vẫn gõ từ khoá để lọc.
                this.entityOptions = [];
            }
        });
    }

    loadData(): void {
        this.isLoading = true;

        const keyword = this.keyword.trim();
        // Chỉ gắn tham số khi thực sự có giá trị: HttpParams biến undefined/null thành chuỗi
        // "undefined"/"null" nên API báo lỗi dữ liệu không hợp lệ và danh sách luôn rỗng.
        const common: AuditLogQuery = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };
        if (this.fromDate) common.fromDate = this.fromDate;
        if (this.toDate) common.toDate = this.toDate;
        if (this.actionFilter) common.action = this.actionFilter;

        let request: Observable<PagedResponse<AuditLogEntry | AuthAuditLogEntry>>;
        if (this.activeTab === 'auth') {
            const query: AuthAuditLogQuery = { ...common };
            if (keyword) query.username = keyword;
            if (this.resultFilter) query.isSuccess = this.resultFilter === 'success';
            request = this._canViewFullLogs()
                ? this._auditLogService.getFullAuthLogs(query)
                : this._auditLogService.getAuthLogs(query);
        } else {
            const query: AuditLogQuery = { ...common };
            if (keyword) query.entityName = keyword;
            if (this.entityFilter) query.entityName = this.entityFilter;
            request = this._canViewFullLogs()
                ? this._auditLogService.getFullEntityLogs(query)
                : this._auditLogService.getEntityLogs(query);
        }

        request.subscribe({
            next: (response: PagedResponse<AuditLogEntry | AuthAuditLogEntry>) => {
                this.applyPagedResponse(response);
                this.pruneSelection();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.entityLogs = [];
                this.authLogs = [];
                this.totalCount = 0;
                this.totalPages = 0;
                this.hasPreviousPage = false;
                this.hasNextPage = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Bỏ khỏi lựa chọn những dòng không còn trên trang hiện tại (tránh xoá nhầm dòng đã đổi trang). */
    private pruneSelection(): void {
        const visible = new Set(this.currentIds);
        [...this.selectedIds].forEach(id => {
            if (!visible.has(id)) this.selectedIds.delete(id);
        });
    }

    private buildActionOptions(actions: string[]): void {
        this.actionOptions = actions.map(action => ({ value: action, label: this.actionLabel(action) }));
    }

    /** Khoá i18n của nhãn hành động: Login → LOGIN, RefreshToken → REFRESH_TOKEN. */
    private actionKey(action: string): string {
        return action.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    }

    private applyPagedResponse(response: PagedResponse<AuditLogEntry | AuthAuditLogEntry>): void {
        if (this.activeTab === 'auth') {
            this.authLogs = (response.data ?? []) as AuthAuditLogEntry[];
        } else {
            this.entityLogs = (response.data ?? []) as AuditLogEntry[];
        }
        this.pageNumber = response.pageNumber ?? this.pageNumber;
        this.pageSize = response.pageSize ?? this.pageSize;
        this.totalCount = response.totalCount ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.hasPreviousPage = response.hasPreviousPage ?? false;
        this.hasNextPage = response.hasNextPage ?? false;
    }

    /** Danh mục lọc (hành động + tên bảng) lấy từ API. */
    filterOptions: AuditLogFilterOptions = { entityNames: [], entityActions: [], authActions: [] };
}
