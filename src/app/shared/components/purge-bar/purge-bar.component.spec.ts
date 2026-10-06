import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { AppService } from '@core/services/app.service';
import { PurgeRequest } from '@core/models/trash.model';

import { PurgeBarComponent } from './purge-bar.component';

/**
 * Chốt hành vi thanh xoá vĩnh viễn dùng ở màn "Đã xoá": chỉ hiện khi có quyền của nghiệp vụ, gửi đúng
 * điều kiện xoá (khoảng ngày hoặc danh sách id), luôn hỏi xác nhận trước, và không gọi API khi người
 * dùng bỏ qua xác nhận.
 */
describe('PurgeBarComponent', () => {
    let fixture: ComponentFixture<PurgeBarComponent>;
    let component: PurgeBarComponent;

    const granted = new Set<string>();
    const purgeCalls: { entity: string; body: PurgeRequest }[] = [];
    const errors: string[] = [];
    let confirmResult = true;
    let purgeError: { error?: { message?: string } } | null = null;

    const fakeAppService = {
        trans: (key: string) => key,
        permissionService: { has: (code: string) => granted.has(code) },
        modal: { confirm: () => Promise.resolve(confirmResult) },
        showSuccess: () => undefined,
        showError: (message: string) => errors.push(message),
        trashService: {
            purge: (entity: string, body: PurgeRequest) => {
                purgeCalls.push({ entity, body });
                return purgeError ? throwError(() => purgeError) : of({ data: { entityName: entity, deletedCount: 2 } });
            }
        }
    };

    beforeEach(async () => {
        granted.clear();
        purgeCalls.length = 0;
        errors.length = 0;
        confirmResult = true;
        purgeError = null;

        await TestBed.configureTestingModule({
            imports: [PurgeBarComponent, TranslateModule.forRoot()],
            providers: [{ provide: AppService, useValue: fakeAppService }]
        }).compileComponents();

        fixture = TestBed.createComponent(PurgeBarComponent);
        component = fixture.componentInstance;
        component.entity = 'partners';
        fixture.detectChanges();
    });

    it('chỉ cho xoá vĩnh viễn khi có quyền của nghiệp vụ', () => {
        expect(component.canPurge()).toBeFalse();

        granted.add('P158');

        expect(component.canPurge()).toBeTrue();
    });

    it('chưa chọn khoảng ngày thì không xoá được theo khoảng ngày', () => {
        expect(component.hasRange()).toBeFalse();

        component.onRangeChange({ from: '2026-10-01', to: '2026-10-06' });

        expect(component.hasRange()).toBeTrue();
        expect(component.fromDate).toBe('2026-10-01');
        expect(component.toDate).toBe('2026-10-06');
    });

    it('xoá theo khoảng ngày thì gửi fromDate/toDate lên API', async () => {
        component.onRangeChange({ from: '2026-10-01', to: '2026-10-06' });

        component.purgeByRange();
        await fixture.whenStable();

        expect(purgeCalls).toEqual([
            { entity: 'partners', body: { fromDate: '2026-10-01', toDate: '2026-10-06' } }
        ]);
    });

    it('xoá theo lựa chọn thì gửi danh sách id đang tick', async () => {
        component.selectedIds = ['a', 'b'];

        component.purgeSelected();
        await fixture.whenStable();

        expect(purgeCalls).toEqual([{ entity: 'partners', body: { ids: ['a', 'b'] } }]);
    });

    it('không chọn dòng nào thì không gọi API', () => {
        component.selectedIds = [];

        component.purgeSelected();

        expect(purgeCalls.length).toBe(0);
    });

    it('bỏ qua xác nhận thì không xoá', async () => {
        confirmResult = false;
        component.selectedIds = ['a'];

        component.purgeSelected();
        await fixture.whenStable();

        expect(purgeCalls.length).toBe(0);
    });

    it('API báo lỗi nghiệp vụ thì hiện nguyên văn thông báo của API', async () => {
        purgeError = { error: { message: 'Đối tác còn dữ liệu liên kết' } };
        component.selectedIds = ['a'];

        component.purgeSelected();
        await fixture.whenStable();

        expect(errors).toEqual(['Đối tác còn dữ liệu liên kết']);
        expect(component.isPurging).toBeFalse();
    });

    it('nút xoá theo lựa chọn chỉ hiện khi màn cha có tick chọn dòng', () => {
        granted.add('P158');
        expect(component.showSelection).toBeFalse();

        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('app-button').length).toBe(1);

        component.showSelection = true;
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('app-button').length).toBe(2);
    });
});
