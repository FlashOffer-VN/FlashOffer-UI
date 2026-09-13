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

/** Hình dạng dữ liệu form — dùng chung cho cả giá trị gốc lẫn giá trị đang nhập. */
interface ProductFormShape {
    name: string;
    description: string;
    category: ProductCategory | null;
    retailPrice: number | null;
    wholesalePrice: number | null;
    minOrderQuantity: number | null;
}

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
        return JSON.stringify(this.buildUpdatePayload())
            !== JSON.stringify(this.toUpdatePayload(this.toFormShape(this.original)));
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
            // Nút Lưu đã bị disable khi không có thay đổi; chặn thêm ở đây để phím
            // Enter trong ô nhập cũng không gửi request vô nghĩa.
            if (!this.hasChanges) return;
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
        this.form.reset(this.toFormShape(this.original));
    }

    /** PartnerProduct entity → hình dạng form (dùng cả cho reset lẫn so sánh). */
    private toFormShape(p: PartnerProduct | null): ProductFormShape {
        return {
            name: p?.name ?? '',
            description: p?.description ?? '',
            category: p?.category ?? null,
            retailPrice: p?.retailPrice ?? null,
            wholesalePrice: p?.wholesalePrice ?? null,
            minOrderQuantity: p?.minOrderQuantity ?? null
        };
    }

    // ==============================
    // PAYLOAD
    // ==============================

    /** Thêm mới — gửi name + mọi field admin có nhập (field trống để backend gán mặc định). */
    private buildCreatePayload(): CreatePartnerProductRequest {
        const v = this.form.value;
        const payload: CreatePartnerProductRequest = {
            name: this.text(v.name),
            description: this.text(v.description)
        };

        const category = this.numberOrNull(v.category);
        if (category !== null) payload.category = category as ProductCategory;

        const retailPrice = this.numberOrNull(v.retailPrice);
        if (retailPrice !== null) payload.retailPrice = retailPrice;

        const wholesalePrice = this.numberOrNull(v.wholesalePrice);
        if (wholesalePrice !== null) payload.wholesalePrice = wholesalePrice;

        const minOrderQuantity = this.numberOrNull(v.minOrderQuantity);
        if (minOrderQuantity !== null) payload.minOrderQuantity = minOrderQuantity;

        return payload;
    }

    /**
     * Sửa — gửi TOÀN BỘ field của form, không phải chỉ field thay đổi.
     * Backend là partial update (`Condition(srcMember != null)`) nên field không
     * đổi gửi lại giá trị cũ cũng không hại, mà gửi đủ thì sau này form thêm
     * field mới sẽ không bị bỏ sót. Ô số để trống → `null` = backend giữ nguyên.
     */
    private buildUpdatePayload(): UpdatePartnerProductRequest {
        return this.toUpdatePayload(this.form.value);
    }

    private toUpdatePayload(src: ProductFormShape): UpdatePartnerProductRequest {
        return {
            name: this.text(src.name),
            description: this.text(src.description),
            category: this.numberOrNull(src.category) as ProductCategory | null,
            retailPrice: this.numberOrNull(src.retailPrice),
            wholesalePrice: this.numberOrNull(src.wholesalePrice),
            minOrderQuantity: this.numberOrNull(src.minOrderQuantity)
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
