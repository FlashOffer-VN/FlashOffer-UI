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

    it('mặc định là dots và là khối tải trang có chiều cao tối thiểu', () => {
        const fixture = create();

        expect(fixture.componentInstance.type).toBe('dots');
        expect(block(fixture)).toBeTruthy();
        expect(block(fixture)!.getAttribute('style')).toContain('min-height: 40vh');
        expect(fixture.nativeElement.querySelectorAll('.dot').length).toBe(6);
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

    it('spinner giữ class gốc và có cạnh trên khác màu (thấy rõ đang quay)', () => {
        const fixture = create({ type: 'spinner' as LoadingType });
        const spinner = fixture.nativeElement.querySelector('.spinner') as HTMLElement;

        expect(spinner).toBeTruthy();
        // Binding phải dùng [ngClass]: dùng [class] sẽ XOÁ class .spinner => mất animation + bo tròn.
        expect(spinner.classList).toContain('spinner');
        expect(spinner.classList).toContain('spinner-md');

        // Angular đổi tên keyframes trong style component (thêm tiền tố _ngcontent-...) nên so bằng chứa.
        const style = getComputedStyle(spinner);
        expect(style.animationName).toContain('spin');
        expect(parseFloat(style.borderTopWidth)).toBeGreaterThan(0);
        expect(style.borderTopStyle).toBe('solid');
    });

    it('dots giữ class .dot nên vẫn có hiệu ứng nhảy', () => {
        const fixture = create({ type: 'dots' as LoadingType });
        const dots = fixture.nativeElement.querySelectorAll('.dot');

        expect(dots.length).toBe(6);
        expect((dots[0] as HTMLElement).classList).toContain('dot');
        expect(getComputedStyle(dots[0] as HTMLElement).animationName).toContain('flow');
    });

    it('kiểu logo giữ class của bộ icon (không bị binding ghi đè)', () => {
        const fixture = create({ type: 'logo' as LoadingType });
        const icon = fixture.nativeElement.querySelector('.logo-icon i') as HTMLElement;

        expect(icon.classList).toContain('fa-solid');
        expect(icon.classList).toContain('text-5xl');
        expect(icon.classList).toContain('text-primary');
    });

    it('fullScreen: overlay wordmark 2 lớp (bóng mờ + chữ) và vệt sáng tiến trình', () => {
        const fixture = create({ fullScreen: true });
        const host = fixture.nativeElement as HTMLElement;

        expect(host.querySelector('.fs-loading')).toBeTruthy();
        expect(host.querySelector('app-brand-logo')).toBeTruthy();
        expect(host.querySelector('.brand__echo')).toBeTruthy();
        expect(host.querySelector('.fs-loading__bar-fill')).toBeTruthy();
        expect(block(fixture)).toBeNull();
    });

    it('kiểu logo hiện tia chớp thương hiệu (dùng cho tải cả trang)', () => {
        const fixture = create({ type: 'logo' as LoadingType });

        expect(fixture.nativeElement.querySelector('.logo-icon i')).toBeTruthy();
        expect(fixture.nativeElement.querySelectorAll('.dot').length).toBe(0);
    });
});
