// src/app/shared/pipes/short-id.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Rút gọn GUID thành 8 ký tự đầu (viết hoa) để hiển thị khi bản ghi chưa có mã nghiệp vụ.
 * Mã nghiệp vụ (nếu có) luôn được ưu tiên hiển thị thay cho giá trị này.
 */
@Pipe({
    name: 'shortId',
    standalone: true
})
export class ShortIdPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (!value) return '--';
        return value.substring(0, 8).toUpperCase();
    }
}
