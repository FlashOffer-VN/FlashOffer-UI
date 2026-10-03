import { isBrowser } from './platform';

/**
 * Mở liên kết ở tab mới; riêng `mailto:`/`tel:`/`sms:` thì điều hướng ngay trên tab hiện tại
 * vì trình duyệt chặn `window.open` với các giao thức này.
 * Bỏ qua khi đang chạy ở môi trường không có `window` (prerender).
 */
export function openExternalLink(target: string | null | undefined): void {
    const url = (target ?? '').trim();
    if (!url || !isBrowser()) return;

    if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank', 'noopener');
        return;
    }

    window.location.href = url;
}
