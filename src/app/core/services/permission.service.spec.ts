import { PermissionTreeNode } from '@core/models/permission.model';
import { permissionLabel, permissionLabelKey, permissionMeta } from './permission.service';

/**
 * Tên quyền hiển thị ở màn phân quyền do API dịch sẵn theo ngôn ngữ trong token — UI chỉ việc hiển thị,
 * khoá dịch của UI chỉ còn là dự phòng. Chốt lại để thêm quyền mới không phải bổ sung bản dịch ở UI.
 */
describe('permissionLabel', () => {
    /** Giả lập TranslateService: chỉ biết vài khoá, khoá lạ trả về chính nó. */
    const translate = {
        instant: (key: string) => (key === 'PERMISSION.ACTION.P020' ? 'Xem danh sách người dùng' : key)
    };

    function node(partial: Partial<PermissionTreeNode>): PermissionTreeNode {
        return { code: 'P020', kind: 'action', children: [], ...partial };
    }

    it('ưu tiên tên API đã dịch theo ngôn ngữ trong token', () => {
        const value = permissionLabel(
            node({ name: 'Xem danh sách người dùng', nameKey: 'Permission_P020' }),
            translate);

        expect(value).toBe('Xem danh sách người dùng');
    });

    it('API chưa trả tên thì rơi về khoá dịch của UI', () => {
        const value = permissionLabel(node({ name: null, nameKey: 'Permission_P020' }), translate);

        expect(value).toBe('Xem danh sách người dùng');
    });

    it('không có cả tên API lẫn khoá dịch thì in mã quyền thay vì để trống', () => {
        const value = permissionLabel(node({ code: 'P157', kind: 'action', name: '', nameKey: null }), translate);

        expect(value).toBe('P157');
    });

    it('mã nhóm/màn hình vẫn suy được khoá dịch khi API không trả nameKey', () => {
        expect(permissionLabelKey(node({ code: 'ADMIN', kind: 'group', nameKey: null }))).toBe('PERMISSION.GROUP.ADMIN');
        expect(permissionLabelKey(node({ code: 'USERS', kind: 'screen', nameKey: null }))).toBe('PERMISSION.SCREEN.USERS');
    });

    it('metadata gồm mã quyền, route màn hình và endpoint API', () => {
        const value = permissionMeta(node({
            code: 'P155',
            route: '/admin/users',
            endpoints: 'PUT /api/v1/Users/{id}'
        }));

        expect(value).toBe('P155 · /admin/users · PUT /api/v1/Users/{id}');
    });

    it('metadata bỏ qua phần rỗng', () => {
        expect(permissionMeta(node({ code: 'P157', route: null, endpoints: '  ' }))).toBe('P157');
    });
});
