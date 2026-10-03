import { isBrowser } from './platform';

/**
 * Mở liên kết (hoặc số điện thoại, email) ở tab mới.
 * Bỏ qua khi đang chạy ở môi trường không có `window` (prerender).
 */
export function openExternalLink(target: string | null | undefined): void {
    const url = (target ?? '').trim();
    if (!url || !isBrowser()) return;

    window.open(url, '_blank', 'noopener');
}
