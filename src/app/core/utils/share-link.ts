import { isBrowser } from './platform';

/**
 * Dựng link công khai của một đơn mua chung, gắn kèm mã chia sẻ riêng của người gửi (refcode)
 * để bản ghi sinh ra từ link đó ghi nhận đúng người chia sẻ.
 * Trả chuỗi rỗng khi thiếu mã đơn hoặc khi đang chạy ở môi trường không có `window` (prerender).
 */
export function buildGroupBuyingShareUrl(
    groupBuyingRequestCode: string | null | undefined,
    referralCode?: string | null
): string {
    const code = (groupBuyingRequestCode ?? '').trim();
    if (!code || !isBrowser()) return '';

    const url = `${window.location.origin}/mua-chung/${encodeURIComponent(code)}`;
    const ref = (referralCode ?? '').trim();

    return ref ? `${url}?ref=${encodeURIComponent(ref)}` : url;
}

/** Mã chia sẻ đang có trên URL (?ref=...) — mã người chia sẻ đã gắn vào link người dùng đang mở */
export function readReferralCodeFromQuery(search?: string | null): string | null {
    const query = search ?? (isBrowser() ? window.location.search : '');
    if (!query) return null;

    const value = new URLSearchParams(query).get('ref');
    return value?.trim() || null;
}

/** Copy văn bản vào clipboard; trình duyệt chặn Clipboard API thì dùng input tạm */
export function copyToClipboard(text: string): Promise<void> {
    if (!text || !isBrowser()) return Promise.resolve();

    return navigator.clipboard.writeText(text).catch(() => {
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    });
}
