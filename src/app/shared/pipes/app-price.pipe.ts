// src/app/shared/pipes/app-price.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Hiển thị số tiền theo định dạng tiền Việt Nam (VD: 500.000 ₫).
 * Giá trị rỗng trả về '--' để mọi màn hình hiện giống nhau.
 */
@Pipe({
    name: 'appPrice',
    standalone: true
})
export class AppPricePipe implements PipeTransform {
    private static readonly formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    });

    transform(value: number | null | undefined): string {
        if (value === null || value === undefined) return '--';
        return AppPricePipe.formatter.format(value);
    }
}
