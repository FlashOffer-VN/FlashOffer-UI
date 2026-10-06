import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { RadioGroupComponent, RadioOption } from './radio-group.component';

@Component({
    standalone: true,
    imports: [RadioGroupComponent, ReactiveFormsModule],
    template: `<app-radio-group [formControl]="control" label="Vai trò" [options]="options" [orientation]="orientation" />`
})
class HostComponent {
    control = new FormControl<string | null>(null);
    orientation: 'vertical' | 'horizontal' = 'vertical';
    options: RadioOption[] = [
        { value: 'user', label: 'Người dùng' },
        { value: 'admin', label: 'Quản trị', hint: 'Toàn quyền nghiệp vụ' },
        { value: 'locked', label: 'Bị khoá', disabled: true }
    ];
}

/** Chốt hành vi nhóm chọn một dùng chung: giá trị, danh sách, khoá và phản hồi ra ngoài. */
describe('RadioGroupComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    });

    function create(): { fixture: ComponentFixture<HostComponent>; group: RadioGroupComponent; inputs: HTMLInputElement[] } {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();

        const group = fixture.debugElement.query(By.directive(RadioGroupComponent)).componentInstance as RadioGroupComponent;

        return { fixture, group, inputs: Array.from(fixture.nativeElement.querySelectorAll('input[type="radio"]')) };
    }

    it('hiện đủ lựa chọn và tất cả dùng chung một name', () => {
        const { inputs } = create();

        expect(inputs.length).toBe(3);
        expect(new Set(inputs.map(input => input.name)).size).toBe(1);
        expect(inputs[1].getAttribute('id')).toContain('admin');
    });

    it('chọn một lựa chọn thì cập nhật form và phát valueChange', () => {
        const { fixture, group, inputs } = create();
        const emitted: string[] = [];
        group.valueChange.subscribe(value => emitted.push(value));

        inputs[1].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBe('admin');
        expect(emitted).toEqual(['admin']);
        expect(inputs[1].checked).toBeTrue();
        expect(inputs[0].checked).toBeFalse();
    });

    it('form đặt giá trị thì đúng lựa chọn được chọn', () => {
        const { fixture, inputs } = create();

        fixture.componentInstance.control.setValue('user');
        fixture.detectChanges();

        expect(inputs[0].checked).toBeTrue();
        expect(inputs[1].checked).toBeFalse();
    });

    it('khoá cả nhóm qua form thì không chọn được', () => {
        const { fixture, inputs } = create();

        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        expect(inputs.every(input => input.disabled)).toBeTrue();

        inputs[0].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBeNull();
    });

    it('lựa chọn bị khoá riêng thì bỏ qua', () => {
        const { fixture, group, inputs } = create();

        group.select(group.options[2]);
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBeNull();
        expect(inputs[2].disabled).toBeTrue();
    });

    it('kiểu card: mỗi lựa chọn là một thẻ, chọn thì thẻ được tô', () => {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.componentInstance.orientation = 'vertical';
        fixture.detectChanges();

        const group = fixture.debugElement.query(By.directive(RadioGroupComponent)).componentInstance as RadioGroupComponent;
        group.appearance = 'card';
        fixture.detectChanges();

        const host = fixture.nativeElement as HTMLElement;
        expect(host.querySelector('.rg')!.classList).toContain('rg--card');

        (host.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement).click();
        fixture.detectChanges();

        expect(host.querySelectorAll('.rg__option')[1].classList).not.toContain('is-disabled');
        expect((host.querySelectorAll('input[type="radio"]')[1] as HTMLInputElement).checked).toBeTrue();
    });

    it('chấm chọn nằm trong span riêng để vẽ gradient', () => {
        const { fixture } = create();

        expect((fixture.nativeElement as HTMLElement).querySelector('.rg__dot-inner')).toBeTruthy();
    });

    it('xếp ngang khi orientation là horizontal', () => {
        const { fixture } = create();

        fixture.componentInstance.orientation = 'horizontal';
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.rg').classList).toContain('rg--horizontal');
    });
});
