// shared/components/product-list/product-list.component.ts
import { Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { InputComponent } from '@shared/components/input/input.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PartnerProduct, PRODUCT_CATEGORIES, ProductCategory } from '@core/models/partner.model';

/**
 * Bảng danh sách sản phẩm của đối tác — dùng chung, kèm filter.
 *
 * ```html
 * <!-- chỉ xem -->
 * <app-product-list [products]="partner.products || []"></app-product-list>
 *
 * <!-- có sửa/xóa, cha tự xử lý -->
 * <app-product-list [products]="items" [editable]="true"
 *     (edit)="onEditProduct($event)" (delete)="onDeleteProduct($event)">
 * </app-product-list>
 * ```
 *
 * Component này KHÔNG gọi API — `editable` chỉ bật cột thao tác và phát event.
 * Nút "Thêm sản phẩm" do cha đặt (cha mới biết ngữ cảnh đối tác nào).
 *
 * Filter: tìm theo tên / mã sản phẩm / mô tả + lọc theo danh mục.
 * Lọc chạy hoàn toàn ở client trên mảng `products` truyền vào.
 *
 * Lưu ý: KHÔNG import `CoreSharedModule` ở đây — module đó export chính
 * component này nên sẽ thành vòng import. Khai báo lẻ từng dependency.
 */
@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        InputComponent,
        NgSelectWrapperComponent,
        ButtonComponent
    ],
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

    private readonly _appService = inject(AppService);
    private readonly _destroyRef = inject(DestroyRef);

    private _products: PartnerProduct[] = [];

    /** Danh sách sản phẩm gốc (chưa lọc). Gán lại sẽ tự lọc lại. */
    @Input()
    set products(value: PartnerProduct[]) {
        this._products = value ?? [];
        this.applyFilters();
    }

    get products(): PartnerProduct[] {
        return this._products;
    }

    /** Hiện/ẩn thanh filter. */
    @Input() showFilters = true;

    /** Hiện/ẩn cột mô tả (một số chỗ hiển thị hẹp). */
    @Input() showDescription = true;

    /** Bật cột thao tác (sửa/xóa) — chỉ phát event, không gọi API. */
    @Input() editable = false;

    /** Đang xử lý (xóa...) — để disable nút thao tác. */
    @Input() isActionLoading = false;

    /** Màu cho app-ng-select-wrapper: 'admin' | 'user' | 'default' | 'custom'. */
    @Input() colorRole: 'default' | 'admin' | 'user' | 'custom' = 'admin';

    /** Phát khi bấm nút sửa một sản phẩm. */
    @Output() edit = new EventEmitter<PartnerProduct>();

    /** Phát khi bấm nút xóa một sản phẩm. */
    @Output() delete = new EventEmitter<PartnerProduct>();

    searchText = '';
    selectedCategory: ProductCategory | null = null;

    categoryOptions: { value: number; label: string }[] = [];

    /** Kết quả sau khi lọc — template render trực tiếp field này. */
    filteredProducts: PartnerProduct[] = [];

    ngOnInit(): void {
        // ng-select render thẳng `label` của item nên KHÔNG đi qua pipe translate —
        // phải dịch sẵn ở đây, nếu không dropdown hiện ra key thô
        // (vd. "PARTNER.PRODUCT_CATEGORY_ELECTRONICS").
        this.buildCategoryOptions();

        // Đổi ngôn ngữ thì dịch lại, nếu không label sẽ giữ nguyên ngôn ngữ cũ.
        this._appService.onLanguageChange()
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe(() => this.buildCategoryOptions());

        this.applyFilters();
    }

    private buildCategoryOptions(): void {
        this.categoryOptions = PRODUCT_CATEGORIES.map(c => ({
            value: c.value,
            label: this._appService.trans(c.label)
        }));
    }

    /** Số cột của bảng — dùng cho colspan của dòng trống. */
    get columnCount(): number {
        return (this.showDescription ? 7 : 6) + (this.editable ? 1 : 0);
    }

    get hasFilter(): boolean {
        return this.searchText.trim() !== '' || this.selectedCategory !== null;
    }

    onSearchChange(value: string): void {
        this.searchText = value ?? '';
        this.applyFilters();
    }

    onCategoryChange(value: ProductCategory | null): void {
        this.selectedCategory = value ?? null;
        this.applyFilters();
    }

    applyFilters(): void {
        const keyword = this.searchText.trim().toLowerCase();

        this.filteredProducts = (this.products ?? []).filter(product => {
            if (!this.matchesKeyword(product, keyword)) return false;
            if (this.selectedCategory !== null && product.category !== this.selectedCategory) return false;
            return true;
        });
    }

    clearFilters(): void {
        this.searchText = '';
        this.selectedCategory = null;
        this.applyFilters();
    }

    private matchesKeyword(product: PartnerProduct, keyword: string): boolean {
        if (keyword === '') return true;

        return (product.name ?? '').toLowerCase().includes(keyword)
            || (product.partnerProductCode ?? '').toLowerCase().includes(keyword)
            || (product.description ?? '').toLowerCase().includes(keyword);
    }

    getCategoryLabel(category: ProductCategory): string {
        return PRODUCT_CATEGORIES.find(c => c.value === category)?.label ?? '';
    }

    formatNumber(value?: number | null): string {
        if (value === null || value === undefined) return '--';
        return new Intl.NumberFormat('vi-VN').format(value);
    }
}
