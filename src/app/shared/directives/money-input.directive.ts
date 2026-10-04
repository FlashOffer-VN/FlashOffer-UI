// src/app/shared/directives/money-input.directive.ts
import {
    AfterViewInit,
    Directive,
    ElementRef,
    HostListener,
    Optional,
    Self
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { MoneyHelper } from '@core/utils/money';

/**
 * Định dạng số tiền ngay trong ô nhập viết tay: chỉ nhận chữ số và chèn dấu chấm phân cách hàng
 * nghìn khi gõ, dùng cho những chỗ không dựng bằng `app-input`.
 *
 * Dùng: `<input appMoneyInput formControlName="targetPrice">`. Giá trị đưa vào form vẫn là số
 * như trước nên phần kiểm tra và payload gửi lên không đổi.
 */
@Directive({
    selector: 'input[appMoneyInput]',
    standalone: true
})
export class MoneyInputDirective implements AfterViewInit {
    private focused = false;

    constructor(
        private _el: ElementRef<HTMLInputElement>,
        @Optional() @Self() private _ngControl?: NgControl
    ) {
        // Ô type="number" không chứa được dấu phân cách: gặp dấu là trình duyệt xoá trắng giá trị,
        // nên chuyển sang text và mượn inputmode để điện thoại vẫn hiện bàn phím số.
        const input = this._el.nativeElement;
        if (input.type === 'number') {
            input.type = 'text';
        }
        input.setAttribute('inputmode', 'numeric');
    }

    ngAfterViewInit(): void {
        // Ô nhập đang hiện số trần, chỉ cần định dạng lại phần hiển thị.
        this._renderDisplay();
    }

    @HostListener('input')
    onInput(): void {
        const input = this._el.nativeElement;
        const caretAt = input.selectionStart ?? input.value.length;
        const digitsBeforeCaret = MoneyHelper.toDigits(input.value.slice(0, caretAt)).length;
        // Bỏ số 0 vô nghĩa ở đầu, trừ khi người dùng chỉ gõ mỗi số 0.
        const digits = MoneyHelper.toDigits(input.value).replace(/^0+(?=\d)/, '');

        this._renderDisplay(digits);
        this._emit(digits);
        this._keepCaret(input, digitsBeforeCaret);
    }

    @HostListener('focus')
    onFocus(): void {
        this.focused = true;
        // Định dạng lại khi vào ô để giá trị do form ghi từ nơi khác cũng hiện đúng dấu phân cách.
        this._renderDisplay();
    }

    @HostListener('blur')
    onBlur(): void {
        this.focused = false;
        this._renderDisplay();
    }

    private _renderDisplay(digits?: string): void {
        const value = digits ?? MoneyHelper.toDigits(this._el.nativeElement.value);
        this._el.nativeElement.value = MoneyHelper.format(value);
    }

    /** Trả về form dạng số như ô nhập số thường; rỗng thì trả null để không phá luật bắt buộc. */
    private _emit(digits: string): void {
        this._ngControl?.control?.setValue(digits === '' ? null : Number(digits), {
            emitModelToViewChange: false,
            emitViewToModelChange: false
        });
    }

    /** Giữ nguyên vị trí nháy sau khi chèn dấu phân cách. */
    private _keepCaret(input: HTMLInputElement, digitsBeforeCaret: number): void {
        setTimeout(() => {
            if (!this.focused) return;
            const position = MoneyHelper.caretPosition(this._el.nativeElement.value, digitsBeforeCaret);
            input.setSelectionRange(position, position);
        }, 0);
    }
}
