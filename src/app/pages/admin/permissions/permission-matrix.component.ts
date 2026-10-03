import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { UserRole } from '@core/models/auth.model';
import { Permission, PermissionGroupItem, PermissionItem, RolePermission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent } from '@shared/components/badge/badge.component';

/** Cột vai trò được cấu hình quyền trên màn hình. */
interface RoleColumn {
    role: UserRole;
    isSuperAdmin: boolean;
}

/** Một nhóm quyền trong cây phân quyền. */
interface PermissionGroup {
    /** Mã nhóm quyền (quyền trỏ tới nhóm qua ParentCode). */
    key: string;
    /** Tên nhóm đọc từ DB của máy chủ; máy chủ cũ không trả về thì để rỗng. */
    name: string;
    /** Tên nhóm tiếng Anh đọc từ DB. */
    nameEn: string;
    /** Khoá i18n tên nhóm — dùng khi máy chủ chưa trả về tên nhóm. */
    labelKey: string;
    /** Nhóm quyền gắn với trang của thành viên (quản trị viên không có trang đó). */
    isMemberArea: boolean;
    permissions: PermissionItem[];
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

    /** Nhóm dành riêng cho quyền gắn với trang của thành viên. */
    private readonly memberGroupKey = 'MEMBER';

    /** Nhóm quyền do máy chủ trả về (tên và thứ tự đọc từ bảng PermissionGroups). */
    private apiGroups: PermissionGroupItem[] = [];

    /** Nhóm đang mở; mặc định thu gọn để cây phân quyền gọn hơn. */
    expandedGroups: Record<string, boolean> = {};

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

    constructor(
        private _appService: AppService,
        private _translate: TranslateService
    ) { }

    ngOnInit(): void {
        this.loadMatrix();
    }

    loadMatrix(): void {
        this.isLoading = true;

        this._appService.permissionService.getMatrix().subscribe({
            next: (response) => {
                const matrix = response.data;
                this.permissions = matrix?.permissions ?? [];
                this.apiGroups = matrix?.groups ?? [];
                this.applyRoles(matrix?.roles ?? []);
                this.isLoading = false;
            },
            error: (error) => {
                this.isLoading = false;
                this._appService.showError(error?.error?.message || this._appService.trans('PERMISSION.LOAD_FAILED'));
            }
        });
    }

    /** Danh mục quyền lọc theo ô tìm kiếm (mã, tên, nhóm, trang hoặc API). */
    get filteredPermissions(): PermissionItem[] {
        const keyword = this.searchText.trim().toLowerCase();
        if (!keyword) return this.permissions;

        return this.permissions.filter(item =>
            item.code.toLowerCase().includes(keyword)
            || item.name.toLowerCase().includes(keyword)
            || item.module.toLowerCase().includes(keyword)
            || (item.parentCode ?? '').toLowerCase().includes(keyword)
            || (item.route ?? '').toLowerCase().includes(keyword)
            || (item.endpoints ?? '').toLowerCase().includes(keyword));
    }

    /** Các nhóm quyền sau khi lọc, xếp theo thứ tự nhóm chức năng. */
    get groups(): PermissionGroup[] {
        const buckets = new Map<string, PermissionItem[]>();

        for (const item of this.filteredPermissions) {
            const key = this.groupKey(item);
            const bucket = buckets.get(key);
            if (bucket) bucket.push(item);
            else buckets.set(key, [item]);
        }

        return [...buckets.entries()]
            .map(([key, permissions]) => {
                const group = this.apiGroups.find(item => item.code.toUpperCase() === key.toUpperCase());
                return {
                    key,
                    name: group?.name ?? '',
                    nameEn: group?.nameEn ?? '',
                    labelKey: this.groupLabelKey(key),
                    isMemberArea: key.toUpperCase() === this.memberGroupKey,
                    permissions
                };
            })
            .sort((left, right) => this.groupOrder(left.key) - this.groupOrder(right.key));
    }

    /** Đang tìm kiếm thì mở hết nhóm để thấy ngay kết quả. */
    get isSearching(): boolean {
        return this.searchText.trim().length > 0;
    }

    isExpanded(key: string): boolean {
        return this.isSearching || (this.expandedGroups[key] ?? false);
    }

    toggleGroup(key: string): void {
        this.expandedGroups[key] = !this.isExpanded(key);
    }

    /**
     * Nhóm của một quyền: lấy mã nhóm (ParentCode) do máy chủ trả về — nhóm đọc từ bảng PermissionGroups.
     * Máy chủ cũ không trả về ParentCode thì suy nhóm từ module và gom riêng quyền của trang thành viên.
     */
    private groupKey(item: PermissionItem): string {
        const parentCode = (item.parentCode ?? '').trim();
        if (parentCode) return parentCode;
        return (item.route ?? '').startsWith('/user') ? this.memberGroupKey : item.module.toUpperCase();
    }

    /** Thứ tự nhóm: theo SortOrder của bảng PermissionGroups, máy chủ cũ thì theo thứ tự nhóm chức năng. */
    private groupOrder(key: string): number {
        const group = this.apiGroups.find(item => item.code.toUpperCase() === key.toUpperCase());
        if (group) return group.sortOrder;

        const fallback = ['ADMIN', this.memberGroupKey, 'SHARED', 'SYSTEM', 'USER', 'PARTNER', 'PURCHASE', 'GROUP', 'COMMUNITY', 'REFERRAL', 'COMMISSION', 'SUPERADMIN'];
        const index = fallback.indexOf(key.toUpperCase());
        return index < 0 ? 1000 : (index + 1) * 10;
    }

    /** Tên nhóm hiển thị: ưu tiên tên đọc từ DB theo ngôn ngữ đang dùng, chưa có thì lấy khoá i18n. */
    groupName(group: PermissionGroup): string {
        const name = this._translate.currentLang === 'en' ? group.nameEn : group.name;
        return name || this._appService.trans(group.labelKey);
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
    /**
     * Khoá i18n cho nhãn nhóm: ba nhóm theo khu vực dùng khoá PERMISSION.GROUP, máy chủ cũ trả mã module thì dùng PERMISSION.MODULE.
     */
    groupLabelKey(key: string): string {
        const upper = key.toUpperCase();
        return ['ADMIN', this.memberGroupKey, 'SHARED'].includes(upper)
            ? `PERMISSION.GROUP.${upper}`
            : this.moduleKey(upper);
    }

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
