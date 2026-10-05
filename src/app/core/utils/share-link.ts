import { isBrowser } from './platform';
import { storageGet, storageSet } from './storage';

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

/**
 * Link chia sẻ chung của tài khoản: mở link rồi tạo đơn / gửi yêu cầu / tham gia nhóm
 * thì bản ghi sinh ra ghi nhận mã của người chia sẻ.
 * Trả chuỗi rỗng khi chưa có mã hoặc khi đang chạy ở môi trường không có `window` (prerender).
 */
export function buildReferralShareUrl(referralCode?: string | null): string {
    const ref = (referralCode ?? '').trim();
    if (!ref || !isBrowser()) return '';

    return `${window.location.origin}/?ref=${encodeURIComponent(ref)}`;
}

/** Mã chia sẻ đang có trên URL (?ref=...) — mã người chia sẻ đã gắn vào link người dùng đang mở */
export function readReferralCodeFromQuery(search?: string | null): string | null {
    const query = search ?? (isBrowser() ? window.location.search : '');
    if (!query) return null;

    const value = new URLSearchParams(query).get('ref');
    return value?.trim() || null;
}

/** Khoá lưu mã chia sẻ đã gặp — để trong localStorage cho bền qua các phiên sử dụng */
/**
 * Gắn mã chia sẻ vào một đường dẫn nội bộ bất kỳ (bài viết, nhóm, …).
 * Dùng cho link không có hàm dựng sẵn; giữ nguyên đường dẫn khi chưa có mã.
 */
export function appendReferralCode(url: string, referralCode?: string | null): string {
    const ref = (referralCode ?? '').trim();
    if (!url || !ref) return url;

    return `${url}${url.includes('?') ? '&' : '?'}ref=${encodeURIComponent(ref)}`;
}

/**
 * Khoá lưu mã chia sẻ đã gặp — để trong localStorage cho bền qua các phiên sử dụng
 */
const REFERRAL_STORAGE_KEY = 'kindi_referral_code';

/** Khoá lưu mã đã đồng bộ lên tài khoản — tránh gọi lại API ở mỗi lần chuyển trang */
const REFERRAL_SYNCED_STORAGE_KEY = 'kindi_referral_code_synced';

/**
 * Ghi nhận mã chia sẻ trên link vào `localStorage` (bền qua các phiên, không phụ thuộc link):
 * chỉ ghi LẦN ĐẦU — sau đó mở link của CTV khác cũng KHÔNG ghi đè.
 * Trả mã đang ghi nhận trong máy, `null` khi chưa từng mở link chia sẻ nào.
 */
export function captureReferralCode(): string | null {
    if (!isBrowser()) return null;

    const stored = storageGet(REFERRAL_STORAGE_KEY);
    if (stored) return stored;

    const fromQuery = readReferralCodeFromQuery();
    if (!fromQuery) return null;

    storageSet(REFERRAL_STORAGE_KEY, fromQuery);
    return fromQuery;
}

/**
 * Mã chia sẻ dùng cho các luồng ghi nhận (tạo đơn / gửi yêu cầu / tham gia nhóm…):
 * lấy mã đã ghi nhận trong máy, chưa có thì lấy từ link đang mở (?ref=).
 */
export function resolveReferralCode(): string | null {
    return captureReferralCode();
}

/** Mã chia sẻ này đã đồng bộ lên tài khoản đang đăng nhập chưa? */
export function isReferralCodeSynced(referralCode: string): boolean {
    return storageGet(REFERRAL_SYNCED_STORAGE_KEY) === referralCode;
}

/** Đánh dấu mã chia sẻ đã đồng bộ lên tài khoản (gọi sau khi API ghi nhận thành công). */
export function markReferralCodeSynced(referralCode: string): void {
    storageSet(REFERRAL_SYNCED_STORAGE_KEY, referralCode);
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
