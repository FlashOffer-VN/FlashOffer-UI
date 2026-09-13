// pages/admin/partner/edit/partner-edit-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CoreSharedModule } from '@shared';
import { AppService } from '@core/services/app.service';
import { BusinessFieldOption, BusinessFieldService } from '@core/services/business-field.service';
import {
    BUSINESS_TYPES,
    COMPANY_SIZES,
    BusinessType,
    CompanySize,
    Partner,
    UpdatePartnerRequest
} from '@core/models/partner.model';

/** Hình dạng dữ liệu form — dùng chung cho cả giá trị gốc lẫn giá trị đang nhập. */
interface PartnerFormShape {
    fullName: string;
    email: string;
    phone: string;
    position: string;
    companyName: string;
    companyTax: string;
    companyAddress: string;
    companyWebsite: string;
    businessType: BusinessType | null;
    companySize: CompanySize | null;
    businessFieldId: string | null;
    note: string;
}

/**
 * Form sửa THÔNG TIN ĐỐI TÁC (PUT /partners/{id}).
 *
 * Payload gửi lên là TOÀN BỘ field của form, không phải chỉ field thay đổi.
 * Backend là partial update (`Condition(srcMember != null)`) nên field không đổi
 * gửi lại giá trị cũ cũng không hại, mà gửi đủ thì sau này form thêm field mới
 * sẽ không bị bỏ sót. Quy tắc giá trị:
 * - field text để trống → gửi `''` (xóa giá trị);
 * - select/enum không có giá trị → gửi `null` (backend giữ nguyên giá trị cũ).
 *
 * Nút Lưu chỉ bật khi có thay đổi so với dữ liệu gốc (`hasChanges`) để tránh
 * ghi lại y nguyên — nhưng khi bấm Lưu thì vẫn gửi đủ field như trên.
 *
 * SẢN PHẨM KHÔNG nằm trong form này — backend tách sang API riêng
 * (`/partners/{id}/products`), dùng `PartnerProductFormComponent`.
 */
@Component({
    selector: 'app-partner-edit-form',
    standalone: true,
    imports: [CoreSharedModule],
    templateUrl: './partner-edit-form.component.html',
    styleUrls: ['../../../../shared/styles/edit-form.css']
})
export class PartnerEditFormComponent {

    @Input() isSaving = false;
    @Output() save = new EventEmitter<UpdatePartnerRequest>();
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    businessFields: BusinessFieldOption[] = [];
    businessTypes: { value: number; label: string }[] = [];
    companySizes: { value: number; label: string }[] = [];

    private original: Partner | null = null;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService,
        private _businessFieldService: BusinessFieldService
    ) {
        this.businessTypes = BUSINESS_TYPES.map(t => ({
            value: t.value,
            label: this._appService.trans(t.label)
        }));
        this.companySizes = COMPANY_SIZES.map(s => ({
            value: s.value,
            label: this._appService.trans(s.label)
        }));

        this.buildForm();
        this._businessFieldService.getActive().subscribe(fields => this.businessFields = fields);
    }

    /** Truyền bản sao mới mỗi lần mở modal để form luôn dựng lại từ dữ liệu hiện tại. */
    @Input()
    set partner(value: Partner | null) {
        this.original = value ?? null;
        this.resetForm();
    }

    /** Có thay đổi nào so với dữ liệu gốc không (dùng để disable nút Lưu). */
    get hasChanges(): boolean {
        return JSON.stringify(this.buildPayload())
            !== JSON.stringify(this.toPayload(this.toFormShape(this.original)));
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.form.get(fieldName);
        return !!(control?.invalid && (control?.touched || control?.dirty));
    }

    getErrorMessage(fieldName: string): string {
        const errors = this.form.get(fieldName)?.errors;
        if (!errors) return '';
        if (errors['email']) return this._appService.trans('VALIDATION.EMAIL');
        if (errors['pattern']) return this._appService.trans('VALIDATION.PATTERN');
        if (errors['maxlength']) {
            return this._appService.trans('VALIDATION.MAX_LENGTH', { length: errors['maxlength'].requiredLength });
        }
        return this._appService.trans('VALIDATION.INVALID');
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        // Nút Lưu đã bị disable khi không có thay đổi; chặn thêm ở đây để phím
        // Enter trong ô nhập cũng không gửi request vô nghĩa.
        if (!this.hasChanges) return;

        this.save.emit(this.buildPayload());
    }

    // ==============================
    // FORM
    // ==============================

    private buildForm(): void {
        this.form = this.fb.group({
            // Cá nhân — chỉ validate định dạng khi có nhập (partial update)
            fullName: ['', [Validators.maxLength(200)]],
            email: ['', [Validators.email, Validators.maxLength(200)]],
            phone: ['', [Validators.pattern(/^(0|\+84)[0-9]{9,10}$/)]],
            position: ['', [Validators.maxLength(200)]],

            // Doanh nghiệp
            companyName: ['', [Validators.maxLength(200)]],
            companyTax: ['', [Validators.maxLength(50)]],
            companyAddress: ['', [Validators.maxLength(500)]],
            companyWebsite: ['', [Validators.maxLength(500)]],
            businessType: [null],
            companySize: [null],
            businessFieldId: [null],
            note: ['', [Validators.maxLength(2000)]]
        });
    }

    private resetForm(): void {
        this.form.reset(this.toFormShape(this.original));
    }

    /** Partner entity → hình dạng form (dùng cả cho reset lẫn để so sánh thay đổi). */
    private toFormShape(p: Partner | null): PartnerFormShape {
        return {
            fullName: p?.fullName ?? '',
            email: p?.email ?? '',
            phone: p?.phone ?? '',
            position: p?.position ?? '',

            companyName: p?.companyName ?? '',
            companyTax: p?.companyTax ?? '',
            companyAddress: p?.companyAddress ?? '',
            companyWebsite: p?.companyWebsite ?? '',

            businessType: p?.businessType ?? null,
            companySize: p?.companySize ?? null,
            businessFieldId: p?.businessFieldId ?? null,
            note: p?.note ?? ''
        };
    }

    // ==============================
    // PAYLOAD (toàn bộ field)
    // ==============================

    private buildPayload(): UpdatePartnerRequest {
        return this.toPayload(this.form.value);
    }

    private toPayload(src: PartnerFormShape): UpdatePartnerRequest {
        return {
            fullName: this.text(src.fullName),
            email: this.text(src.email),
            phone: this.text(src.phone),
            position: this.text(src.position),

            companyName: this.text(src.companyName),
            companyTax: this.text(src.companyTax),
            companyAddress: this.text(src.companyAddress),
            companyWebsite: this.text(src.companyWebsite),
            note: this.text(src.note),

            businessType: this.numberOrNull(src.businessType) as BusinessType | null,
            companySize: this.numberOrNull(src.companySize) as CompanySize | null,
            businessFieldId: src.businessFieldId || null
        };
    }

    private text(value: any): string {
        return (value ?? '').toString().trim();
    }

    private numberOrNull(value: any): number | null {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    }
}
