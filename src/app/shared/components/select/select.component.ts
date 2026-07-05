// shared/components/select/select.component.ts
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface SelectItem {
    value: any;
    label: string;
    disabled?: boolean;
    [key: string]: any;
}

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SelectComponent),
            multi: true
        }
    ]
})
export class SelectComponent implements ControlValueAccessor, OnInit {
    @Input() items: SelectItem[] = [];
    @Input() label: string = '';
    @Input() bindLabel = 'label';
    @Input() bindValue = 'value';
    @Input() placeholder = 'Chọn...';
    @Input() required = false;
    @Input() errorMessage = '';
    @Input() isInvalid = false;
    @Input() touched = false;
    @Input() disabled = false;
    @Input() loading = false;

    @Output() valueChange = new EventEmitter<any>();
    @Output() blur = new EventEmitter<void>();

    value: any = null;

    // ControlValueAccessor
    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(private cdr: ChangeDetectorRef) { }  // ✅ Thêm ChangeDetectorRef

    ngOnInit(): void {
        if (this.items.length > 0 && !this.items[0].hasOwnProperty('label')) {
            this.items = this.items.map(item => ({
                value: item[this.bindValue] ?? item.value,
                label: item[this.bindLabel] ?? item.label ?? String(item)
            }));
        }
    }

    onValueChange(newValue: any): void {
        console.log('🔄 Select changed:', newValue);
        this.value = newValue;
        this.onChange(newValue);
        this.onTouched();
        this.valueChange.emit(newValue);
        this.cdr.detectChanges();  // ✅ Force re-render
    }

    onBlur(): void {
        this.onTouched();
        this.blur.emit();
    }

    writeValue(value: any): void {
        console.log('📝 Select writeValue:', value);
        this.value = value;
        this.cdr.detectChanges();  // ✅ Force re-render
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

    get selectedLabel(): string {
        if (!this.items || this.items.length === 0) return this.placeholder;
        const found = this.items.find(item => item[this.bindValue] === this.value);
        return found ? found[this.bindLabel] : this.placeholder;
    }
}