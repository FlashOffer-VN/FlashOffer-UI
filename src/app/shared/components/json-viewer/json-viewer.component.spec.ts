import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { JsonViewerComponent } from './json-viewer.component';

/**
 * Chốt hành vi khung xem JSON: có dòng/tô màu khi là JSON, hiển thị nguyên văn khi không phải JSON,
 * và không render gì khi giá trị rỗng.
 */
describe('JsonViewerComponent', () => {
    let fixture: ComponentFixture<JsonViewerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [JsonViewerComponent, TranslateModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(JsonViewerComponent);
    });

    function render(value: string | null): HTMLElement {
        fixture.componentRef.setInput('value', value);
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    }

    it('hiện dấu gạch khi không có giá trị', () => {
        const element = render(null);

        expect(element.querySelector('.jv__empty')?.textContent?.trim()).toBe('—');
        expect(element.querySelector('.jv__body')).toBeNull();
    });

    it('in đẹp JSON và tô màu theo kiểu dữ liệu', () => {
        const element = render('{"FullName":"Chị Chi","Role":3,"IsAdmin":false,"Zalo":null}');

        expect(element.querySelectorAll('.jv__line').length).toBe(6);
        expect(element.querySelectorAll('.jv__t--key').length).toBe(4);
        expect(element.querySelector('.jv__t--key')?.textContent).toBe('"FullName":');
        expect(element.querySelector('.jv__t--string')?.textContent).toBe('"Chị Chi"');
        expect(element.querySelector('.jv__t--number')?.textContent).toBe('3');
        expect(element.querySelector('.jv__t--boolean')?.textContent).toBe('false');
        expect(element.querySelector('.jv__t--null')?.textContent).toBe('null');
    });

    it('hiển thị nguyên văn với dữ liệu không phải JSON', () => {
        const element = render('Khôi phục tài khoản đã xoá (SĐT: 0987654321)');

        expect(element.querySelector('.jv__body--raw')).not.toBeNull();
        expect(element.querySelector('.jv__body')?.textContent).toContain('Khôi phục tài khoản đã xoá');
        expect(element.querySelector('.jv__t--key')).toBeNull();
    });

    it('hiển thị đúng nội dung escape cho giá trị chứa thẻ HTML', () => {
        const element = render('{"ProductName":"<b>x</b>"}');

        // Interpolation nên thẻ được escape thành text, không tạo phần tử <b>.
        expect(element.querySelector('.jv__body b')).toBeNull();
        expect(element.querySelector('.jv__body')?.textContent).toContain('"<b>x</b>"');
    });

    it('có nút sao chép và không lỗi khi bấm', () => {
        const element = render('{"a":1}');
        const button = element.querySelector('.jv__copy') as HTMLButtonElement;

        expect(button).withContext('nút sao chép phải có').not.toBeNull();
        expect(() => button.click()).not.toThrow();
    });
});
