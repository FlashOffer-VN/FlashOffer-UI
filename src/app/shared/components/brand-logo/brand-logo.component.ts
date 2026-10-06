import { Component, Input } from '@angular/core';

/** Cỡ chữ thương hiệu: dùng ở header công khai, footer, màn tải toàn trang. */
export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Chữ thương hiệu "Kindi" cho các trang hướng người dùng (trang chủ, header/footer công khai, màn tải
 * toàn trang).
 *
 * Chỉ dùng CSS + token của app (không thêm font/ảnh): ô vuông gradient với tia chớp, tên thương hiệu
 * đổ gradient, chấm nhấn màu accent và dòng mô tả ngắn.
 *
 * Cách dùng:
 * ```html
 * <app-brand-logo [tagline]="'APP_TAGLINE' | translate" size="lg" />
 * <app-brand-logo size="sm" variant="onDark" />
 * ```
 */
@Component({
    selector: 'app-brand-logo',
    standalone: true,
    template: `
        <span class="brand" [class.brand--sm]="size === 'sm'" [class.brand--lg]="size === 'lg'"
            [class.brand--xl]="size === 'xl'" [class.brand--on-dark]="variant === 'onDark'">
            <span class="brand__mark" aria-hidden="true">
                <i class="fa-solid fa-bolt"></i>
            </span>

            <span class="brand__text">
                <span class="brand__name">
                    {{ text }}<span class="brand__dot" aria-hidden="true"></span>
                </span>

                @if (tagline) {
                <span class="brand__tagline">{{ tagline }}</span>
                }
            </span>
        </span>
    `,
    styleUrls: ['./brand-logo.component.css']
})
export class BrandLogoComponent {
    /** Tên thương hiệu — giữ nguyên ở mọi ngôn ngữ nên không cần dịch. */
    @Input() text = 'Kindi';

    /** Dòng mô tả ngắn dưới tên (tuỳ chọn, ví dụ "Nền tảng kết nối SME"). */
    @Input() tagline = '';

    /** Cỡ chữ thương hiệu. */
    @Input() size: BrandLogoSize = 'md';

    /** `onDark` cho nền tối (sidebar/ảnh nền). */
    @Input() variant: 'default' | 'onDark' = 'default';
}
