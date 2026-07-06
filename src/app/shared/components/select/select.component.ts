// shared/components/select/select.component.ts
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { StringHelper } from '@core/utils/string-helper';
import { AppService } from '@core/services/app.service';

export interface SelectItem {
    value: any;
    label: string;
    disabled?: boolean;
    [key: string]: any;
}

@Component({
    selector: 'app-select',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, NgSelectModule],
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
    @Input() placeholder = StringHelper.empty();
    @Input() required = false;
    @Input() errorMessage = StringHelper.empty();
    @Input() isInvalid = false;
    @Input() touched = false;
    @Input() disabled = false;
    @Input() loading = false;

    @Output() valueChange = new EventEmitter<any>();
    @Output() blur = new EventEmitter<void>();

    value: any = null;

    onChange: any = () => { };
    onTouched: any = () => { };

    constructor(private cdr: ChangeDetectorRef, private _appService: AppService) { }

    ngOnInit(): void {
        // Map items nếu cần
        if (this.items.length > 0 && !this.items[0].hasOwnProperty('label')) {
            this.items = this.items.map(item => ({
                value: item.value,
                label: item.label ?? String(item)
            }));
        }
    }

    onValueChange(newValue: any): void {
        // Auto convert number
        if (typeof newValue === 'string' && !isNaN(Number(newValue)) && newValue !== '') {
            newValue = Number(newValue);
        }
        this.value = newValue;
        this.onChange(newValue);
        this.valueChange.emit(newValue);
        this.cdr.detectChanges();
    }

    onBlur(): void {
        this.onTouched();
        this.blur.emit();
    }

    // ControlValueAccessor
    writeValue(value: any): void {
        this.value = value;
        this.cdr.detectChanges();
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