import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { Permission } from '@core/models/permission.model';

import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AdminPermissionMatrixComponent } from '@pages/admin/permissions/permission-matrix.component';
import { AdminAuditLogListComponent } from '@pages/admin/settings/audit-log/audit-log-list.component';

/**
 * Mục Cài đặt hệ thống gồm các tab cấu hình dùng chung:
 * - Cấu hình chung: các tùy chọn hệ thống (bổ sung dần).
 * - Phân quyền: ma trận quyền theo vai trò.
 * - Nhật ký hoạt động: nhật ký thao tác dữ liệu và nhật ký đăng nhập.
 * Tab chỉ hiện khi tài khoản có quyền tương ứng; SuperAdmin luôn thấy đủ tab.
 */
@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule, TranslateModule, StatusTabsComponent, AdminPermissionMatrixComponent, AdminAuditLogListComponent],
    template: `
        <div class="page">
            <header>
                <div>
                    <h1>{{ 'ADMIN.SETTINGS_PAGE.TITLE' | translate }}</h1>
                    <p>{{ 'ADMIN.SETTINGS_PAGE.SUBTITLE' | translate }}</p>
                </div>
            </header>

            <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)">
            </app-status-tabs>

            <div class="tab-content">
                @if (activeTab === 'permissions') {
                    <app-admin-permission-matrix></app-admin-permission-matrix>
                } @else if (activeTab === 'audit') {
                    <app-admin-audit-log-list></app-admin-audit-log-list>
                } @else {
                    <section class="settings-card">
                        <div class="settings-icon"><i class="fa-solid fa-gear"></i></div>
                        <div>
                            <h2>{{ 'ADMIN.SETTINGS_PAGE.CARD_TITLE' | translate }}</h2>
                            <p>{{ 'ADMIN.SETTINGS_PAGE.CARD_TEXT' | translate }}</p>
                        </div>
                    </section>
                    <section class="checklist">
                        <h2>{{ 'ADMIN.SETTINGS_PAGE.PLANNED_TITLE' | translate }}</h2>
                        <div><i class="fa-solid fa-language"></i>{{ 'ADMIN.SETTINGS_PAGE.LANGUAGE' | translate }}</div>
                        <div><i class="fa-solid fa-sliders"></i>{{ 'ADMIN.SETTINGS_PAGE.SYSTEM' | translate }}</div>
                    </section>
                }
            </div>
        </div>
    `,
    styles: [`
        .page { padding: 1.5rem; color: #111827; }
        header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
        h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        header p { margin: .35rem 0 0; color: #6b7280; font-size: .875rem; }
        .tab-content { margin-top: 1rem; }
        .settings-card { display: flex; align-items: center; gap: 1rem; border: 1px solid #bfdbfe; border-radius: .75rem; background: linear-gradient(135deg, #eff6ff, #fff); padding: 2rem; }
        .settings-icon { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border-radius: .75rem; background: #2563eb; color: #fff; font-size: 1.4rem; }
        h2 { margin: 0; font-size: 1.125rem; font-weight: 700; }
        .settings-card p { margin: .4rem 0 0; color: #6b7280; }
        .checklist { margin-top: 1rem; border: 1px solid #e5e7eb; border-radius: .75rem; background: #fff; padding: 1.25rem; }
        .checklist h2 { margin-bottom: 1rem; }
        .checklist div { display: flex; align-items: center; gap: .75rem; border-top: 1px solid #f3f4f6; padding: .85rem 0; color: #4b5563; }
        .checklist i { width: 1.25rem; color: #2563eb; text-align: center; }
        @media (max-width: 700px) { header { flex-direction: column; } }
    `]
})
export class AdminSettingsComponent implements OnInit {
    /** Tab cấu hình; tab không có quyền sẽ bị ẩn. */
    tabs: StatusTabItem[] = [];
    activeTab = 'general';

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this.tabs = [
            { key: 'general', label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_GENERAL'), icon: 'fa-solid fa-gear', permission: null },
            { key: 'permissions', label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_PERMISSIONS'), icon: 'fa-solid fa-shield-halved', permission: Permission.ViewPermissions },
            { key: 'audit', label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_AUDIT_LOG'), icon: 'fa-solid fa-clipboard-list', permission: Permission.ViewFullAuditLogs }
        ].filter(tab => !tab.permission || this._appService.permissionService.has(tab.permission));
    }

    onTabChange(key: string): void {
        if (key === this.activeTab) return;
        this.activeTab = key;
    }
}
