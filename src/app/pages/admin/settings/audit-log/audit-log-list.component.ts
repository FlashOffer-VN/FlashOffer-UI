import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { AuditLogService } from '@core/services/audit-log.service';
import { AuditLogEntry, AuthAuditLogEntry } from '@core/models/audit-log.model';
import { PagedResponse } from '@core/models/paged-response.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';

/**
 * Nhật ký hoạt động đầy đủ: nhật ký thao tác dữ liệu và nhật ký đăng nhập, lọc theo khoảng thời gian
 * và từ khoá, có phân trang. Bấm vào một dòng để xem chi tiết giá trị trước / sau của bản ghi.
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
        ButtonComponent,
        InputComponent
    ],
    template: `
        <div class="space-y-4">
            <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)">
            </app-status-tabs>

            <!-- Bộ lọc -->
            <div class="flex flex-wrap items-end gap-3 bg-white p-3 rounded-lg border border-gray-200">
                <ngx-filter-daterange [from]="fromDate" [to]="toDate" (rangeChange)="onRangeChange($event)">
                </ngx-filter-daterange>

                <div class="w-64">
                    <app-input [(ngModel)]="keyword" (keyup.enter)="loadData()" [id]="'audit_log_keyword'"
                        [placeholder]="(activeTab === 'auth' ? 'ADMIN.AUDIT_LOG.SEARCH_USERNAME' : 'ADMIN.AUDIT_LOG.SEARCH_ENTITY') | translate">
                    </app-input>
                </div>

                <app-button variant="primary" [loading]="isLoading" (click)="onSearch()">
                    <i class="fa-solid fa-magnifying-glass mr-1"></i>{{ 'ADMIN.AUDIT_LOG.SEARCH' | translate }}
                </app-button>
                <app-button variant="outline" (click)="onReset()">
                    <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'ADMIN.AUDIT_LOG.RESET' | translate }}
                </app-button>

                <span class="ml-auto h-10 flex items-center text-sm text-gray-500">
                    {{ 'ADMIN.AUDIT_LOG.TOTAL' | translate }}: <strong>{{ totalCount }}</strong>
                </span>
            </div>

            <!-- Bảng nhật ký -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div class="overflow-x-auto">
                    @if (activeTab === 'entity') {
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.TIME' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.ACTOR' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.ENTITY' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.ACTION' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.IP' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.DEVICE' | translate }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                @if (isLoading) {
                                    <tr><td colspan="6" class="px-4 py-10"><app-loading></app-loading></td></tr>
                                } @else if (entityLogs.length === 0) {
                                    <tr><td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">{{ 'ADMIN.AUDIT_LOG.EMPTY' | translate }}</td></tr>
                                } @else {
                                    @for (log of entityLogs; track log.id) {
                                        <tr class="hover:bg-gray-50 cursor-pointer" (click)="toggleDetail(log.id)">
                                            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ log.actorName || log.actorId || '—' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-700">{{ log.entityName }}</td>
                                            <td class="px-4 py-3 text-sm">
                                                <span class="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{{ log.action }}</span>
                                            </td>
                                            <td class="px-4 py-3 text-sm text-gray-500">{{ log.ipAddress || '—' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-500">{{ deviceText(log.deviceType, log.operatingSystem, log.browserName) }}</td>
                                        </tr>
                                        @if (expandedId === log.id) {
                                            <tr class="bg-gray-50">
                                                <td colspan="6" class="px-4 py-4">
                                                    <div class="grid gap-3 md:grid-cols-2">
                                                        <div>
                                                            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ 'ADMIN.AUDIT_LOG.CHANGED_PROPERTIES' | translate }}</p>
                                                            <pre class="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap">{{ log.changedProperties || '—' }}</pre>
                                                        </div>
                                                        <div>
                                                            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ 'ADMIN.AUDIT_LOG.ENTITY_ID' | translate }}</p>
                                                            <pre class="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap">{{ log.entityId }}</pre>
                                                        </div>
                                                        <div>
                                                            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ 'ADMIN.AUDIT_LOG.OLD_VALUES' | translate }}</p>
                                                            <pre class="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-56">{{ log.oldValues || '—' }}</pre>
                                                        </div>
                                                        <div>
                                                            <p class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ 'ADMIN.AUDIT_LOG.NEW_VALUES' | translate }}</p>
                                                            <pre class="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-56">{{ log.newValues || '—' }}</pre>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        }
                                    }
                                }
                            </tbody>
                        </table>
                    } @else {
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.TIME' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.USERNAME' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.ACTION' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.RESULT' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.IP' | translate }}</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'ADMIN.AUDIT_LOG.DEVICE' | translate }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                @if (isLoading) {
                                    <tr><td colspan="6" class="px-4 py-10"><app-loading></app-loading></td></tr>
                                } @else if (authLogs.length === 0) {
                                    <tr><td colspan="6" class="px-4 py-10 text-center text-sm text-gray-500">{{ 'ADMIN.AUDIT_LOG.EMPTY' | translate }}</td></tr>
                                } @else {
                                    @for (log of authLogs; track log.id) {
                                        <tr class="hover:bg-gray-50 cursor-pointer" (click)="toggleDetail(log.id)">
                                            <td class="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-900">{{ log.username || '—' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-700">{{ log.action }}</td>
                                            <td class="px-4 py-3 text-sm">
                                                @if (log.isSuccess) {
                                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">{{ 'ADMIN.AUDIT_LOG.SUCCESS' | translate }}</span>
                                                } @else {
                                                    <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">{{ 'ADMIN.AUDIT_LOG.FAILED' | translate }}</span>
                                                }
                                            </td>
                                            <td class="px-4 py-3 text-sm text-gray-500">{{ log.ipAddress || '—' }}</td>
                                            <td class="px-4 py-3 text-sm text-gray-500">{{ deviceText(log.deviceType, log.operatingSystem, log.browserName) }}</td>
                                        </tr>
                                        @if (expandedId === log.id) {
                                            <tr class="bg-gray-50">
                                                <td colspan="6" class="px-4 py-4">
                                                    <p class="text-xs font-semibold text-gray-500 uppercase mb-1">{{ 'ADMIN.AUDIT_LOG.DETAIL' | translate }}</p>
                                                    <pre class="text-xs text-gray-700 bg-white border border-gray-200 rounded p-2 overflow-x-auto whitespace-pre-wrap">{{ log.detail || '—' }}</pre>
                                                    <p class="text-xs text-gray-500 mt-2">{{ 'ADMIN.AUDIT_LOG.USER_AGENT' | translate }}: {{ log.userAgent || '—' }}</p>
                                                </td>
                                            </tr>
                                        }
                                    }
                                }
                            </tbody>
                        </table>
                    }
                </div>

                <app-pagination [pageNumber]="pageNumber" [pageSize]="pageSize" [totalCount]="totalCount"
                    [totalPages]="totalPages" [hasPreviousPage]="hasPreviousPage" [hasNextPage]="hasNextPage"
                    (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)">
                </app-pagination>
            </div>
        </div>
    `
})
export class AdminAuditLogListComponent implements OnInit {
    tabs: StatusTabItem[] = [];

    activeTab = 'entity';
    entityLogs: AuditLogEntry[] = [];
    authLogs: AuthAuditLogEntry[] = [];
    keyword = '';
    fromDate: string | null = null;
    toDate: string | null = null;
    expandedId: string | null = null;
    isLoading = false;

    pageNumber = 1;
    pageSize = 20;
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
            { key: 'auth', label: this._appService.trans('ADMIN.AUDIT_LOG.TAB_AUTH'), icon: 'fa-solid fa-right-to-bracket' }
        ];
        this.loadData();
    }

    onTabChange(key: string): void {
        if (key === this.activeTab) return;
        this.activeTab = key;
        this.pageNumber = 1;
        this.expandedId = null;
        this.loadData();
    }

    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
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

    /** Mở / đóng phần chi tiết của một dòng nhật ký. */
    toggleDetail(id: string): void {
        this.expandedId = this.expandedId === id ? null : id;
    }

    /** Ghép thông tin thiết bị để hiển thị gọn trong một cột. */
    deviceText(deviceType?: string, operatingSystem?: string, browserName?: string): string {
        const parts = [deviceType, operatingSystem, browserName].filter(part => !!part);
        return parts.length > 0 ? parts.join(' · ') : '—';
    }

    loadData(): void {
        this.isLoading = true;

        const keyword = this.keyword.trim();
        const common = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            sortBy: 'timestamp',
            sortOrder: 'desc',
            fromDate: this.fromDate ?? undefined,
            toDate: this.toDate ?? undefined
        };

        const request: Observable<PagedResponse<AuditLogEntry | AuthAuditLogEntry>> = this.activeTab === 'auth'
            ? this._auditLogService.getFullAuthLogs({ ...common, username: keyword || undefined })
            : this._auditLogService.getFullEntityLogs({ ...common, entityName: keyword || undefined });

        request.subscribe({
            next: (response: PagedResponse<AuditLogEntry | AuthAuditLogEntry>) => {
                this.applyPagedResponse(response);
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
}
