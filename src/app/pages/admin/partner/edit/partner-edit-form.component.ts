// pages/admin/partner/edit/partner-edit-form.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CoreSharedModule } from '@shared';
import { AppService } from '@core/services/app.service';
import { BusinessFieldOption, BusinessFieldService } from '@core/services/business-field.service';
import {
    BUSINESS_TYPES,
    COMPANY_SIZES,
    Partner,
    UpdatePartnerRequest
} from '@core/models/partner.model';

/**
 * Form sửa THÔNG TIN ĐỐI TÁC (PUT /partners/{id}) — partial update.
 *
 * CHỈ gửi lên những field thực sự THAY ĐỔI so với dữ liệu gốc, nên:
 * - field admin không đụng tới sẽ không bị ghi đè (kể cả khi form hiển thị rỗng);
 * - admin xóa trắng một field text = field đó "thay đổi" → gửi `''` để xóa;
 * - select không khớp được giá trị cũ (vd. quy mô lạ) → giá trị null, KHÔNG gửi
 *   lên → backend giữ nguyên, không mất dữ liệu.
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
        return Object.keys(this.buildPayload()).length > 0;
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
        const p = this.original;

        this.form.reset({
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
        });
    }

    // ==============================
    // PAYLOAD (chỉ field thay đổi)
    // ==============================

    private buildPayload(): UpdatePartnerRequest {
        const p = this.original;
        if (!p) return {};

        const v = this.form.value;
        const payload: UpdatePartnerRequest = {};

        // Text: gửi khi khác bản gốc (kể cả khác vì bị xóa trắng → '' = xóa field)
        this.assignText(payload, 'fullName', v.fullName, p.fullName);
        this.assignText(payload, 'email', v.email, p.email);
        this.assignText(payload, 'phone', v.phone, p.phone);
        this.assignText(payload, 'position', v.position, p.position);
        this.assignText(payload, 'companyName', v.companyName, p.companyName);
        this.assignText(payload, 'companyTax', v.companyTax, p.companyTax);
        this.assignText(payload, 'companyAddress', v.companyAddress, p.companyAddress);
        this.assignText(payload, 'companyWebsite', v.companyWebsite, p.companyWebsite);
        this.assignText(payload, 'note', v.note, p.note);

        // Select/enum: chỉ gửi khi có giá trị mới VÀ khác bản gốc.
        // (null = admin không chọn được / giá trị cũ lạ → để backend giữ nguyên)
        if (v.businessType !== null && v.businessType !== undefined
            && Number(v.businessType) !== Number(p.businessType)) {
            payload.businessType = Number(v.businessType);
        }
        if (v.companySize !== null && v.companySize !== undefined
            && Number(v.companySize) !== Number(p.companySize)) {
            payload.companySize = Number(v.companySize);
        }
        if (v.businessFieldId && v.businessFieldId !== (p.businessFieldId ?? null)) {
            payload.businessFieldId = v.businessFieldId;
        }

        return payload;
    }

    private assignText(
        payload: UpdatePartnerRequest,
        key: 'fullName' | 'email' | 'phone' | 'position' | 'companyName'
            | 'companyTax' | 'companyAddress' | 'companyWebsite' | 'note',
        value: any,
        originalValue: any
    ): void {
        const next = (value ?? '').toString().trim();
        const current = (originalValue ?? '').toString().trim();
        if (next !== current) {
            payload[key] = next;
        }
    }
}
