import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingComponent, LoadingType } from './loading.component';

/**
 * Chốt quy tắc hiển thị khối tải: mặc định là khối trang (canh giữa, có chiều cao tối thiểu nên không dính
 * sát mép trên), trong ô bảng thì dùng `inline`, và mỗi kiểu tải vẽ đúng thứ của nó.
 */
describe('LoadingComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [LoadingComponent] }).compileComponents();
    });

    function create(inputs: Partial<LoadingComponent> = {}): ComponentFixture<LoadingComponent> {
        const fixture = TestBed.createComponent(LoadingComponent);
        Object.assign(fixture.componentInstance, inputs);
        fixture.detectChanges();
        return fixture;
    }

    function block(fixture: ComponentFixture<LoadingComponent>): HTMLElement | null {
        return fixture.nativeElement.querySelector('.app-loading');
    }

    it('mặc định là spinner và là khối tải trang có chiều cao tối thiểu', () => {
        const fixture = create();

        expect(fixture.componentInstance.type).toBe('spinner');
        expect(block(fixture)).toBeTruthy();
        expect(block(fixture)!.getAttribute('style')).toContain('min-height: 40vh');
        expect(fixture.nativeElement.querySelector('.spinner')).toBeTruthy();
    });

    it('inline thì không chiếm chiều cao (dùng trong ô bảng/khối nhỏ)', () => {
        const fixture = create({ inline: true });

        expect(block(fixture)!.classList).toContain('app-loading--inline');
        expect(block(fixture)!.getAttribute('style') ?? '').not.toContain('min-height');
    });

    it('chiều cao tối thiểu đổi được theo từng màn', () => {
        const fixture = create({ minHeight: '60vh' });

        expect(block(fixture)!.getAttribute('style')).toContain('min-height: 60vh');
    });

    it('kiểu skeleton giữ chỗ bằng 3 dòng', () => {
        const fixture = create({ type: 'skeleton' as LoadingType });

        expect(fixture.nativeElement.querySelectorAll('.skeleton-line').length).toBe(3);
    });

    it('kiểu dots hiện đủ 6 chấm', () => {
        const fixture = create({ type: 'dots' as LoadingType });

        expect(fixture.nativeElement.querySelectorAll('.dot').length).toBe(6);
    });

    it('fullScreen là overlay phủ toàn màn hình, không dùng khối tải trang', () => {
        const fixture = create({ fullScreen: true });

        expect(fixture.nativeElement.querySelector('.fixed.inset-0')).toBeTruthy();
        expect(block(fixture)).toBeNull();
    });
});
