import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { UserRole } from '@core/models/auth.model';
import { Permission, PermissionItem, RolePermission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';

/** Cột vai trò được cấu hình quyền trên màn hình. */
interface RoleColumn {
    role: UserRole;
    isSuperAdmin: boolean;
}

/**
 * Ma trận phân quyền: danh mục quyền theo mã P### (API đọc từ enum) và quyền bật cho từng vai trò.
 * Chỉ tài khoản có quyền P101 mới sửa được; SuperAdmin luôn toàn quyền nên không cấu hình.
 */
@Component({
    selector: 'app-admin-permission-matrix',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        BadgeComponent
    ],
    templateUrl: './permission-matrix.component.html',
    styleUrls: ['./permission-matrix.component.css']
})
export class AdminPermissionMatrixComponent implements OnInit {
    isLoading = true;
    isSaving = false;
    searchText = '';

    permissions: PermissionItem[] = [];
    roleColumns: RoleColumn[] = [
        { role: UserRole.User, isSuperAdmin: false },
        { role: UserRole.Partner, isSuperAdmin: false },
        { role: UserRole.Admin, isSuperAdmin: false },
        { role: UserRole.SuperAdmin, isSuperAdmin: true }
    ];

    /** Quyền bật theo vai trò — bản đang sửa trên màn hình. */
    selected: Record<string, Set<string>> = {};

    /** Bản gốc để biết vai trò nào cần lưu. */
    private original: Record<string, Set<string>> = {};

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        this.loadMatrix();
    }

    loadMatrix(): void {
        this.isLoading = true;

        this._appService.permissionService.getMatrix().subscribe({
            next: (response) => {
                const matrix = response.data;
                this.permissions = matrix?.permissions ?? [];
                this.applyRoles(matrix?.roles ?? []);
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this._appService.showError(error?.error?.message || this._appService.trans('PERMISSION.LOAD_FAILED'));
            }
        });
    }

    /** Danh mục quyền lọc theo ô tìm kiếm (mã, tên, nhóm hoặc API). */
    get filteredPermissions(): PermissionItem[] {
        const keyword = this.searchText.trim().toLowerCase();
        if (!keyword) return this.permissions;

        return this.permissions.filter(item =>
            item.code.toLowerCase().includes(keyword)
            || item.name.toLowerCase().includes(keyword)
            || item.module.toLowerCase().includes(keyword)
            || (item.endpoints ?? '').toLowerCase().includes(keyword));
    }

    /** Tài khoản hiện tại có được sửa quyền (chỉ SuperAdmin có quyền P101). */
    get canEdit(): boolean {
        return this._appService.permissionService.has(Permission.UpdateRolePermissions);
    }

    /** Vai trò có thay đổi chưa lưu. */
    isDirty(role: UserRole): boolean {
        return !this.sameSet(this.selected[role], this.original[role]);
    }

    get hasChanges(): boolean {
        return this.roleColumns.some(column => !column.isSuperAdmin && this.isDirty(column.role));
    }

    isChecked(role: UserRole, code: string): boolean {
        return this.selected[role]?.has(code) ?? false;
    }

    onToggle(role: UserRole, code: string, checked: boolean): void {
        const set = this.selected[role];
        if (!set) return;

        if (checked) {
            set.add(code);
        } else {
            set.delete(code);
        }
    }

    /** Lưu các vai trò có thay đổi. */
    onSave(): void {
        const changed = this.roleColumns.filter(column => !column.isSuperAdmin && this.isDirty(column.role));
        if (changed.length === 0) return;

        this.isSaving = true;
        const next = changed[0];

        this.saveRole(next.role, changed.slice(1));
    }

    private saveRole(role: UserRole, remaining: RoleColumn[]): void {
        const codes = Array.from(this.selected[role] ?? []);

        this._appService.permissionService.updateRolePermissions(role, codes).subscribe({
            next: (response) => {
                const matrix = response.data;
                this.original[role] = new Set(codes);

                if (remaining.length > 0) {
                    this.saveRole(remaining[0].role, remaining.slice(1));
                    return;
                }

                this.isSaving = false;
                if (matrix) {
                    this.permissions = matrix.permissions ?? this.permissions;
                    this.applyRoles(matrix.roles ?? []);
                }
                this._appService.showSuccess(this._appService.trans('PERMISSION.SAVE_SUCCESS'));
            },
            error: (error) => {
                this.isSaving = false;
                this._appService.showError(error?.error?.message || this._appService.trans('PERMISSION.SAVE_FAILED'));
                this.loadMatrix();
            }
        });
    }

    /** Nhãn nhóm chức năng. */
    moduleKey(module: string): string {
        return `PERMISSION.MODULE.${module.toUpperCase()}`;
    }

    /** Nhãn loại quyền (view/action). */
    kindKey(kind: string): string {
        return `PERMISSION.KIND.${kind.toUpperCase()}`;
    }

    /** Nhãn vai trò. */
    roleKey(role: UserRole): string {
        return `USER_ROLE.${UserRole[role].toUpperCase() === 'SUPERADMIN' ? 'SUPER_ADMIN' : UserRole[role].toUpperCase()}`;
    }

    private applyRoles(roles: RolePermission[]): void {
        this.selected = {};
        this.original = {};

        for (const column of this.roleColumns) {
            const found = roles.find(item => String(item.role) === String(column.role));
            const codes = new Set(found?.permissionCodes ?? []);
            this.selected[column.role] = new Set(codes);
            this.original[column.role] = new Set(codes);
        }
    }

    private sameSet(left?: Set<string>, right?: Set<string>): boolean {
        const a = left ?? new Set<string>();
        const b = right ?? new Set<string>();
        if (a.size !== b.size) return false;

        for (const value of a) {
            if (!b.has(value)) return false;
        }
        return true;
    }
}
