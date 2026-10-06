import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Ô tick dùng chung, thay cho `<input type="checkbox">` trần rải khắp app.
 *
 * - Dùng được với `[(ngModel)]`, `formControl`, `formControlName` (ControlValueAccessor).
 * - Có nhãn, ghi chú, trạng thái nửa vời (indeterminate) và trạng thái khoá.
 * - Vẫn là input thật (ẩn) nên bàn phím + trình đọc màn hình hoạt động như input gốc.
 *
 * Cách dùng:
 * ```html
 * <app-checkbox label="Đang hoạt động" [(ngModel)]="form.isActive" />
 * <app-checkbox label="Chọn tất cả" [indeterminate]="someSelected" (checkedChange)="toggleAll($event)" />
 * ```
 */
@Component({
    selector: 'app-checkbox',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckboxComponent),
            multi: true
        }
    ]
})
export class CheckboxComponent implements ControlValueAccessor {
    private static nextId = 0;

    /** Nhãn hiển thị bên phải ô tick. */
    @Input() label?: string;

    /** Ghi chú nhỏ dưới nhãn (tuỳ chọn). */
    @Input() hint?: string;

    /** Cỡ ô tick: `md` cho form, `sm` cho danh sách dày. */
    @Input() size: 'sm' | 'md' = 'md';

    /** Trạng thái nửa vời — dùng cho ô "chọn tất cả" khi mới tick một phần. */
    @Input() indeterminate = false;

    /** Khoá ô tick (kết hợp với trạng thái khoá do form đặt). */
    @Input() disabled = false;

    /** Nhãn cho trình đọc màn hình khi ô không có nhãn nhìn thấy được (ví dụ checkbox chọn dòng trong bảng). */
    @Input() ariaLabel = '';

    /** Id của input ẩn — cố định theo thứ tự tạo để test/`for=` ổn định. */
    @Input() inputId = `app-checkbox-${CheckboxComponent.nextId++}`;

    /** Phát khi người dùng đổi giá trị (ngoài `ngModel`/form vẫn dùng được). */
    @Output() checkedChange = new EventEmitter<boolean>();

    value = false;

    private _onChange: (value: boolean) => void = () => undefined;
    private _onTouched: () => void = () => undefined;

    /** Người dùng bấm ô tick: bỏ trạng thái nửa vời rồi báo thay đổi. */
    onToggle(event: Event): void {
        const checked = (event.target as HTMLInputElement).checked;

        this.value = checked;
        this.indeterminate = false;
        this._onChange(checked);
        this._onTouched();
        this.checkedChange.emit(checked);
    }

    writeValue(value: boolean | null | undefined): void {
        this.value = !!value;
    }

    registerOnChange(fn: (value: boolean) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}
