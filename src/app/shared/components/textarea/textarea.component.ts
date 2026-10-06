// shared/components/textarea/textarea.component.ts
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Ô nhập nhiều dòng dùng chung — cùng cấu trúc nhãn/gợi ý/lỗi như `app-input` để mọi form nhìn đồng nhất.
 *
 * ```html
 * <app-textarea label="Ghi chú" [rows]="3" [(ngModel)]="note" />
 * <app-textarea formControlName="reason" [isInvalid]="form.get('reason')!.invalid" errorMessage="Bắt buộc" />
 * ```
 */
@Component({
    selector: 'app-textarea',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ],
    template: `
        <label class="ta" [class.is-invalid]="isInvalid">
            @if (label) {
            <span class="ta__label">{{ label }}{{ required ? ' *' : '' }}</span>
            }

            <textarea class="ta__field" [id]="inputId" [rows]="rows" [placeholder]="placeholder"
                [disabled]="isDisabled" [attr.aria-invalid]="isInvalid || null"
                [attr.aria-describedby]="hint || errorMessage ? inputId + '-note' : null" [value]="value ?? ''"
                (input)="onInput($event)" (blur)="onBlur()"></textarea>

            @if (errorMessage && isInvalid) {
            <span class="ta__error" [id]="inputId + '-note'">{{ errorMessage }}</span>
            } @else if (hint) {
            <span class="ta__hint" [id]="inputId + '-note'">{{ hint }}</span>
            }
        </label>
    `,
    styles: [`
        .ta {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
            width: 100%;
        }

        .ta__label {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--foreground);
        }

        .ta__field {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--border);
            border-radius: 0.625rem;
            background: var(--white);
            font-size: 0.875rem;
            font-family: inherit;
            color: var(--foreground);
            resize: vertical;
            transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .ta__field::placeholder {
            color: var(--muted-foreground);
        }

        .ta__field:focus {
            outline: none;
            border-color: var(--accent);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent);
        }

        .ta__field:disabled {
            background: color-mix(in srgb, var(--foreground) 4%, var(--white));
            cursor: not-allowed;
        }

        .is-invalid .ta__field {
            border-color: var(--danger);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--danger) 12%, transparent);
        }

        .ta__hint {
            font-size: 0.75rem;
            color: var(--muted-foreground);
        }

        .ta__error {
            font-size: 0.75rem;
            color: var(--danger);
        }
    `]
})
export class TextareaComponent implements ControlValueAccessor {
    static nextId = 0;

    /** Id kết hợp nhãn/gợi ý — người dùng có thể truyền id riêng khi cần. */
    @Input() inputId = `app-textarea-${TextareaComponent.nextId++}`;
    @Input() label = '';
    @Input() placeholder = '';
    @Input() hint = '';
    @Input() errorMessage = '';
    @Input() isInvalid = false;
    @Input() required = false;
    @Input() isDisabled = false;
    @Input() rows = 3;

    value: string | null = null;
    touched = false;

    private _onChange: (value: string) => void = () => { };
    private _onTouched: () => void = () => { };

    writeValue(value: string | null): void {
        this.value = value ?? null;
    }

    registerOnChange(fn: (value: string) => void): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onInput(event: Event): void {
        const target = event.target as HTMLTextAreaElement;
        this.value = target.value;
        this._onChange(target.value);
    }

    onBlur(): void {
        if (!this.touched) {
            this.touched = true;
        }
        this._onTouched();
    }
}
