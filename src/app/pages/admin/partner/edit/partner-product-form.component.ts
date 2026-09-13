// pages/admin/partner/edit/partner-product-form.component.ts
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CoreSharedModule } from '@shared';
import { AppService } from '@core/services/app.service';
import {
    CreatePartnerProductRequest,
    PartnerProduct,
    PRODUCT_CATEGORIES,
    ProductCategory,
    UpdatePartnerProductRequest
} from '@core/models/partner.model';

/**
 * Form sản phẩm của đối tác — dùng cho CẢ thêm mới và sửa.
 *
 * - Không truyền `product` (null) → chế độ THÊM MỚI → emit `create`
 *   (POST /partners/{id}/products).
 * - Có `product` → chế độ SỬA → emit `update`, chỉ gửi field THAY ĐỔI
 *   (PUT /partners/{id}/products/{productId}, partial update).
 *
 * Backend gán mặc định cho field bỏ trống khi tạo: Category = Other, giá = 0,
 * số lượng tối thiểu = 1 — nên các field này không bắt buộc.
 */
@Component({
    selector: 'app-partner-product-form',
    standalone: true,
    imports: [CoreSharedModule],
    templateUrl: './partner-product-form.component.html',
    styleUrls: ['../../../../shared/styles/edit-form.css']
})
export class PartnerProductFormComponent implements OnInit {

    @Input() isSaving = false;
    @Output() create = new EventEmitter<CreatePartnerProductRequest>();
    @Output() update = new EventEmitter<UpdatePartnerProductRequest>();
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    categoryOptions: { value: number; label: string }[] = [];

    private readonly _destroyRef = inject(DestroyRef);

    private original: PartnerProduct | null = null;

    constructor(
        private fb: FormBuilder,
        private _appService: AppService
    ) {
        this.buildForm();
    }

    ngOnInit(): void {
        // ng-select render thẳng `label` của item nên KHÔNG đi qua pipe translate —
        // phải dịch sẵn ở đây, nếu không dropdown hiện ra key thô
        // (vd. "PARTNER.PRODUCT_CATEGORY_ELECTRONICS").
        this.buildCategoryOptions();

        // Đổi ngôn ngữ thì dịch lại, nếu không label sẽ giữ nguyên ngôn ngữ cũ.
        this._appService.onLanguageChange()
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this.buildCategoryOptions());
    }

    private buildCategoryOptions(): void {
        this.categoryOptions = PRODUCT_CATEGORIES.map(c => ({
            value: c.value,
            label: this._appService.trans(c.label)
        }));
    }

    /** null = thêm mới. Truyền bản sao mới mỗi lần mở modal để form dựng lại sạch. */
    @Input()
    set product(value: PartnerProduct | null) {
        this.original = value ?? null;
        this.resetForm();
    }

    /** true = đang sửa sản phẩm có sẵn. */
    get isEditMode(): boolean {
        return this.original !== null;
    }

    /** Sửa: chỉ bật nút Lưu khi có thay đổi. Thêm mới: luôn bật. */
    get canSubmit(): boolean {
        return this.isEditMode ? this.hasChanges : true;
    }

    private get hasChanges(): boolean {
        return Object.keys(this.buildUpdatePayload()).length > 0;
    }

    isFieldInvalid(fieldName: string): boolean {
        const control = this.form.get(fieldName);
        return !!(control?.invalid && (control?.touched || control?.dirty));
    }

    getErrorMessage(fieldName: string): string {
        const errors = this.form.get(fieldName)?.errors;
        if (!errors) return '';
        if (errors['required']) return this._appService.trans('VALIDATION.REQUIRED');
        if (errors['maxlength']) {
            return this._appService.trans('VALIDATION.MAX_LENGTH', { length: errors['maxlength'].requiredLength });
        }
        if (errors['min']) return this._appService.trans('VALIDATION.MIN', { min: errors['min'].min });
        return this._appService.trans('VALIDATION.INVALID');
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (this.isEditMode) {
            this.update.emit(this.buildUpdatePayload());
        } else {
            this.create.emit(this.buildCreatePayload());
        }
    }

    // ==============================
    // FORM
    // ==============================

    private buildForm(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(200)]],
            description: ['', [Validators.maxLength(2000)]],
            category: [null],
            // app-input type="number" trả về string → parse khi build payload
            retailPrice: [null, [Validators.min(0)]],
            wholesalePrice: [null, [Validators.min(0)]],
            minOrderQuantity: [null, [Validators.min(1)]]
        });
    }

    private resetForm(): void {
        const p = this.original;

        this.form.reset({
            name: p?.name ?? '',
            description: p?.description ?? '',
            category: p?.category ?? null,
            retailPrice: p?.retailPrice ?? null,
            wholesalePrice: p?.wholesalePrice ?? null,
            minOrderQuantity: p?.minOrderQuantity ?? null
        });
    }

    // ==============================
    // PAYLOAD
    // ==============================

    /** Thêm mới — gửi name + mọi field admin có nhập. */
    private buildCreatePayload(): CreatePartnerProductRequest {
        const v = this.form.value;

        return {
            name: (v.name ?? '').toString().trim(),
            description: (v.description ?? '').toString().trim(),
            category: this.toNumberOrNull(v.category),
            retailPrice: this.toNumberOrNull(v.retailPrice),
            wholesalePrice: this.toNumberOrNull(v.wholesalePrice),
            minOrderQuantity: this.toNumberOrNull(v.minOrderQuantity)
        };
    }

    /** Sửa — chỉ gửi field thực sự khác bản gốc (partial update). */
    private buildUpdatePayload(): UpdatePartnerProductRequest {
        const p = this.original;
        if (!p) return {};

        const v = this.form.value;
        const payload: UpdatePartnerProductRequest = {};

        this.assignText(payload, 'name', v.name, p.name);
        this.assignText(payload, 'description', v.description, p.description);

        if (v.category !== null && v.category !== undefined
            && Number(v.category) !== Number(p.category)) {
            payload.category = Number(v.category);
        }

        this.assignNumber(payload, 'retailPrice', v.retailPrice, p.retailPrice);
        this.assignNumber(payload, 'wholesalePrice', v.wholesalePrice, p.wholesalePrice);
        this.assignNumber(payload, 'minOrderQuantity', v.minOrderQuantity, p.minOrderQuantity);

        return payload;
    }

    /**
     * Text: chỉ gửi khi khác bản gốc.
     * (khác vì bị xóa trắng → gửi '' = xóa field)
     */
    private assignText(
        payload: UpdatePartnerProductRequest,
        key: 'name' | 'description',
        value: any,
        originalValue: any
    ): void {
        const next = (value ?? '').toString().trim();
        const current = (originalValue ?? '').toString().trim();
        if (next !== current) {
            payload[key] = next;
        }
    }

    private assignNumber(
        payload: UpdatePartnerProductRequest,
        key: 'retailPrice' | 'wholesalePrice' | 'minOrderQuantity',
        value: any,
        originalValue: any
    ): void {
        const next = this.toNumberOrNull(value);
        // Ô để trống (null) → coi như admin không muốn đổi, không gửi lên
        if (next !== null && next !== this.toNumberOrNull(originalValue)) {
            payload[key] = next;
        }
    }

    private toNumberOrNull(value: any): number | null {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return isNaN(num) ? null : num;
    }
}
