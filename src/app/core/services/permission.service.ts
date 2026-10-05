import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ApiResponse, UserRole } from '../models/auth.model';
import {
    Permission,
    PermissionMatrix,
    PermissionTree,
    PermissionTreeNode,
    UserPermissionCandidate,
    UserPermissionDetail,
    UpdateUsersPermissionsResult,
    toPermissionCode
} from '../models/permission.model';

/**
 * Quyền của tài khoản đang đăng nhập (đọc từ hồ sơ đã lưu sau khi đăng nhập) và API quản lý quyền.
 * Quyền kèm theo token dạng claim nên kiểm tra ở đây không gọi thêm API.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
    private readonly _baseUrl = 'permissions';

    constructor(
        private _apiService: ApiService,
        private _auth: AuthService
    ) { }

    /** Mã quyền của tài khoản đang đăng nhập. */
    getCodes(): string[] {
        return this._auth.getCurrentUser()?.permissions ?? [];
    }

    /**
     * Tài khoản có quyền không. Nhận một mã hoặc nhiều mã — chỉ cần đúng một mã.
     * SuperAdmin luôn đúng. Không truyền mã nào thì trả về false để tránh mở nhầm.
     */
    has(permission: Permission | string | null | undefined | readonly (Permission | string)[]): boolean {
        const user = this._auth.getCurrentUser();
        if (!user) return false;
        if (user.role === UserRole.SuperAdmin) return true;

        // Hồ sơ lưu từ trước khi có tính năng phân quyền chưa kèm danh sách quyền: chưa xác định được
        // nên không ẩn/chặn (tránh khoá oan menu của phiên đang đăng nhập); API vẫn là nơi chặn thật.
        if (!Array.isArray(user.permissions)) return true;

        const wanted = (Array.isArray(permission) ? permission : [permission])
            .map(code => toPermissionCode(code))
            .filter((code): code is string => !!code);
        if (wanted.length === 0) return false;

        const codes = this.getCodes();
        return wanted.some(code => codes.includes(code));
    }

    /** Tài khoản đang đăng nhập có phải SuperAdmin. */
    isSuperAdmin(): boolean {
        return this._auth.getCurrentUser()?.role === UserRole.SuperAdmin;
    }

    /** Ma trận phân quyền. GET /api/v1/permissions */
    getMatrix(): Observable<ApiResponse<PermissionMatrix>> {
        return this._apiService.get<ApiResponse<PermissionMatrix>>(this._baseUrl);
    }

    /**
     * Cây phân quyền Nhóm → Màn hình → hành động. GET /api/v1/permissions/tree
     * Truyền role để máy chủ gắn sẵn `isGranted` cho từng nút của vai trò đó.
     */
    getTree(role?: UserRole): Observable<ApiResponse<PermissionTree>> {
        const params = role !== undefined && role !== null ? { role } : undefined;
        return this._apiService.get<ApiResponse<PermissionTree>>(`${this._baseUrl}/tree`, params);
    }

    /** Cập nhật quyền cho một vai trò. PUT /api/v1/permissions/roles/{role} */
    updateRolePermissions(role: UserRole, permissionCodes: string[]): Observable<ApiResponse<PermissionMatrix>> {
        return this._apiService.put<ApiResponse<PermissionMatrix>>(`${this._baseUrl}/roles/${role}`, { permissionCodes });
    }

    /** Tìm tài khoản để cấu hình quyền riêng. GET /api/v1/permissions/users */
    searchUsers(search: string): Observable<ApiResponse<UserPermissionCandidate[]>> {
        // Không truyền undefined vào params: HttpParams sẽ gửi thành chuỗi "undefined" và API lọc theo
        // từ khoá đó nên trả về danh sách rỗng. Chỉ gắn tham số khi thực sự có từ khoá.
        const params: Record<string, string | number> = {
            pageNumber: 1,
            pageSize: 50
        };

        const keyword = (search ?? '').trim();
        if (keyword) params['search'] = keyword;

        return this._apiService.get<ApiResponse<UserPermissionCandidate[]>>(`${this._baseUrl}/users`, params);
    }

    /** Quyền hiệu lực của một tài khoản. GET /api/v1/permissions/users/{userId} */
    getUserPermissions(userId: string): Observable<ApiResponse<UserPermissionDetail>> {
        return this._apiService.get<ApiResponse<UserPermissionDetail>>(`${this._baseUrl}/users/${userId}`);
    }

    /** Đặt quyền hiệu lực cho một tài khoản. PUT /api/v1/permissions/users/{userId} */
    updateUserPermissions(userId: string, permissionCodes: string[]): Observable<ApiResponse<UserPermissionDetail>> {
        return this._apiService.put<ApiResponse<UserPermissionDetail>>(`${this._baseUrl}/users/${userId}`, { permissionCodes });
    }

    /** Áp cùng một bộ quyền cho nhiều tài khoản. PUT /api/v1/permissions/users */
    updateUsersPermissions(userIds: string[], permissionCodes: string[]): Observable<ApiResponse<UpdateUsersPermissionsResult>> {
        return this._apiService.put<ApiResponse<UpdateUsersPermissionsResult>>(`${this._baseUrl}/users`, {
            userIds,
            permissionCodes
        });
    }
}

/** Thứ tự nhóm mặc định khi máy chủ chưa trả bảng PermissionGroups. */
const GROUP_FALLBACK_ORDER = ['ADMIN', 'MEMBER', 'SHARED', 'SYSTEM', 'USER', 'PARTNER', 'PURCHASE', 'GROUP', 'COMMUNITY', 'REFERRAL', 'COMMISSION', 'SUPERADMIN'];

/**
 * Dựng cây Nhóm → Màn hình → hành động từ ma trận quyền.
 * Dùng khi máy chủ chưa có `GET /permissions/tree`: mỗi quyền được gom theo `parentCode` (nhóm),
 * rồi theo `screen` (màn hình), rồi để nguyên là hành động. Cấu trúc trả về khớp hợp đồng cây của API.
 */
export function buildPermissionTree(matrix: PermissionMatrix | null | undefined): PermissionTreeNode[] {
    const permissions = matrix?.permissions ?? [];
    const groupOrder = new Map<string, number>();
    (matrix?.groups ?? []).forEach(group => groupOrder.set(group.code.toUpperCase(), group.sortOrder));

    const groups = new Map<string, PermissionTreeNode>();
    for (const item of permissions) {
        const groupCode = (item.parentCode ?? '').trim() || item.module.toUpperCase();
        const screenCode = (item.screen ?? '').trim() || item.module.toUpperCase();

        let group = groups.get(groupCode.toUpperCase());
        if (!group) {
            group = {
                code: groupCode,
                nameKey: `PERMISSION.GROUP.${groupCode.toUpperCase()}`,
                name: '',
                kind: 'group',
                parentCode: null,
                children: [],
                parent: null
            };
            groups.set(groupCode.toUpperCase(), group);
        }

        let screen = group.children.find(child => child.code.toUpperCase() === screenCode.toUpperCase());
        if (!screen) {
            screen = {
                code: screenCode,
                nameKey: `PERMISSION.SCREEN.${screenCode.toUpperCase()}`,
                name: item.screenName ?? '',
                kind: 'screen',
                parentCode: group.code,
                children: [],
                parent: group
            };
            group.children.push(screen);
        }

        const action: PermissionTreeNode = {
            code: item.code,
            nameKey: null,
            name: item.name,
            kind: item.kind || 'action',
            parentCode: screen.code,
            children: [],
            parent: screen
        };
        screen.children.push(action);
    }

    return [...groups.values()].sort((left, right) => groupSort(left.code, groupOrder) - groupSort(right.code, groupOrder));
}

function groupSort(code: string, orders: Map<string, number>): number {
    const upper = code.toUpperCase();
    const fromApi = orders.get(upper);
    if (fromApi !== undefined) return fromApi;
    const index = GROUP_FALLBACK_ORDER.indexOf(upper);
    return index < 0 ? 1000 : (index + 1) * 10;
}

/** Mọi mã quyền của các nút hành động (nút lá) trong một nhánh cây — dùng cho tắt-lan theo cha. */
export function collectActionCodes(node: PermissionTreeNode): string[] {
    if (!node.children || node.children.length === 0) return [node.code];
    return node.children.flatMap(child => collectActionCodes(child));
}

/** Nút có phải nhóm/màn hình (có con) hay không. */
export function isContainerNode(node: PermissionTreeNode): boolean {
    return !!node.children && node.children.length > 0;
}

/**
 * Mã toàn bộ chuỗi tổ tiên (màn hình → nhóm) của một nút, từ gần tới xa.
 * Quyền chỉ có hiệu lực khi bản thân VÀ MỌI tổ tiên đều được cấp, nên khi bật một hành động phải gửi
 * kèm chuỗi này — gửi thiếu là hành động vừa bật bị kế thừa vô hiệu ngay (đã gặp với màn hoa hồng).
 */
export function ancestorCodes(node: PermissionTreeNode): string[] {
    const codes: string[] = [];
    let parent = node.parent ?? null;
    while (parent) {
        codes.push(parent.code);
        parent = parent.parent ?? null;
    }
    return codes;
}

/**
 * Mã cần cấp kèm khi bật một nút: chính nút nếu là nhóm/màn hình, cộng toàn bộ chuỗi tổ tiên.
 * Nút lá chỉ cần tổ tiên (mã của chính nó do nơi tick thêm vào).
 */
export function grantChainCodes(node: PermissionTreeNode): string[] {
    const own = isContainerNode(node) ? [node.code] : [];
    return [...own, ...ancestorCodes(node)];
}

/**
 * Khoá dịch của một nút cây quyền, suy từ `nameKey` API trả về.
 * API trả `Permission_<P###>` (hành động), `PermissionScreen_<MÃ>` (màn hình),
 * `PermissionGroup_<MÃ>` (nhóm) — các khoá này được quy về khoá i18n của UI
 * (`PERMISSION.ACTION.<P###>`, `PERMISSION.SCREEN.<MÃ>`, `PERMISSION.GROUP.<MÃ>`).
 * Khi API chưa trả `nameKey` thì suy theo mã nút. Trả null nếu không nhận dạng được.
 */
export function permissionLabelKey(node: PermissionTreeNode): string | null {
    const rawKey = (node.nameKey ?? '').trim();
    if (rawKey.startsWith('PermissionGroup_')) return `PERMISSION.GROUP.${rawKey.slice('PermissionGroup_'.length).toUpperCase()}`;
    if (rawKey.startsWith('PermissionScreen_')) return `PERMISSION.SCREEN.${rawKey.slice('PermissionScreen_'.length).toUpperCase()}`;
    if (rawKey.startsWith('Permission_')) return `PERMISSION.ACTION.${rawKey.slice('Permission_'.length).toUpperCase()}`;
    if (rawKey) return rawKey;

    const code = (node.code ?? '').trim().toUpperCase();
    if (node.kind === 'group') return `PERMISSION.GROUP.${code}`;
    if (node.kind === 'screen') return `PERMISSION.SCREEN.${code}`;
    if (/^P\d+$/.test(code)) return `PERMISSION.ACTION.${code}`;
    return null;
}
