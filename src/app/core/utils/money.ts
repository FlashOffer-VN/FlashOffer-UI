// src/app/core/utils/money.ts

/**
 * Định dạng số tiền dùng chung cho các ô nhập.
 *
 * Tiền Việt Nam viết theo nhóm ba chữ số ngăn bằng dấu chấm (1.234.567) và không có phần thập phân,
 * nên phần hiển thị trong ô nhập chỉ giữ chữ số rồi nhóm lại. Giá trị đưa cho form luôn là chuỗi
 * chữ số trần để nơi nhận đọc bằng Number() mà không phải bỏ dấu phân cách.
 */
export class MoneyHelper {
    /** Nhóm chữ số theo hàng nghìn: 1234567 -> '1.234.567'; không có chữ số thì trả về chuỗi rỗng. */
    static format(value: string | number | null | undefined): string {
        const digits = MoneyHelper.toDigits(value);
        if (!digits) return '';
        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /** Bỏ mọi ký tự không phải chữ số: '1.234.567 đ' -> '1234567'. */
    static toDigits(value: string | number | null | undefined): string {
        if (value === null || value === undefined) return '';
        return String(value).replace(/\D/g, '');
    }

    /**
     * Vị trí nháy trong chuỗi đã định dạng, tính theo số chữ số nằm bên trái nháy. Dùng để đặt lại
     * vị trí nháy sau khi dấu phân cách được chèn vào giữa chuỗi.
     */
    static caretPosition(formatted: string, digitsBeforeCaret: number): number {
        let seen = 0;
        for (let index = 0; index < formatted.length; index++) {
            if (/\d/.test(formatted[index])) seen++;
            if (seen === digitsBeforeCaret) return index + 1;
        }
        return digitsBeforeCaret === 0 ? 0 : formatted.length;
    }

    /** Đọc ra số để tính toán: '1.234.567' -> 1234567; rỗng thì trả về 0. */
    static toNumber(value: string | number | null | undefined): number {
        const digits = MoneyHelper.toDigits(value);
        return digits ? Number(digits) : 0;
    }
}
