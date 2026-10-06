import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Một lựa chọn của nhóm radio. */
export interface RadioOption {
    /** Giá trị lưu vào form. */
    value: string;

    /** Nhãn hiển thị. */
    label: string;

    /** Ghi chú nhỏ dưới nhãn (tuỳ chọn). */
    hint?: string;

    /** Khoá riêng từng lựa chọn (tuỳ chọn). */
    disabled?: boolean;
}

/**
 * Nhóm chọn một (radio) dùng chung, thay cho `<input type="radio">` trần rải khắp app.
 *
 * - Dùng được với `[(ngModel)]`, `formControl`, `formControlName` (ControlValueAccessor).
 * - Vẫn là input radio thật (ẩn) nên bàn phím (mũi tên) + trình đọc màn hình hoạt động như input gốc.
 *
 * Cách dùng:
 * ```html
 * <app-radio-group label="Vai trò" [options]="roleOptions" [(ngModel)]="form.role" />
 * ```
 */
@Component({
    selector: 'app-radio-group',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './radio-group.component.html',
    styleUrls: ['./radio-group.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioGroupComponent),
            multi: true
        }
    ]
})
export class RadioGroupComponent implements ControlValueAccessor {
    private static nextId = 0;

    /** Nhãn của cả nhóm (tuỳ chọn). */
    @Input() label?: string;

    /** Ghi chú nhỏ dưới nhãn nhóm (tuỳ chọn). */
    @Input() hint?: string;

    /** Danh sách lựa chọn. */
    @Input() options: RadioOption[] = [];

    /** Xếp dọc (mặc định) hay ngang. */
    @Input() orientation: 'vertical' | 'horizontal' = 'vertical';

    /** Khoá cả nhóm (kết hợp với trạng thái khoá do form đặt). */
    @Input() disabled = false;

    /** Tên chung của các input radio — cố định theo thứ tự tạo để test ổn định. */
    @Input() name = `app-radio-group-${RadioGroupComponent.nextId++}`;

    /** Phát khi người dùng đổi lựa chọn (ngoài `ngModel`/form vẫn dùng được). */
    @Output() valueChange = new EventEmitter<string>();

    value: string | null = null;

    private _onChange: (value: string) => void = () => undefined;
    private _onTouched: () => void = () => undefined;

    /** Id của một lựa chọn, dùng cho `for=` và aria-describedby. */
    optionId(option: RadioOption): string {
        return `${this.name}-${option.value}`;
    }

    /** Người dùng chọn một lựa chọn. */
    onSelect(option: RadioOption): void {
        if (this.disabled || option.disabled) return;

        this.value = option.value;
        this._onChange(option.value);
        this._onTouched();
        this.valueChange.emit(option.value);
    }

    writeValue(value: string | null | undefined): void {
        this.value = value ?? null;
    }

    registerOnChange(fn: (value: string) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
