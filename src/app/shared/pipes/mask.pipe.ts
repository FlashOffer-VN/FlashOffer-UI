// src/app/shared/pipes/mask.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { StringHelper } from '../../core/utils/string-helper';

/**
 * Che số điện thoại khi hiển thị: giữ 3 số đầu + 3 số cuối.
 * Chỉ dùng cho phần hiển thị; quyền xem đầy đủ hay không do API quyết định
 * (API trả về giá trị đã che cho người không có quyền).
 */
@Pipe({
    name: 'maskPhone',
    standalone: true
})
export class MaskPhonePipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        return StringHelper.maskPhone(value);
    }
}

/**
 * Che email khi hiển thị: giữ ký tự đầu + tên miền.
 */
@Pipe({
    name: 'maskEmail',
    standalone: true
})
export class MaskEmailPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        return StringHelper.maskEmail(value);
    }
}

/**
 * Che họ tên khi hiển thị: 2 từ thì giữ tên + chữ cái đầu của họ,
 * từ 3 từ trở lên thì giữ từ đầu và từ cuối.
 */
@Pipe({
    name: 'maskName',
    standalone: true
})
export class MaskNamePipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        return StringHelper.maskName(value);
    }
}
