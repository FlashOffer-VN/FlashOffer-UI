// src/app/shared/pipes/display-code.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Chuẩn hoá mã hiển thị (mã đơn mua chung, mã đối tác, mã cộng tác viên…):
 * bỏ khoảng trắng thừa và viết hoa để mọi màn hình hiện cùng một kiểu.
 * Không thêm hay bớt ký tự nên giá trị copy ra vẫn tra cứu được.
 */
@Pipe({
    name: 'displayCode',
    standalone: true
})
export class DisplayCodePipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (value === null || value === undefined) return '';
        return value.trim().toUpperCase();
    }
}
