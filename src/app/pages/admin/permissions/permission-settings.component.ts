import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { Permission } from '@core/models/permission.model';

import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AdminPermissionMatrixComponent } from '@pages/admin/permissions/permission-matrix.component';
import { AdminUserPermissionComponent } from '@pages/admin/permissions/user-permission.component';

/**
 * Phân quyền gồm hai cách cấu hình: theo vai trò (ma trận quyền) và theo từng tài khoản
 * (chọn một hoặc nhiều tài khoản). Tab theo tài khoản chỉ hiện khi có quyền cấu hình quyền riêng.
 */
@Component({
    selector: 'app-admin-permission-settings',
    standalone: true,
    imports: [CommonModule, TranslateModule, StatusTabsComponent, AdminPermissionMatrixComponent, AdminUserPermissionComponent],
    template: `
        <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)"></app-status-tabs>

        <div class="mt-4">
            @if (activeTab === 'users') {
                <app-admin-user-permission></app-admin-user-permission>
            } @else {
                <app-admin-permission-matrix></app-admin-permission-matrix>
            }
        </div>
    `
})
export class AdminPermissionSettingsComponent implements OnInit {
    tabs: StatusTabItem[] = [];
    activeTab = 'roles';

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        const items: { tab: StatusTabItem; permission: Permission | null }[] = [
            { tab: { key: 'roles', label: this._appService.trans('PERMISSION.TAB_ROLE'), icon: 'fa-solid fa-users-gear' }, permission: null },
            { tab: { key: 'users', label: this._appService.trans('PERMISSION.TAB_USER'), icon: 'fa-solid fa-user-shield' }, permission: Permission.UpdateUserPermissions }
        ];

        this.tabs = items
            .filter(item => !item.permission || this._appService.permissionService.has(item.permission))
            .map(item => item.tab);
    }

    onTabChange(key: string): void {
        if (key === this.activeTab) return;
        this.activeTab = key;
    }
}
