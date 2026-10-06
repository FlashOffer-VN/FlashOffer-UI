import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AppService } from '@core/services/app.service';
import { Permission } from '@core/models/permission.model';
import { AdminUser, UserAccountScope } from '@core/models/user.model';

import { AdminUserListComponent } from './user-list.component';

/**
 * Chốt hành vi màn quản lý người dùng ở mức component: tab tài khoản thường/quản trị gửi đúng tham số
 * `scope` lên API, nút tạo tài khoản quản trị và nút sửa chỉ hiện khi có quyền, và nút cấp lại mật khẩu
 * ẩn với tài khoản quản trị hoặc tài khoản thiếu SĐT.
 */
describe('AdminUserListComponent', () => {
    let fixture: ComponentFixture<AdminUserListComponent>;
    let component: AdminUserListComponent;

    const granted = new Set<string>();
    const requestedScopes: (UserAccountScope | undefined)[] = [];

    const users: AdminUser[] = [
        { id: 'u1', username: 'khach01', fullName: 'Khách 01', phone: '0900000001', role: 'Customer', isActive: true },
        { id: 'u2', username: 'quantri01', fullName: 'Quản trị 01', phone: '0900000002', role: 'Admin', isActive: true }
    ];

    const fakeAppService = {
        trans: (key: string) => key,
        permissionService: { has: (code: string) => granted.has(code) },
        userService: {
            getData: (_page: number, _size: number, _search: string, _field: string | undefined, scope?: UserAccountScope) => {
                requestedScopes.push(scope);
                return of({
                    success: true,
                    message: 'ok',
                    data: users,
                    pageNumber: 1,
                    pageSize: 10,
                    totalPages: 1,
                    totalCount: users.length,
                    hasPreviousPage: false,
                    hasNextPage: false,
                    timestamp: ''
                });
            }
        },
        showError: () => undefined,
        showSuccess: () => undefined,
        modal: { confirm: () => Promise.resolve(false) }
    };

    beforeEach(async () => {
        granted.clear();
        requestedScopes.length = 0;

        await TestBed.configureTestingModule({
            imports: [AdminUserListComponent, TranslateModule.forRoot()],
            providers: [{ provide: AppService, useValue: fakeAppService }]
        }).compileComponents();

        fixture = TestBed.createComponent(AdminUserListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('mặc định mở tab tài khoản thường và gửi scope tương ứng lên API', () => {
        expect(component.activeScope).toBe('Customer');
        expect(requestedScopes).toEqual(['Customer']);
    });

    it('đổi sang tab tài khoản quản trị thì nạp lại danh sách với scope Admin', () => {
        component.onTabChange('Admin');
        fixture.detectChanges();

        expect(component.activeScope).toBe('Admin');
        expect(requestedScopes).toEqual(['Customer', 'Admin']);
    });

    it('đổi lại tab đang chọn thì không gọi lại API', () => {
        component.onTabChange('Customer');

        expect(requestedScopes).toEqual(['Customer']);
    });

    it('nút tạo tài khoản quản trị và nút sửa chỉ hiện khi có quyền', () => {
        expect(component.canCreateAdmin()).toBeFalse();
        expect(component.canEdit()).toBeFalse();

        granted.add(Permission.CreateAdminAccount);
        granted.add(Permission.UpdateUserInfo);

        expect(component.canCreateAdmin()).toBeTrue();
        expect(component.canEdit()).toBeTrue();
    });

    it('nút cấp lại mật khẩu cần quyền, không dành cho tài khoản quản trị và cần có SĐT', () => {
        granted.add(Permission.ResetUserPassword);

        expect(component.canResetPassword(users[0])).toBeTrue();
        expect(component.canResetPassword(users[1])).toBeFalse(); // tài khoản quản trị
        expect(component.canResetPassword({ ...users[0], phone: undefined })).toBeFalse();

        granted.clear();
        expect(component.canResetPassword(users[0])).toBeFalse();
    });

    it('mở form sửa thì truyền đúng tài khoản, mở form tạo thì bỏ trống tài khoản', () => {
        component.openEdit(users[0]);
        expect(component.formVisible).toBeTrue();
        expect(component.formUserId).toBe('u1');

        component.onFormVisibilityChange(false);
        component.openCreate();

        expect(component.formVisible).toBeTrue();
        expect(component.formUserId).toBeNull();
    });
});
