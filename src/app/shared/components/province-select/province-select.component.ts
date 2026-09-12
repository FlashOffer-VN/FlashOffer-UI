import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ProvinceOption } from '@core/data/vn-provinces.data';
import { ProvinceService } from '@core/services/province.service';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

/**
 * Select chọn tỉnh/thành phố Việt Nam — dùng chung toàn app.
 *
 * Dữ liệu lấy từ `ProvinceService` (hiện là seed data, sau này đổi sang API
 * mà không phải sửa nơi dùng). Hoạt động như một form control:
 *
 * ```html
 * <app-province-select formControlName="companyAddress" [required]="true"
 *     [isInvalid]="isFieldInvalid('companyAddress')"
 *     [errorMessage]="getErrorMessage('companyAddress')" [colorRole]="'admin'">
 * </app-province-select>
 * ```
 *
 * `label` / `placeholder` nhận i18n key (mặc định `COMMON.PROVINCE` /
 * `COMMON.PROVINCE_PLACEHOLDER`).
 */
@Component({
    selector: 'app-province-select',
    standalone: true,
    imports: [
        FormsModule,
        TranslateModule,
        NgSelectWrapperComponent
    ],
    templateUrl: './province-select.component.html',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => ProvinceSelectComponent),
            multi: true
        }
    ]
})
export class ProvinceSelectComponent implements ControlValueAccessor, OnInit {

    /** i18n key (hoặc text) của label. */
    @Input() label = 'COMMON.PROVINCE';

    /** i18n key (hoặc text) của placeholder. */
    @Input() placeholder = 'COMMON.PROVINCE_PLACEHOLDER';

    @Input() required = false;

    @Input() isInvalid = false;

    @Input() errorMessage = '';

    @Input() disabled = false;

    @Input() searchable = true;

    @Input() clearable = false;

    @Input() id = '';

    /** body | '.selector' | null */
    @Input() appendTo: string | null = 'body';

    @Input() colorRole: 'default' | 'admin' | 'user' | 'custom' = 'default';

    @Input() primaryColor = '';

    @Input() primaryDark = '';

    provinces: ProvinceOption[] = [];

    /** Giá trị = tên tỉnh/thành (string) — khớp field address hiện có ở backend. */
    value: string | null = null;

    private onChange: (value: any) => void = () => { };

    private onTouched: () => void = () => { };

    constructor(private _provinceService: ProvinceService) { }

    ngOnInit(): void {
        this._provinceService.getProvinces().subscribe(list => {
            this.provinces = list;
        });
    }

    onValueChange(value: string | null): void {
        this.value = value ?? null;
        this.onChange(this.value);
        this.onTouched();
    }

    //#region ControlValueAccessor

    writeValue(value: string | null): void {
        this.value = value ?? null;
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
