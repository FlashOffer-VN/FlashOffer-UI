import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';

import { AppService } from '@core/services/app.service';
import { PermissionService } from '@core/services/permission.service';
import { ApiResponse } from '@core/models/auth.model';
import {
    PermissionItem,
    UpdateUsersPermissionsResult,
    UserPermissionCandidate,
    UserPermissionDetail
} from '@core/models/permission.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';

/** Nhóm quyền theo module để hiển thị thành từng khối. */
interface PermissionGroup {
    module: string;
    items: PermissionItem[];
}

/**
 * Cấu hình quyền riêng cho tài khoản: chọn một hoặc nhiều tài khoản rồi tích quyền hiệu lực.
 * Phần khác biệt so với quyền của vai trò được API lưu lại, nên khi quyền vai trò đổi thì tài khoản vẫn theo vai trò.
 */
@Component({
    selector: 'app-admin-user-permission',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LoadingComponent],
    template: `
        <div class="grid gap-4 lg:grid-cols-[340px_1fr]">
            <!-- Danh sách tài khoản -->
            <aside class="bg-white rounded-lg border border-gray-200 p-3">
                <input type="text" [(ngModel)]="search" (keyup.enter)="loadCandidates()"
                    [placeholder]="'PERMISSION.USER.SEARCH_PLACEHOLDER' | translate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />

                <div class="mt-3 max-h-[28rem] overflow-y-auto">
                    @if (isLoadingCandidates) {
                        <app-loading></app-loading>
                    } @else if (candidates.length === 0) {
                        <p class="text-sm text-gray-500 py-4 text-center">{{ 'PERMISSION.USER.EMPTY' | translate }}</p>
                    } @else {
                        @for (user of candidates; track user.id) {
                            <label class="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                                <input type="checkbox" class="mt-1" [checked]="isSelected(user.id)"
                                    (change)="toggleUser(user)" />
                                <span class="text-sm">
                                    <span class="block text-gray-900">{{ user.fullName }}</span>
                                    <span class="block text-xs text-gray-500">{{ user.username }} · {{ user.roleName }}</span>
                                </span>
                            </label>
                        }
                    }
                </div>
            </aside>

            <!-- Bảng quyền của các tài khoản đang chọn -->
            <section class="bg-white rounded-lg border border-gray-200 p-4">
                @if (selected.length === 0) {
                    <p class="text-sm text-gray-500 py-10 text-center">{{ 'PERMISSION.USER.NO_USER_SELECTED' | translate }}</p>
                } @else {
                    <div class="flex flex-wrap items-center gap-3 mb-4">
                        <span class="text-sm text-gray-700">
                            {{ 'PERMISSION.USER.SELECTED' | translate }}: <strong>{{ selected.length }}</strong>
                        </span>
                        <span class="text-xs text-gray-500">
                            {{ selectedNames() }}
                        </span>
                        <button type="button" (click)="save()" [disabled]="isSaving"
                            class="ml-auto px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                            <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'PERMISSION.SAVE' | translate }}
                        </button>
                    </div>

                    <div class="grid gap-4 md:grid-cols-2">
                        @for (group of groups; track group.module) {
                            <div class="border border-gray-200 rounded-lg">
                                <p class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                    {{ group.module }}
                                </p>
                                <div class="p-2">
                                    @for (item of group.items; track item.code) {
                                        <label class="flex items-start gap-2 px-1 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                                            <input type="checkbox" class="mt-1" [checked]="isChecked(item.code)"
                                                (change)="toggleCode(item.code)" />
                                            <span class="text-sm">
                                                <span class="block text-gray-800">{{ item.name }}</span>
                                                <span class="block text-xs text-gray-500">
                                                    {{ item.code }}
                                                    @if (isMixed(item.code)) {
                                                        · <em>{{ 'PERMISSION.USER.MIXED' | translate }}</em>
                                                    }
                                                    @if (isGrantedExtra(item.code)) {
                                                        · <span class="text-green-600">{{ 'PERMISSION.USER.GRANTED_EXTRA' | translate }}</span>
                                                    }
                                                    @if (isDeniedOverride(item.code)) {
                                                        · <span class="text-red-600">{{ 'PERMISSION.USER.DENIED_OVERRIDE' | translate }}</span>
                                                    }
                                                </span>
                                            </span>
                                        </label>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                }
            </section>
        </div>
    `
})
export class AdminUserPermissionComponent implements OnInit {
    /** Quyền sẽ bật cho các tài khoản đang chọn. */
    checked = new Set<string>();
    /** Quyền không đồng nhất giữa các tài khoản đang chọn. */
    mixed = new Set<string>();

    candidates: UserPermissionCandidate[] = [];
    selected: UserPermissionCandidate[] = [];
    groups: PermissionGroup[] = [];
    search = '';
    isLoadingCandidates = false;
    isLoadingDetail = false;
    isSaving = false;

    private _details = new Map<string, UserPermissionDetail>();

    constructor(
        private readonly _appService: AppService,
        private readonly _permissionService: PermissionService
    ) { }

    ngOnInit(): void {
        this.loadCatalog();
        this.loadCandidates();
    }

    isSelected(userId: string): boolean {
        return this.selected.some(user => user.id === userId);
    }

    isChecked(code: string): boolean {
        return this.checked.has(code);
    }

    isMixed(code: string): boolean {
        return this.mixed.has(code);
    }

    /** Quyền được bật riêng cho tài khoản (khác với vai trò). */
    isGrantedExtra(code: string): boolean {
        return this.selected.length === 1 && !!this._details.get(this.selected[0].id)?.grantedCodes?.includes(code);
    }

    /** Quyền bị tắt riêng cho tài khoản (vai trò có nhưng tài khoản bị tắt). */
    isDeniedOverride(code: string): boolean {
        return this.selected.length === 1 && !!this._details.get(this.selected[0].id)?.deniedCodes?.includes(code);
    }

    selectedNames(): string {
        const names = this.selected.slice(0, 3).map(user => user.fullName || user.username);
        return this.selected.length > 3 ? `${names.join(', ')}…` : names.join(', ');
    }

    loadCandidates(): void {
        this.isLoadingCandidates = true;
        this._permissionService.searchUsers(this.search.trim()).subscribe({
            next: response => {
                this.candidates = response.data ?? [];
                this.isLoadingCandidates = false;
            },
            error: () => {
                this.candidates = [];
                this.isLoadingCandidates = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    toggleUser(user: UserPermissionCandidate): void {
        if (this.isSelected(user.id)) {
            this.selected = this.selected.filter(item => item.id !== user.id);
            this._details.delete(user.id);
        } else {
            this.selected = [...this.selected, user];
        }
        this.loadDetails();
    }

    /** Tích / bỏ tích một quyền cho toàn bộ tài khoản đang chọn. */
    toggleCode(code: string): void {
        if (this.checked.has(code) && !this.mixed.has(code)) {
            this.checked.delete(code);
        } else {
            this.checked.add(code);
        }
        this.mixed.delete(code);
    }

    save(): void {
        if (this.selected.length === 0 || this.isSaving) return;

        const codes = Array.from(this.checked).sort();
        const ids = this.selected.map(user => user.id);
        this.isSaving = true;

        // Cùng một biến cho hai kiểu phản hồi (một tài khoản / nhiều tài khoản) nên khai báo kiểu tường minh.
        const request: Observable<ApiResponse<UserPermissionDetail | UpdateUsersPermissionsResult>> = ids.length === 1
            ? this._permissionService.updateUserPermissions(ids[0], codes)
            : this._permissionService.updateUsersPermissions(ids, codes);

        request.subscribe({
            next: () => {
                this.isSaving = false;
                this._appService.showSuccess(this._appService.trans('PERMISSION.SAVE_SUCCESS'));
                this.loadDetails();
            },
            error: () => {
                this.isSaving = false;
                this._appService.showError(this._appService.trans('PERMISSION.SAVE_FAILED'));
            }
        });
    }

    /** Danh mục quyền dùng chung với ma trận quyền, gom theo module. */
    private loadCatalog(): void {
        this._permissionService.getMatrix().subscribe({
            next: response => {
                const permissions = response.data?.permissions ?? [];
                const byModule = new Map<string, PermissionItem[]>();
                for (const item of permissions) {
                    const bucket = byModule.get(item.module) ?? [];
                    bucket.push(item);
                    byModule.set(item.module, bucket);
                }
                this.groups = Array.from(byModule, ([module, items]) => ({ module, items }));
            },
            error: () => this._appService.showError(this._appService.trans('PERMISSION.LOAD_FAILED'))
        });
    }

    /** Nạp quyền hiệu lực của các tài khoản đang chọn rồi gộp thành trạng thái tích chung. */
    private loadDetails(): void {
        if (this.selected.length === 0) {
            this.checked.clear();
            this.mixed.clear();
            return;
        }

        this.isLoadingDetail = true;
        forkJoin(this.selected.map(user =>
            this._details.has(user.id) ? of(null) : this._permissionService.getUserPermissions(user.id))).subscribe({
            next: responses => {
                responses.forEach((response, index) => {
                    if (response?.data) {
                        this._details.set(this.selected[index].id, response.data);
                    }
                });
                this.rebuildState();
                this.isLoadingDetail = false;
            },
            error: () => {
                this.isLoadingDetail = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Quyền hiệu lực chung của các tài khoản: chỉ tích khi mọi tài khoản đều có. */
    private rebuildState(): void {
        const lists = this.selected
            .map(user => this._details.get(user.id)?.effectiveCodes)
            .filter((codes): codes is string[] => Array.isArray(codes));
        if (lists.length === 0) return;

        const all = new Set<string>();
        lists.forEach(codes => codes.forEach(code => all.add(code)));

        this.checked.clear();
        this.mixed.clear();
        for (const code of all) {
            const owners = lists.filter(codes => codes.includes(code)).length;
            if (owners === lists.length) {
                this.checked.add(code);
            } else {
                this.mixed.add(code);
            }
        }
    }
}
