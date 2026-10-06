import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CheckboxComponent } from './checkbox.component';

@Component({
    standalone: true,
    imports: [CheckboxComponent, ReactiveFormsModule],
    template: `<app-checkbox [formControl]="control" label="Đang hoạt động" hint="Tài khoản còn dùng được" />`
})
class HostComponent {
    control = new FormControl<boolean>(false);
}

/** Chốt hành vi ô tick dùng chung: giá trị, khoá, nửa vời và phản hồi ra ngoài. */
describe('CheckboxComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    });

    function create(): { fixture: ComponentFixture<HostComponent>; checkbox: CheckboxComponent; input: HTMLInputElement } {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();

        const checkbox = fixture.debugElement.query(By.directive(CheckboxComponent)).componentInstance as CheckboxComponent;

        return { fixture, checkbox, input: fixture.nativeElement.querySelector('input[type="checkbox"]') };
    }

    it('hiện nhãn, ghi chú và chưa tick khi giá trị ban đầu là false', () => {
        const { input } = create();

        expect(input.checked).toBeFalse();
        expect((input.closest('label') as HTMLElement).textContent).toContain('Đang hoạt động');
        expect((input.closest('label') as HTMLElement).textContent).toContain('Tài khoản còn dùng được');
    });

    it('tick thì cập nhật form và phát checkedChange', () => {
        const { fixture, checkbox, input } = create();
        const emitted: boolean[] = [];
        checkbox.checkedChange.subscribe(value => emitted.push(value));

        input.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBeTrue();
        expect(emitted).toEqual([true]);
    });

    it('form đặt giá trị true thì ô được tick', () => {
        const { fixture, input } = create();

        fixture.componentInstance.control.setValue(true);
        fixture.detectChanges();

        expect(input.checked).toBeTrue();
    });

    it('khoá qua form thì không tick được nữa', () => {
        const { fixture, input } = create();

        fixture.componentInstance.control.disable();
        fixture.detectChanges();

        expect(input.disabled).toBeTrue();

        input.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBeFalse();
    });

    it('trạng thái nửa vời hiện gạch ngang, bấm vào thì thành tick thật', () => {
        const { fixture, checkbox, input } = create();

        checkbox.indeterminate = true;
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.cb__box').classList).toContain('is-indeterminate');
        expect(input.getAttribute('aria-checked')).toBe('mixed');

        input.click();
        fixture.detectChanges();

        expect(checkbox.indeterminate).toBeFalse();
        expect(fixture.nativeElement.querySelector('.cb__box').classList).not.toContain('is-indeterminate');
        expect(fixture.componentInstance.control.value).toBeTrue();
    });

    it('setDisabledState của form khoá cả ô tick', () => {
        const { fixture, checkbox } = create();

        checkbox.setDisabledState(true);
        fixture.detectChanges();

        expect(checkbox.disabled).toBeTrue();
        expect(fixture.nativeElement.querySelector('.cb').classList).toContain('is-disabled');
    });
});
