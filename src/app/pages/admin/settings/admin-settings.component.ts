import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { Permission } from '@core/models/permission.model';

import { AdminPermissionSettingsComponent } from '@pages/admin/permissions/permission-settings.component';
import { AdminAuditLogListComponent } from '@pages/admin/settings/audit-log/audit-log-list.component';
import { AdminCommissionConfigComponent } from '@pages/admin/settings/commission/commission-config.component';

/** Một mục trong danh sách cài đặt (cột dọc bên trái). */
interface SettingsTab {
    key: string;
    label: string;
    description: string;
    icon: string;
    /** Quyền cần có để thấy mục này; null = mọi tài khoản vào được mục Cài đặt. */
    permission: Permission | readonly Permission[] | null;
}

/**
 * Cài đặt hệ thống: các mục cấu hình xếp thành CỘT DỌC bên trái (Cấu hình chung, Phân quyền,
 * Hoa hồng, Nhật ký hoạt động), nội dung của mục đang chọn hiển thị ở khối bên phải.
 * Mục không có quyền sẽ bị ẩn; SuperAdmin luôn thấy đủ mục.
 */
@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule, TranslateModule, AdminPermissionSettingsComponent, AdminAuditLogListComponent, AdminCommissionConfigComponent],
    template: `
        <div class="settings">
            <header class="settings-head">
                <div>
                    <h1>{{ 'ADMIN.SETTINGS_PAGE.TITLE' | translate }}</h1>
                    <p>{{ 'ADMIN.SETTINGS_PAGE.SUBTITLE' | translate }}</p>
                </div>
                <span class="settings-count">
                    <i class="fa-solid fa-sliders"></i>{{ tabs.length }} {{ 'ADMIN.SETTINGS_PAGE.SECTIONS' | translate }}
                </span>
            </header>

            <div class="settings-body">
                <nav class="settings-nav">
                    @for (tab of tabs; track tab.key) {
                        <button type="button" class="nav-item" [class.is-active]="activeTab === tab.key"
                            (click)="onTabChange(tab.key)">
                            <span class="nav-item__icon"><i [class]="tab.icon"></i></span>
                            <span class="nav-item__text">
                                <span class="nav-item__label">{{ tab.label }}</span>
                                <span class="nav-item__desc">{{ tab.description }}</span>
                            </span>
                            <i class="fa-solid fa-chevron-right nav-item__arrow"></i>
                        </button>
                    }
                </nav>

                <section class="settings-panel">
                    @if (activeTab === 'permissions') {
                        <app-admin-permission-settings></app-admin-permission-settings>
                    } @else if (activeTab === 'commission') {
                        <app-admin-commission-config></app-admin-commission-config>
                    } @else if (activeTab === 'audit') {
                        <app-admin-audit-log-list></app-admin-audit-log-list>
                    } @else {
                        <div class="card intro-card">
                            <span class="intro-card__icon"><i class="fa-solid fa-gear"></i></span>
                            <div>
                                <h2>{{ 'ADMIN.SETTINGS_PAGE.CARD_TITLE' | translate }}</h2>
                                <p>{{ 'ADMIN.SETTINGS_PAGE.CARD_TEXT' | translate }}</p>
                            </div>
                        </div>

                        <div class="card">
                            <h2>{{ 'ADMIN.SETTINGS_PAGE.PLANNED_TITLE' | translate }}</h2>
                            <ul class="planned">
                                <li>
                                    <span class="planned__icon"><i class="fa-solid fa-language"></i></span>
                                    <span class="planned__label">{{ 'ADMIN.SETTINGS_PAGE.LANGUAGE' | translate }}</span>
                                    <span class="planned__badge">{{ 'ADMIN.SETTINGS_PAGE.COMING_SOON' | translate }}</span>
                                </li>
                                <li>
                                    <span class="planned__icon"><i class="fa-solid fa-user-shield"></i></span>
                                    <span class="planned__label">{{ 'ADMIN.SETTINGS_PAGE.SECURITY' | translate }}</span>
                                    <span class="planned__badge">{{ 'ADMIN.SETTINGS_PAGE.COMING_SOON' | translate }}</span>
                                </li>
                                <li>
                                    <span class="planned__icon"><i class="fa-solid fa-server"></i></span>
                                    <span class="planned__label">{{ 'ADMIN.SETTINGS_PAGE.SYSTEM' | translate }}</span>
                                    <span class="planned__badge">{{ 'ADMIN.SETTINGS_PAGE.COMING_SOON' | translate }}</span>
                                </li>
                            </ul>
                        </div>
                    }
                </section>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; }

        .settings { display: flex; flex-direction: column; gap: 1.25rem; }

        .settings-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .settings-head h1 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-heading); }
        .settings-head p { margin: .35rem 0 0; font-size: .875rem; color: var(--text-muted); }
        .settings-count {
            display: inline-flex; align-items: center; gap: .5rem; height: 2rem; padding: 0 .75rem;
            border: 1px solid var(--accent-border); border-radius: 999px;
            background: var(--accent-bg); color: var(--primary-dark); font-size: .8125rem; font-weight: 600;
        }

        .settings-body { display: grid; grid-template-columns: 17.5rem minmax(0, 1fr); gap: 1.25rem; align-items: start; }

        .settings-nav {
            display: flex; flex-direction: column; gap: .25rem; padding: .5rem;
            border: 1px solid var(--border); border-radius: 1rem; background: var(--white);
            box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
        }

        .nav-item {
            display: flex; align-items: center; gap: .75rem; width: 100%; padding: .7rem .75rem;
            border: 1px solid transparent; border-radius: .75rem; background: transparent;
            color: var(--text); text-align: left; cursor: pointer;
            transition: background-color .15s ease, border-color .15s ease, box-shadow .15s ease;
        }
        .nav-item:hover { background: var(--accent-bg-soft); border-color: var(--accent-border); }
        .nav-item.is-active {
            border-color: var(--accent-border); background: var(--accent-bg);
            box-shadow: inset 3px 0 0 var(--primary);
        }

        .nav-item__icon {
            display: grid; flex: 0 0 auto; place-items: center; width: 2.25rem; height: 2.25rem;
            border-radius: .625rem; background: var(--surface-muted); color: var(--slate-600);
            font-size: .95rem; transition: background-color .15s ease, color .15s ease;
        }
        .nav-item.is-active .nav-item__icon { background: var(--primary); color: var(--white); }

        .nav-item__text { display: flex; min-width: 0; flex-direction: column; gap: .1rem; }
        .nav-item__label { font-size: .875rem; font-weight: 600; color: var(--text-heading); }
        .nav-item__desc { font-size: .75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .nav-item__arrow { margin-left: auto; color: var(--primary); font-size: .75rem; opacity: 0; transition: opacity .15s ease; }
        .nav-item.is-active .nav-item__arrow, .nav-item:hover .nav-item__arrow { opacity: 1; }

        .settings-panel { display: flex; min-width: 0; flex-direction: column; gap: 1rem; }

        .card {
            border: 1px solid var(--border); border-radius: 1rem; background: var(--white); padding: 1.25rem;
            box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
        }
        .card h2 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-heading); }

        .intro-card { display: flex; align-items: center; gap: 1rem; border-color: var(--accent-border); background: linear-gradient(135deg, var(--accent-bg), var(--white)); }
        .intro-card p { margin: .4rem 0 0; font-size: .875rem; color: var(--text-muted); }
        .intro-card__icon {
            display: grid; flex: 0 0 auto; place-items: center; width: 3.25rem; height: 3.25rem;
            border-radius: .875rem; background: var(--primary); color: var(--white); font-size: 1.35rem;
        }

        .planned { margin: .875rem 0 0; padding: 0; list-style: none; }
        .planned li {
            display: flex; align-items: center; gap: .75rem; padding: .75rem 0; border-top: 1px solid var(--surface-muted);
        }
        .planned li:first-child { border-top: 0; }
        .planned__icon { display: grid; place-items: center; width: 2rem; height: 2rem; border-radius: .5rem; background: var(--accent-bg); color: var(--primary); }
        .planned__label { font-size: .875rem; color: var(--text-slate); }
        .planned__badge {
            margin-left: auto; padding: .125rem .5rem; border-radius: 999px;
            background: var(--warning-bg); color: var(--warning-dark); font-size: .75rem; font-weight: 600;
        }

        @media (max-width: 1024px) {
            .settings-body { grid-template-columns: minmax(0, 1fr); }
            .nav-item__desc { white-space: normal; }
        }
    `]
})
export class AdminSettingsComponent implements OnInit {
    /** Các mục cài đặt hiển thị theo cột dọc; mục không có quyền sẽ bị loại bỏ. */
    tabs: SettingsTab[] = [];
    activeTab = 'general';

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this.tabs = [
            {
                key: 'general',
                label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_GENERAL'),
                description: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_GENERAL_DESC'),
                icon: 'fa-solid fa-gear',
                permission: null
            },
            {
                key: 'permissions',
                label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_PERMISSIONS'),
                description: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_PERMISSIONS_DESC'),
                icon: 'fa-solid fa-shield-halved',
                permission: Permission.ViewPermissions
            },
            {
                key: 'commission',
                label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_COMMISSION'),
                description: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_COMMISSION_DESC'),
                icon: 'fa-solid fa-percent',
                permission: Permission.ViewCommissionConfigs
            },
            {
                key: 'audit',
                label: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_AUDIT_LOG'),
                description: this._appService.trans('ADMIN.SETTINGS_PAGE.TAB_AUDIT_LOG_DESC'),
                icon: 'fa-solid fa-clipboard-list',
                permission: [Permission.ViewFullAuditLogs, Permission.ViewEntityAuditLogs, Permission.ViewAuthAuditLogs]
            }
        ].filter(tab => !tab.permission || this._appService.permissionService.has(tab.permission));

        if (!this.tabs.some(tab => tab.key === this.activeTab)) {
            this.activeTab = this.tabs.length > 0 ? this.tabs[0].key : '';
        }
    }

    onTabChange(key: string): void {
        if (key === this.activeTab) return;
        this.activeTab = key;
    }
}
