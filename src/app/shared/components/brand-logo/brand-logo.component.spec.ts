import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandLogoComponent, BrandLogoSize } from './brand-logo.component';

/**
 * Chốt các biến thể của chữ thương hiệu dùng ở trang hướng người dùng: tên, dòng mô tả, cỡ và nền tối.
 */
describe('BrandLogoComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [BrandLogoComponent] }).compileComponents();
    });

    function create(inputs: Partial<BrandLogoComponent> = {}): ComponentFixture<BrandLogoComponent> {
        const fixture = TestBed.createComponent(BrandLogoComponent);
        Object.assign(fixture.componentInstance, inputs);
        fixture.detectChanges();
        return fixture;
    }

    it('mặc định hiện tên thương hiệu kèm tia chớp, không có dòng mô tả', () => {
        const fixture = create();
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector('.brand__name')!.textContent).toContain('Kindi');
        expect(element.querySelector('.brand__mark i')).toBeTruthy();
        expect(element.querySelector('.brand__tagline')).toBeNull();
    });

    it('có tagline thì hiện dòng mô tả ngắn', () => {
        const fixture = create({ tagline: 'Nền tảng kết nối SME' });

        expect((fixture.nativeElement as HTMLElement).querySelector('.brand__tagline')!.textContent)
            .toContain('Nền tảng kết nối SME');
    });

    for (const size of ['sm', 'lg', 'xl'] as BrandLogoSize[]) {
        it(`cỡ ${size} đổi class để scale chữ và ô vuông`, () => {
            const fixture = create({ size });

            expect((fixture.nativeElement as HTMLElement).querySelector('.brand')!.classList)
                .toContain(`brand--${size}`);
        });
    }

    it('variant onDark dùng cho nền tối', () => {
        const fixture = create({ variant: 'onDark' });

        expect((fixture.nativeElement as HTMLElement).querySelector('.brand')!.classList)
            .toContain('brand--on-dark');
    });

    it('bật echo thì có lớp bóng mờ phía sau và chữ chính mờ dần', () => {
        const fixture = create({ echo: true });
        const host = fixture.nativeElement as HTMLElement;

        expect(host.querySelector('.brand')!.classList).toContain('brand--echo');
        expect(host.querySelector('.brand__echo')!.textContent).toContain('Kindi');
        expect(getComputedStyle(host.querySelector('.brand__echo')!).animationName).toContain('brand-echo');
        expect(getComputedStyle(host.querySelector('.brand__name')!).animationName).toContain('brand-front');
    });

    it('không bật echo thì không có lớp bóng', () => {
        const fixture = create();

        expect((fixture.nativeElement as HTMLElement).querySelector('.brand__echo')).toBeNull();
    });

    it('tên thương hiệu đổi được (mặc định là Kindi)', () => {
        const fixture = create({ text: 'Kindi' });

        expect((fixture.nativeElement as HTMLElement).querySelector('.brand__name')!.textContent).toContain('Kindi');
    });
});
