// src/app/shared/pipes/code-name.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Hiển thị mã kèm tên theo một kiểu thống nhất: "KND04D90586 - Nguyễn Văn A".
 *
 * Mã được viết hoa và bỏ khoảng trắng thừa (giống DisplayCodePipe) nên copy ra vẫn tra cứu được.
 * Thiếu một trong hai thì hiện cái còn lại, thiếu cả hai thì hiện '--' để mọi màn hình giống nhau.
 */
@Pipe({
    name: 'appCodeName',
    standalone: true
})
export class CodeNamePipe implements PipeTransform {
    transform(code: string | null | undefined, name: string | null | undefined): string {
        const trimmedCode = (code ?? '').trim();
        const trimmedName = (name ?? '').trim();

        if (trimmedCode && trimmedName) return `${trimmedCode.toUpperCase()} - ${trimmedName}`;
        if (trimmedCode) return trimmedCode.toUpperCase();
        return trimmedName || '--';
    }
}
