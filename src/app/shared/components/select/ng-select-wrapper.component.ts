import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ControlValueAccessor,
    FormsModule,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
    selector: 'app-ng-select-wrapper',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        NgSelectModule
    ],
    templateUrl: './ng-select-wrapper.component.html',
    styleUrls: ['./ng-select-wrapper.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgSelectWrapperComponent),
            multi: true
        }
    ]
})
export class NgSelectWrapperComponent implements ControlValueAccessor {

    @Input() items: any[] = [];

    @Input() label = '';

    @Input() placeholder = '';

    @Input() required = false;

    @Input() errorMessage = '';

    @Input() isInvalid = false;

    @Input() disabled = false;

    /**
     * body | '.selector' | null
     */
    @Input() appendTo: string | null = 'body';

    @Input() searchable = false;

    @Input() clearable = false;

    @Input() closeOnSelect = true;

    @Input() touched = false;

    @Output() valueChange = new EventEmitter<any>();

    @Input() id = '';

    value: any = null;

    private hasBlurred = false;

    private onChange: (value: any) => void = () => { };

    private onTouched: () => void = () => { };

    get showInvalid(): boolean {

        const touched = this.hasBlurred || this.touched;
        return (
            touched &&
            (
                this.isInvalid ||
                (
                    this.required &&
                    this.isEmptyValue(this.value)
                )
            )
        );
    }

    private isEmptyValue(value: any): boolean {
        return value === null || value === undefined || value === '';
    }

    onValueChange(value: any): void {

        // Nếu bindValue là số nhưng trả về string
        if (
            typeof value === 'string' &&
            value !== '' &&
            !isNaN(Number(value))
        ) {
            value = Number(value);
        }

        this.value = value;

        this.onChange(value);

        this.valueChange.emit(value);
    }

    onBlur(): void {
        this.hasBlurred = true;
        this.onTouched();
    }

    //#region ControlValueAccessor

    writeValue(value: any): void {
        this.value = value;
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

    //#endregion
}