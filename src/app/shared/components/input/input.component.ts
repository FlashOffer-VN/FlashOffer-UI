// shared/components/input/input.component.ts
import {
    Component,
    Input,
    Optional,
    Self,
    forwardRef,
    OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Validators } from '@angular/forms';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NgControl
} from '@angular/forms';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [CommonModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputComponent),
            multi: true
        }
    ],
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.css']
})
export class InputComponent implements ControlValueAccessor, OnInit {
    @Input() id = '';
    @Input() label = '';
    @Input() placeholder = '';
    @Input() hint = '';
    @Input() icon = '';
    @Input() readonly = false;
    @Input() isDisabled = false;
    disabled = false;

    @Input()
    type:
        | 'text'
        | 'email'
        | 'password'
        | 'number'
        | 'tel'
        | 'search'
        = 'text';

    value = '';

    @Optional()
    @Self()
    public ngControl?: NgControl;

    constructor() { }

    ngOnInit(): void {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }
    }

    onChange: (value: string) => void = () => { };
    onTouched: () => void = () => { };

    get isInvalid(): boolean {
        return !!(
            this.ngControl?.invalid &&
            (this.ngControl?.touched || this.ngControl?.dirty)
        );
    }

    get errorMessage(): string {
        const errors = this.ngControl?.errors;
        if (!errors) return '';

        if (errors['required']) return 'Trường này là bắt buộc';
        if (errors['email']) return 'Email không hợp lệ';
        if (errors['minlength']) return `Tối thiểu ${errors['minlength'].requiredLength} ký tự`;
        if (errors['maxlength']) return `Tối đa ${errors['maxlength'].requiredLength} ký tự`;
        if (errors['min']) return `Giá trị tối thiểu là ${errors['min'].min}`;
        if (errors['max']) return `Giá trị tối đa là ${errors['max'].max}`;
        if (errors['pattern']) return 'Định dạng không hợp lệ';
        return 'Dữ liệu không hợp lệ';
    }

    get required(): boolean {
        return !!this.ngControl?.control?.hasValidator?.(
            Validators.required
        );
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value = input.value;
        this.onChange(this.value);
        if (this.ngControl?.control) {
            this.ngControl.control.markAsDirty();
        }
    }

    onBlur(): void {
        this.onTouched();
        if (this.ngControl?.control) {
            this.ngControl.control.markAsTouched();
        }
    }

    writeValue(value: string): void {
        this.value = value ?? '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }
}