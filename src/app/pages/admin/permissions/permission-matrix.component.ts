import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { ancestorCodes, buildPermissionTree, collectActionCodes, grantChainCodes, isContainerNode, permissionLabel, permissionLabelKey, permissionMeta } from '@core/services/permission.service';
import { UserRole } from '@core/models/auth.model';
import { Permission, PermissionGroupItem, PermissionMatrix, PermissionTreeNode, RolePermission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';

/** Cột vai trò được cấu hình quyền trên màn hình. */
interface RoleColumn {
    role: UserRole;
    isSuperAdmin: boolean;
}

/** Trạng thái tick của một nút với một vai trò: đủ / một phần / chưa tick. */
type NodeState = 'all' | 'some' | 'none';

/**
 * Ma trận phân quyền hiển thị theo cây Nhóm → Màn hình → hành động (Thêm/Sửa/Xóa/Khôi phục/…).
 * Cây dựng từ `GET /api/v1/permissions/tree`, máy chủ chưa có thì suy từ ma trận quyền.
 * Tắt-lan theo cha: tắt màn hình thì mọi hành động con coi như tắt, tắt nhóm thì cả cụm màn hình tắt theo.
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
        NgSelectWrapperComponent,
        LoadingComponent,
        CheckboxComponent
    ],
    templateUrl: './permission-matrix.component.html',
    styleUrls: ['./permission-matrix.component.css']
})
export class AdminPermissionMatrixComponent implements OnInit {
    isLoading = true;
    isSaving = false;
    searchText = '';

    /** Cây phân quyền Nhóm → Màn hình → hành động. */
    tree: PermissionTreeNode[] = [];

    /** Nhóm quyền đọc từ máy chủ (tên + thứ tự) để hiển thị tên nhóm. */
    private apiGroups: PermissionGroupItem[] = [];

    /** Ma trận gần nhất — dùng làm fallback khi dựng cây và khi đổi vai trò đang xem. */
    private _matrix?: PermissionMatrix;

    /** Vai trò đang xem — cây quyền được tải theo vai trò này (GET /permissions/tree?role=...). */
    viewRole: UserRole = UserRole.User;

    /** Nút đang mở/đóng; mặc định mở nhóm, đóng màn hình (droplist). */
    private expanded: Record<string, boolean> = {};

    /** Ảnh chụp các mã đang tick khi tắt một nhánh, để bật lại cha thì con về trạng thái cũ. */
    private snapshots: Record<string, string[]> = {};

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
        this.roleOptions = this.roleColumns.map(column => ({
            value: column.role,
            label: this._appService.trans(this.roleKey(column.role))
        }));
        this.loadMatrix();
    }

    loadMatrix(): void {
        this.isLoading = true;

        this._appService.permissionService.getMatrix().subscribe({
            next: (response) => {
                const matrix = response.data;
                this._matrix = matrix;
                this.apiGroups = matrix?.groups ?? [];
                this.applyRoles(matrix?.roles ?? []);
                this.loadTree(matrix);
            },
            error: (error) => {
                this.isLoading = false;
                this._appService.showError(error?.error?.message || this._appService.trans('PERMISSION.LOAD_FAILED'));
            }
        });
    }

    /**
     * Ưu tiên cây phân quyền mới của máy chủ (`GET /permissions/tree`);
     * máy chủ chưa trả cây thì dựng cây từ ma trận quyền để giao diện vẫn chạy.
     */
    private loadTree(matrix: PermissionMatrix | undefined): void {
        this._appService.permissionService.getTree(this.viewRole).subscribe({
            next: (response) => {
                const apiTree = response.data;
                this.tree = apiTree && apiTree.length ? this.normalizeTree(apiTree) : buildPermissionTree(matrix);
                this.isLoading = false;
            },
            error: () => {
                this.tree = buildPermissionTree(matrix);
                this.isLoading = false;
            }
        });
    }

    /**
     * Người dùng chọn vai trò đang xem ở ô chọn phía trên lưới → tải lại cây theo vai trò đó
     * để `isGranted`/`isEffective` của các nút phản ánh đúng vai trò đang xem.
     */
    onViewRoleChange(role: UserRole): void {
        this.viewRole = role;
        this.loadTree(this._matrix);
    }

    /** Gắn nút cha cho từng nút để suy trạng thái tắt-lan, và đảm bảo mọi nút đều có mảng children. */
    private normalizeTree(nodes: PermissionTreeNode[], parent: PermissionTreeNode | null = null): PermissionTreeNode[] {
        return nodes.map(node => {
            const normalized: PermissionTreeNode = { ...node, children: node.children ?? [], parent };
            normalized.children = this.normalizeTree(normalized.children, normalized);
            return normalized;
        });
    }

    /** Đang tìm kiếm thì mở hết để thấy ngay kết quả và chỉ hiện nhánh có kết quả. */
    get isSearching(): boolean {
        return this.searchText.trim().length > 0;
    }

    get visibleTree(): PermissionTreeNode[] {
        const keyword = this.searchText.trim().toLowerCase();
        if (!keyword) return this.tree;

        return this.tree
            .map(node => this.filterNode(node, keyword))
            .filter((node): node is PermissionTreeNode => !!node);
    }

    /** Giữ nhánh có nút hành động khớp từ khoá (mã hoặc tên). */
    private filterNode(node: PermissionTreeNode, keyword: string): PermissionTreeNode | null {
        if (isContainerNode(node)) {
            const children = node.children
                .map(child => this.filterNode(child, keyword))
                .filter((child): child is PermissionTreeNode => !!child);
            return children.length ? { ...node, children } : null;
        }

        const haystack = `${node.code} ${node.name ?? ''}`.toLowerCase();
        return haystack.includes(keyword) ? node : null;
    }

    isContainer(node: PermissionTreeNode): boolean {
        return isContainerNode(node);
    }

    isExpanded(node: PermissionTreeNode): boolean {
        if (this.isSearching) return true;
        const stored = this.expanded[node.code];
        if (stored !== undefined) return stored;
        // Mặc định mở nhóm để thấy danh sách màn hình, đóng màn hình (droplist) để gọn.
        return node.kind === 'group';
    }

    toggleExpand(node: PermissionTreeNode): void {
        this.expanded[node.code] = !this.isExpanded(node);
    }

    /**
     * Nhãn hiển thị của nút: nhóm lấy tên sửa được trong DB (màn phân quyền cho đổi tên nhóm), còn lại
     * lấy TÊN DO API DỊCH SẴN theo ngôn ngữ trong token — UI không phải giữ bản dịch cho từng mã quyền.
     * Chỉ khi API chưa trả tên mới rơi về khoá dịch của UI, cuối cùng mới in mã nút.
     */
    nodeLabel(node: PermissionTreeNode): string {
        if (node.kind === 'group') {
            const group = this.apiGroups.find(item => item.code.toUpperCase() === node.code.toUpperCase());
            if (group) {
                const name = this._translate.currentLang === 'en' ? (group.nameEn || group.name) : (group.name || group.nameEn);
                if (name) return name;
            }
        }

        return permissionLabel(node, this._translate);
    }

    /** Dòng metadata của quyền: mã quyền · route màn hình · endpoint API (API trả sẵn, UI chỉ hiển thị). */
    nodeMeta(node: PermissionTreeNode): string {
        return permissionMeta(node);
    }

    /** Nhãn loại nút (nhóm / màn hình / xem / thêm / sửa / xóa / khôi phục / thao tác). */
    kindKey(node: PermissionTreeNode): string {
        // Loại hành động do API khai báo (view/create/update/delete/restore/action) mới đúng nhãn.
        const kind = node.kind === 'action' ? (node.actionKind || node.kind) : node.kind;
        return `PERMISSION.KIND.${(kind || 'action').toUpperCase()}`;
    }

    /** Có đang đóng nhánh hay không (không tính trạng thái mở rộng khi tìm kiếm). */
    isCollapsed(node: PermissionTreeNode): boolean {
        return !this.isExpanded(node);
    }

    /** Trạng thái tick của một nút với một vai trò, gộp mọi hành động con. */
    nodeState(role: UserRole, node: PermissionTreeNode): NodeState {
        const codes = collectActionCodes(node);
        const set = this.selected[role];
        if (!set || codes.length === 0) return 'none';

        let granted = 0;
        for (const code of codes) {
            if (set.has(code)) granted += 1;
        }

        if (granted === 0) return 'none';
        return granted === codes.length ? 'all' : 'some';
    }

    /**
     * Cha đang tắt thì con khoá lại: bất kỳ tổ tiên nào chưa tick quyền nào (trạng thái none)
     * cũng làm cho nút này không tick được — chỉ hiện trạng thái tắt.
     */
    isNodeDisabled(role: UserRole, node: PermissionTreeNode): boolean {
        let parent = node.parent ?? null;
        while (parent) {
            if (this.nodeState(role, parent) === 'none') return true;
            parent = parent.parent ?? null;
        }
        return false;
    }

    /**
     * Tick / bỏ tick một nhánh cho vai trò: áp cho toàn bộ hành động con (đệ quy theo cây).
     * Khi BẬT phải cấp kèm toàn bộ chuỗi tổ tiên (nút này nếu là nhóm/màn hình + màn hình + nhóm của nó),
     * vì quyền chỉ có hiệu lực khi chính nó VÀ mọi tổ tiên đều được cấp — gửi thiếu là vừa lưu xong đã bị
     * kế thừa vô hiệu (isGranted=true nhưng isEffective=false).
     */
    toggleNode(role: UserRole, node: PermissionTreeNode, checked: boolean): void {
        const set = this.selected[role];
        if (!set) return;

        const codes = collectActionCodes(node);
        const key = `${role}:${node.code}`;

        if (checked) {
            // Bật lại cha thì con trở về đúng tập đã tick trước đó; chưa có ảnh chụp thì bật hết.
            const restore = this.snapshots[key];
            const toAdd = restore && restore.length ? restore : codes;
            for (const code of toAdd) set.add(code);
            for (const code of grantChainCodes(node)) set.add(code);
            delete this.snapshots[key];
            return;
        }

        // Tắt: nhớ lại tập con đang tick rồi bỏ hết khỏi lựa chọn.
        this.snapshots[key] = codes.filter(code => set.has(code));
        for (const code of codes) set.delete(code);
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

    /**
     * Quyền đã được tick nhưng CHƯA HIỆU LỰC theo dữ liệu máy chủ cho vai trò đang xem
     * (thiếu mã màn hình/nhóm cha nên bị kế thừa vô hiệu) — hiện rõ để không tưởng đã ăn quyền.
     */
    isGrantedNotEffective(node: PermissionTreeNode): boolean {
        return node.isGranted === true && node.isEffective === false;
    }

    /**
     * Hành động đang tick trên màn hình nhưng một tổ tiên (màn hình/nhóm bất kỳ trong chuỗi) đang tắt
     * ⇒ chưa hiệu lực. Kiểm CẢ chuỗi tổ tiên chứ không chỉ cha trực tiếp.
     */
    isTickedButBlocked(role: UserRole, node: PermissionTreeNode): boolean {
        return !this.isContainer(node) && this.isChecked(role, node.code) && this.isNodeDisabled(role, node);
    }

    /**
     * Tick/bỏ tick một hành động lá. Khi BẬT phải cấp kèm toàn bộ chuỗi tổ tiên (màn hình, nhóm) để quyền
     * có hiệu lực ngay sau khi lưu.
     */
    onToggle(role: UserRole, node: PermissionTreeNode, checked: boolean): void {
        const set = this.selected[role];
        if (!set) return;

        if (checked) {
            set.add(node.code);
            for (const code of ancestorCodes(node)) set.add(code);
        } else {
            set.delete(node.code);
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
                    this.apiGroups = matrix.groups ?? this.apiGroups;
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

    /**
     * Lựa chọn vai trò cho ô chọn "xem theo vai trò" — nhãn dịch sẵn vì ng-select không tự dịch khoá i18n.
     * Dựng MỘT LẦN (không dùng getter): ng-select coi mảng mới là dữ liệu đổi nên dựng lại panel mỗi lượt
     * kiểm tra thay đổi → bấm vào lựa chọn không ăn.
     */
    roleOptions: { value: UserRole; label: string }[] = [];

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
