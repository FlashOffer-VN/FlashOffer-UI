import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
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
export class NgSelectWrapperComponent implements ControlValueAccessor, OnDestroy {

    @Input() items: any[] = [];

    @Input() label = '';

    @Input() placeholder = '';

    @Input() required = false;

    @Input() errorMessage = '';

    @Input() isInvalid = false;

    @Input() disabled = false;

    @Input() primaryColor = '';

    @Input() primaryDark = '';

    @Input() textColor = '#1a2a3a';

    /**
     * body | '.selector' | null
     */
    @Input() appendTo: string | null = 'body';

    @Input() searchable = false;

    @Input() colorRole?: 'default' | 'admin' | 'user' | 'custom';

    @Input() clearable = false;

    @Input() closeOnSelect = true;

    @Input() touched = false;

    @Output() valueChange = new EventEmitter<any>();

    @Input() id = '';

    @Input() colorMode: 'default' | 'admin' | 'user' | 'custom' = 'default';

    value: any = null;

    private readonly roleColors = {
        default: { primary: '#007f94', dark: '#006b80' },
        admin: { primary: '#7C3AED', dark: '#5B21B6' },
        user: { primary: '#EC4899', dark: '#BE185D' },
        custom: { primary: '', dark: '' }
    } as const;

    private get effectiveColorMode(): 'default' | 'admin' | 'user' | 'custom' {
        return this.colorRole ?? this.colorMode;
    }

    get primaryColorFinal(): string {
        if (this.primaryColor) {
            return this.primaryColor;
        }

        return this.roleColors[this.effectiveColorMode].primary;
    }

    get primaryDarkFinal(): string {
        if (this.primaryDark) {
            return this.primaryDark;
        }

        return this.roleColors[this.effectiveColorMode].dark || this.roleColors[this.effectiveColorMode].primary;
    }

    onOpen(): void {
        if (this.appendTo === 'body') {
            document.body.style.setProperty('--select-primary', this.primaryColorFinal);
            document.body.style.setProperty('--select-primary-dark', this.primaryDarkFinal);
        }
    }

    onClose(): void {
        if (this.appendTo === 'body') {
            document.body.style.removeProperty('--select-primary');
            document.body.style.removeProperty('--select-primary-dark');
        }
    }

    ngOnDestroy(): void {
        if (this.appendTo === 'body') {
            document.body.style.removeProperty('--select-primary');
            document.body.style.removeProperty('--select-primary-dark');
        }
    }

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