import { isBrowser } from './platform';

/**
 * Cuộn tới và focus ô chưa hợp lệ đầu tiên của form.
 *
 * Gọi khi người dùng bấm nút tiếp tục/gửi mà form còn lỗi. Thiếu bước này thì nút bấm như không
 * phản hồi, vì thông báo lỗi có thể nằm ngoài tầm nhìn — ô bắt buộc ở dưới màn hình, hoặc trên mobile.
 */
export function focusFirstInvalid(root?: ParentNode | null): void {
    if (!isBrowser()) return;

    // Đợi Angular cập nhật trạng thái touched/invalid rồi mới tìm ô lỗi
    setTimeout(() => {
        const scope: ParentNode = root ?? document;
        const invalid = Array.from(
            scope.querySelectorAll<HTMLElement>(
                '.ng-invalid[formcontrolname], input.ng-invalid, select.ng-invalid, textarea.ng-invalid'
            )
        ).filter(el => el.offsetParent !== null);

        const first = invalid[0];
        if (!first) return;

        // Ô của component dùng chung (app-input, app-ng-select-wrapper…) thì nhắm control bên trong
        const target = first.matches('input, select, textarea')
            ? first
            : first.querySelector<HTMLElement>('input, select, textarea') ?? first;

        target.focus?.();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}
