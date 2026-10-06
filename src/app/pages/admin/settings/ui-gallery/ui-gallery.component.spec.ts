import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import {
    API_CONTROLLERS,
    API_EXTENSIONS,
    UI_COMPONENTS,
    UI_DIRECTIVES,
    UI_PIPES
} from './catalog.data';
import { UiGalleryComponent } from './ui-gallery.component';

/**
 * Chốt hành vi trang Thư viện nội bộ: catalog sinh từ mã nguồn phải có đủ mục, tìm kiếm lọc đúng,
 * đổi tab hiển thị đúng phần, và bảng DTO tra được field của request.
 */
describe('UiGalleryComponent', () => {
    let fixture: ComponentFixture<UiGalleryComponent>;
    let component: UiGalleryComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiGalleryComponent, TranslateModule.forRoot()],
            // Vài component con (input, modal, purge-bar...) đi qua AppService → AuthService → ApiService → HttpClient.
            providers: [provideHttpClient(), provideHttpClientTesting()]
        }).compileComponents();

        fixture = TestBed.createComponent(UiGalleryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    /** Component dùng OnPush: đổi thuộc tính trực tiếp trong test phải markForCheck mới render lại. */
    const refresh = () => {
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
    };

    it('hiển thị đủ số liệu tổng hợp từ catalog', () => {
        const stats = (fixture.nativeElement as HTMLElement).querySelectorAll('.gallery__stats .stat');

        expect(stats.length).toBe(7);
        expect(component.stats.components).toBe(UI_COMPONENTS.length);
        expect(component.stats.pipes).toBe(UI_PIPES.length);
        expect(component.stats.directives).toBe(UI_DIRECTIVES.length);
        expect(component.stats.extensions).toBe(API_EXTENSIONS.length);
        expect(component.stats.endpoints).toBeGreaterThan(100);
    });

    it('tab Giao diện liệt kê component theo nhóm và có bảng input', () => {
        const host = fixture.nativeElement as HTMLElement;
        const cards = host.querySelectorAll('.cards .card');

        expect(cards.length).toBeGreaterThanOrEqual(UI_COMPONENTS.length + UI_PIPES.length + UI_DIRECTIVES.length);
        expect(host.querySelector('.chip')!.textContent).toContain('app-');

        const button = UI_COMPONENTS.find((item) => item.class === 'ButtonComponent')!;
        expect(button.inputs.some((input) => input.name === 'variant')).toBeTrue();
        // Snippet lấy 3 input không bắt buộc đầu tiên theo đúng khai báo trong component.
        expect(component.snippet(button)).toContain('<app-button');
        expect(component.snippet(button)).toContain('[variant]="…"');
        expect(component.snippet(button)).toContain('[size]="…"');
    });

    it('từ khoá lọc component, pipe và helper', () => {
        component.keyword = 'checkbox';
        fixture.detectChanges();

        const form = component.componentsOf('form');
        expect(form.some((item) => item.class === 'CheckboxComponent')).toBeTrue();
        expect(component.filteredPipes.length).toBeLessThan(UI_PIPES.length);

        component.keyword = 'không-tồn-tại-xyz';
        fixture.detectChanges();
        expect(component.componentsOf('form').length).toBe(0);
    });

    it('tab API mở được controller và tra field của DTO request', () => {
        const host = fixture.nativeElement as HTMLElement;

        // Bấm tab API như người dùng (sự kiện giúp view OnPush được đánh dấu render lại).
        (host.querySelectorAll('.gtab')[1] as HTMLButtonElement).click();
        fixture.detectChanges();
        expect(host.querySelectorAll('.api').length).toBe(API_CONTROLLERS.length);

        // Bấm mở controller Auth rồi kiểm bảng endpoint.
        const index = API_CONTROLLERS.findIndex((controller) => controller.class === 'AuthController');
        expect(index).toBeGreaterThanOrEqual(0);
        (host.querySelectorAll('.api__head')[index] as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(host.querySelector('.api.is-open')).toBeTruthy();
        expect(host.querySelector('.tbl--api')).toBeTruthy();

        expect(component.fieldsOf('LoginRequest').some((field) => field.name === 'Username')).toBeTrue();
        expect(component.fieldsOf('Không-Có-DTO-Này').length).toBe(0);
    });

    it('pipe trả về câu lệnh dùng nhanh đúng tên pipe', () => {
        const pipe = UI_PIPES.find((item) => item.selector === 'appDate')!;

        expect(pipe).toBeTruthy();
        expect(component.snippet(pipe).startsWith('{{ value | appDate')).toBeTrue();
        expect(component.meta(pipe)).toContain('transform(');
    });

    it('mọi mục trong catalog đều có đường dẫn file để dev mở lại', () => {
        const missing = [...UI_COMPONENTS, ...UI_PIPES, ...UI_DIRECTIVES]
            .filter((item) => !item.path || !item.path.endsWith('.ts'));

        expect(missing).toEqual([]);
    });
});
