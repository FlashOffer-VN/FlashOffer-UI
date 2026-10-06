import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';

import { AppService } from '@core/services/app.service';
import { PermissionService, ancestorCodes, buildPermissionTree, collectActionCodes, grantChainCodes, isContainerNode, permissionLabel, permissionLabelKey, permissionMeta } from '@core/services/permission.service';
import { ApiResponse, UserRole, toUserRole } from '@core/models/auth.model';
import {
    PermissionGroupItem,
    PermissionMatrix,
    PermissionTreeNode,
    UpdateUsersPermissionsResult,
    UserPermissionCandidate,
    UserPermissionDetail
} from '@core/models/permission.model';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';

type NodeState = 'all' | 'some' | 'none';

/**
 * Cấu hình quyền riêng cho tài khoản: chọn một hoặc nhiều tài khoản rồi tích quyền hiệu lực.
 * Cây quyền hiển thị theo Nhóm → Màn hình → hành động; tắt màn hình thì mọi hành động con coi như tắt.
 * Phần khác biệt so với quyền của vai trò được API lưu lại, nên khi quyền vai trò đổi thì tài khoản vẫn theo vai trò.
 */
@Component({
    selector: 'app-admin-user-permission',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LoadingComponent, ButtonComponent, InputComponent,
        CheckboxComponent
    ],
    template: `
        <div class="grid gap-4 lg:grid-cols-[340px_1fr]">
            <!-- Danh sách tài khoản -->
            <aside class="bg-white rounded-lg border border-gray-200 p-3">
                <app-input [(ngModel)]="search" (keyup.enter)="loadCandidates()" [id]="'user_permission_search'"
                    [placeholder]="'PERMISSION.USER.SEARCH_PLACEHOLDER' | translate">
                </app-input>

                <div class="mt-3 max-h-[28rem] overflow-y-auto">
                    @if (isLoadingCandidates) {
                        <app-loading></app-loading>
                    } @else if (candidates.length === 0) {
                        <p class="text-sm text-gray-500 py-4 text-center">{{ 'PERMISSION.USER.EMPTY' | translate }}</p>
                    } @else {
                        @for (user of candidates; track user.id) {
                            <label class="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                                <app-checkbox [ngModel]="isSelected(user.id)" (ngModelChange)="toggleUser(user)" />
                                <span class="text-sm">
                                    <span class="block text-gray-900">{{ user.fullName }}</span>
                                    <span class="block text-xs text-gray-500">{{ user.username }} · {{ user.roleName }}</span>
                                </span>
                            </label>
                        }
                    }
                </div>
            </aside>

            <!-- Cây quyền của các tài khoản đang chọn -->
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
                        <!-- Ô lọc cây quyền dùng state riêng (treeSearch); ô tìm tài khoản ở cột trái chỉ query tài khoản. -->
                        <div class="w-full sm:w-64">
                            <app-input [(ngModel)]="treeSearch" icon="fa-solid fa-magnifying-glass"
                                [placeholder]="'PERMISSION.SEARCH_PLACEHOLDER' | translate">
                            </app-input>
                        </div>
                        <app-button variant="primary" [loading]="isSaving" class="ml-auto" (onClick)="save()">
                            <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'PERMISSION.SAVE' | translate }}
                        </app-button>
                    </div>

                    <div class="rounded-lg border border-gray-200">
                        @for (node of visibleTree; track node.code) {
                            <ng-container *ngTemplateOutlet="permNode; context: { $implicit: node, depth: 0 }"></ng-container>
                        } @empty {
                            <p class="text-sm text-gray-500 py-6 text-center">{{ 'PAGINATION.NO_ITEMS' | translate }}</p>
                        }
                    </div>
                }
            </section>
        </div>

        <!-- Một dòng cho mỗi nút; tự gọi lại cho nút con (đệ quy theo children). -->
        <ng-template #permNode let-node let-depth="depth">
            <div class="border-b border-gray-100 last:border-b-0">
                <div class="flex items-start gap-2 px-3 py-2"
                    [class.bg-gray-50]="node.kind === 'group'"
                    [style.padding-left.px]="12 + depth * 18">
                    @if (isContainer(node)) {
                        <button type="button" class="mt-0.5 text-gray-400 hover:text-gray-600 w-4"
                            (click)="toggleExpand(node)" [attr.aria-expanded]="isExpanded(node)">
                            <i class="fa-solid" [class.fa-chevron-down]="isExpanded(node)"
                                [class.fa-chevron-right]="!isExpanded(node)"></i>
                        </button>
                        <app-checkbox [ngModel]="nodeState(node) === 'all'" [indeterminate]="nodeState(node) === 'some'" [disabled]="isNodeDisabled(node)" (ngModelChange)="toggleNode(node, $event)" />
                        <span class="text-sm"
                            [class.font-semibold]="node.kind === 'group'"
                            [class.font-medium]="node.kind === 'screen'">
                            {{ nodeLabel(node) }}
                        </span>
                        <span class="text-xs text-gray-400 mt-0.5">· {{ kindKey(node) | translate }}</span>
                    } @else {
                        <span class="w-4"></span>
                        <app-checkbox [ngModel]="isChecked(node.code)" [disabled]="isNodeDisabled(node)" (ngModelChange)="toggleCode(node)" />
                        <span class="text-sm">
                            <span class="block text-gray-800">{{ nodeLabel(node) }}</span>
                            @if (nodeMeta(node)) {
                            <!-- Metadata của quyền do API trả sẵn: mã quyền · route màn hình · endpoint API. -->
                            <span class="block text-xs text-gray-400 font-mono" [title]="nodeMeta(node)">{{ nodeMeta(node) }}</span>
                            }
                            @if (isMixed(node.code) || isGrantedExtra(node.code) || isDeniedOverride(node.code) || isTickedButBlocked(node) || isGrantedNotEffective(node.code)) {
                            <span class="block text-xs text-gray-500">
                                @if (isMixed(node.code)) {
                                    <em>{{ 'PERMISSION.USER.MIXED' | translate }}</em>
                                }
                                @if (isGrantedExtra(node.code)) {
                                    <span class="text-green-600">{{ 'PERMISSION.USER.GRANTED_EXTRA' | translate }}</span>
                                }
                                @if (isDeniedOverride(node.code)) {
                                    <span class="text-red-600">{{ 'PERMISSION.USER.DENIED_OVERRIDE' | translate }}</span>
                                }
                                @if (isTickedButBlocked(node) || isGrantedNotEffective(node.code)) {
                                    <span class="text-amber-600">{{ 'PERMISSION.NOT_EFFECTIVE' | translate }}</span>
                                }
                            </span>
                            }
                        </span>
                    }
                </div>

                @if (isContainer(node) && isExpanded(node)) {
                    @for (child of node.children; track child.code) {
                        <ng-container *ngTemplateOutlet="permNode; context: { $implicit: child, depth: depth + 1 }"></ng-container>
                    }
                }
            </div>
        </ng-template>
    `
})
export class AdminUserPermissionComponent implements OnInit {
    /** Quyền sẽ bật cho các tài khoản đang chọn. */
    checked = new Set<string>();
    /** Quyền không đồng nhất giữa các tài khoản đang chọn. */
    mixed = new Set<string>();

    candidates: UserPermissionCandidate[] = [];
    selected: UserPermissionCandidate[] = [];
    tree: PermissionTreeNode[] = [];
    /** Từ khoá tìm tài khoản (ô bên trái) — CHỈ dùng để query danh sách tài khoản. */
    search = '';
    /**
     * Từ khoá lọc CÂY QUYỀN — state RIÊNG, không dùng chung với ô tìm tài khoản.
     * Trước đây cây quyền lọc theo chính `search` nên gõ tên tài khoản là cây trống,
     * còn gõ mã quyền để lọc cây lại thành từ khoá tìm tài khoản (không ra tài khoản nào).
     */
    treeSearch = '';
    isLoadingCandidates = false;
    isLoadingDetail = false;
    isSaving = false;

    /** Nhánh đang mở/đóng; mặc định mở nhóm, đóng màn hình (droplist). */
    private expanded: Record<string, boolean> = {};
    /** Ảnh chụp mã đang tick khi tắt nhánh, để bật lại cha thì con về trạng thái cũ. */
    private snapshots: Record<string, string[]> = {};

    private _details = new Map<string, UserPermissionDetail>();
    /** Tên nhóm quyền theo mã nhóm, đọc từ bảng PermissionGroups. */
    private _groupNames = new Map<string, string>();
    /** Ma trận quyền gần nhất — dùng làm fallback khi dựng cây. */
    private _matrix?: PermissionMatrix;

    constructor(
        private readonly _appService: AppService,
        private readonly _permissionService: PermissionService,
        private readonly _translate: TranslateService
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
        // Cây quyền tải theo vai trò đang xem — vai trò của tài khoản đang chọn.
        this.loadTree();
    }

    //#region Cây quyền (Nhóm → Màn hình → hành động)

    get visibleTree(): PermissionTreeNode[] {
        const keyword = this.treeSearch.trim().toLowerCase();
        if (!keyword) return this.tree;

        return this.tree
            .map(node => this.filterNode(node, keyword))
            .filter((node): node is PermissionTreeNode => !!node);
    }

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
        const stored = this.expanded[node.code];
        if (stored !== undefined) return stored;
        return node.kind === 'group';
    }

    toggleExpand(node: PermissionTreeNode): void {
        this.expanded[node.code] = !this.isExpanded(node);
    }

    /** Nhãn hiển thị: nhóm lấy tên từ DB, còn lại lấy TÊN DO API DỊCH SẴN theo ngôn ngữ trong token. */
    nodeLabel(node: PermissionTreeNode): string {
        if (node.kind === 'group') {
            const fromDb = this._groupNames.get(node.code.toUpperCase());
            if (fromDb) return fromDb;
        }

        return permissionLabel(node, this._translate);
    }

    /** Dòng metadata của quyền: mã quyền · route màn hình · endpoint API (API trả sẵn, UI chỉ hiển thị). */
    nodeMeta(node: PermissionTreeNode): string {
        return permissionMeta(node);
    }

    kindKey(node: PermissionTreeNode): string {
        // Loại hành động do API khai báo (view/create/update/delete/restore/action) mới đúng nhãn.
        const kind = node.kind === 'action' ? (node.actionKind || node.kind) : node.kind;
        return `PERMISSION.KIND.${(kind || 'action').toUpperCase()}`;
    }

    nodeState(node: PermissionTreeNode): NodeState {
        const codes = collectActionCodes(node);
        if (codes.length === 0) return 'none';

        let granted = 0;
        for (const code of codes) {
            if (this.checked.has(code)) granted += 1;
        }
        if (granted === 0) return 'none';
        return granted === codes.length ? 'all' : 'some';
    }

    /** Cha đang tắt (chưa tick quyền nào) thì con khoá lại, chỉ hiện trạng thái tắt. */
    isNodeDisabled(node: PermissionTreeNode): boolean {
        let parent = node.parent ?? null;
        while (parent) {
            if (this.nodeState(parent) === 'none') return true;
            parent = parent.parent ?? null;
        }
        return false;
    }

    /**
     * Tick / bỏ tick một nhánh: áp cho toàn bộ hành động con (đệ quy theo cây).
     * Khi BẬT phải cấp kèm toàn bộ chuỗi tổ tiên (màn hình + nhóm của nó) để quyền có hiệu lực — gửi thiếu
     * là hành động vừa bật bị kế thừa vô hiệu ngay (đã gặp với màn hoa hồng).
     */
    toggleNode(node: PermissionTreeNode, checked: boolean): void {
        const codes = collectActionCodes(node);
        const key = node.code;

        if (checked) {
            const restore = this.snapshots[key];
            const toAdd = restore && restore.length ? restore : codes;
            for (const code of toAdd) {
                this.checked.add(code);
                this.mixed.delete(code);
            }
            for (const code of grantChainCodes(node)) {
                this.checked.add(code);
                this.mixed.delete(code);
            }
            delete this.snapshots[key];
            return;
        }

        this.snapshots[key] = codes.filter(code => this.checked.has(code));
        for (const code of codes) {
            this.checked.delete(code);
        }
    }

    /**
     * Tích / bỏ tích một quyền hành động cho toàn bộ tài khoản đang chọn.
     * Khi BẬT phải cấp kèm toàn bộ chuỗi tổ tiên (màn hình + nhóm) — API tính hiệu lực = bản thân VÀ mọi
     * tổ tiên đều được cấp nên thiếu tổ tiên là quyền bị vô hiệu sau khi lưu.
     */
    toggleCode(node: PermissionTreeNode): void {
        if (this.checked.has(node.code) && !this.mixed.has(node.code)) {
            this.checked.delete(node.code);
        } else {
            this.checked.add(node.code);
            for (const code of ancestorCodes(node)) this.checked.add(code);
        }
        this.mixed.delete(node.code);
    }

    /** Hành động đang tick nhưng một tổ tiên trong chuỗi đang tắt ⇒ chưa hiệu lực. */
    isTickedButBlocked(node: PermissionTreeNode): boolean {
        return !this.isContainer(node) && this.checked.has(node.code) && this.isNodeDisabled(node);
    }

    /** Quyền được cấp riêng cho tài khoản nhưng KHÔNG hiệu lực vì thiếu mã tổ tiên (màn hình/nhóm). */
    isGrantedNotEffective(code: string): boolean {
        if (this.selected.length !== 1) return false;
        const detail = this._details.get(this.selected[0].id);
        return !!detail && !!detail.grantedCodes?.includes(code) && !detail.effectiveCodes?.includes(code);
    }

    //#endregion

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

    /** Danh mục quyền dùng chung với ma trận quyền, dựng thành cây Nhóm → Màn hình → hành động. */
    private loadCatalog(): void {
        this._permissionService.getMatrix().subscribe({
            next: response => {
                const matrix: PermissionMatrix | undefined = response.data;
                this._matrix = matrix;
                this.applyGroupNames(matrix?.groups ?? []);
                this.loadTree();
            },
            error: () => this._appService.showError(this._appService.trans('PERMISSION.LOAD_FAILED'))
        });
    }

    /** Vai trò đang xem: vai trò của tài khoản đang chọn (đầu tiên) — truyền vào GET /permissions/tree. */
    private viewRole(): UserRole | undefined {
        if (this.selected.length === 0) return undefined;
        return toUserRole(this.selected[0].role);
    }

    /** Tải cây quyền theo vai trò đang xem; máy chủ chưa trả cây thì dựng từ ma trận quyền. */
    private loadTree(): void {
        this._permissionService.getTree(this.viewRole()).subscribe({
            next: treeResponse => {
                const apiTree = treeResponse.data;
                this.tree = apiTree && apiTree.length ? this.normalizeTree(apiTree) : buildPermissionTree(this._matrix);
            },
            error: () => {
                this.tree = buildPermissionTree(this._matrix);
            }
        });
    }

    private applyGroupNames(groups: PermissionGroupItem[]): void {
        this._groupNames = new Map(groups.map(group => [
            group.code.toUpperCase(),
            this._translate.currentLang === 'en' ? (group.nameEn || group.name) : (group.name || group.nameEn)
        ]));
    }

    private normalizeTree(nodes: PermissionTreeNode[], parent: PermissionTreeNode | null = null): PermissionTreeNode[] {
        return nodes.map(node => {
            const normalized: PermissionTreeNode = { ...node, children: node.children ?? [], parent };
            normalized.children = this.normalizeTree(normalized.children, normalized);
            return normalized;
        });
    }

    /** Nạp quyền hiệu lực của các tài khoản đang chọn rồi gộp thành trạng thái tích chung. */
    private loadDetails(): void {
        if (this.selected.length === 0) {
            this.checked.clear();
            this.mixed.clear();
            return;
        }

        // Chốt danh sách tài khoản tại thời điểm gọi: người dùng có thể bỏ chọn giữa chừng nên khi
        // response về không được đọc lại this.selected theo chỉ số (sẽ truy cập .id của undefined).
        const targets = [...this.selected];

        this.isLoadingDetail = true;
        forkJoin(targets.map(user =>
            this._details.has(user.id) ? of(null) : this._permissionService.getUserPermissions(user.id))).subscribe({
            next: responses => {
                responses.forEach((response, index) => {
                    const userId = targets[index]?.id;
                    if (response?.data && userId) {
                        this._details.set(userId, response.data);
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
