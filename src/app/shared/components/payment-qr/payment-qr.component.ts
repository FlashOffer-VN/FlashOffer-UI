import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppPricePipe } from '@shared/pipes/app-price.pipe';

/**
 * Ảnh QR chuyển khoản (VietQR) kèm thông tin tài khoản nhận tiền.
 * Ảnh giữ đúng tỉ lệ gốc của VietQR — không ép vuông để mã không bị méo.
 */
@Component({
    selector: 'app-payment-qr',
    standalone: true,
    imports: [CommonModule, AppPricePipe],
    template: `
        <figure class="flex flex-col items-center gap-2">
            <img [src]="url" [alt]="alt" class="w-56 h-auto max-w-full rounded-lg border border-gray-200 bg-white p-1" />

            <figcaption class="text-center text-sm text-gray-700">
                @if (accountHolder) {
                    <div class="font-medium text-gray-900">{{ accountHolder }}</div>
                }
                @if (bankName || accountNumber) {
                    <div class="text-xs text-gray-600">{{ bankLine }}</div>
                }
                @if (amount) {
                    <div class="mt-1 font-semibold text-gray-900">{{ amount | appPrice }}</div>
                }
                @if (content) {
                    <div class="mt-0.5 text-xs text-gray-500">{{ content }}</div>
                }
            </figcaption>
        </figure>
    `
})
export class PaymentQrComponent {
    /** URL ảnh QR của VietQR. */
    @Input() url: string | null = null;
    @Input() accountHolder?: string | null;
    @Input() accountNumber?: string | null;
    @Input() bankName?: string | null;
    /** Số tiền chuyển khoản (nếu có). */
    @Input() amount?: number | null;
    /** Nội dung chuyển khoản (nếu có). */
    @Input() content?: string | null;
    @Input() alt = '';

    /** Dòng "số tài khoản · ngân hàng", bỏ phần trống. */
    get bankLine(): string {
        return [this.accountNumber, this.bankName].filter(Boolean).join(' · ');
    }
}
