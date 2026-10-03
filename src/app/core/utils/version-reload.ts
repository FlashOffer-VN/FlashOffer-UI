import { isBrowser } from './platform';
import { storageGet, storageSet } from './storage';

/**
 * Dấu hiệu lỗi khi bản mới đã được phát lên trong lúc trang đang mở.
 *
 * Lúc đó tệp của bản cũ đã bị xoá khỏi máy chủ, nên mô-đun nạp muộn không còn tải được; máy chủ
 * lại trả về trang HTML của ứng dụng, khiến trình duyệt báo sai loại nội dung.
 */
const STALE_VERSION_ERRORS = [
    'failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'importing a module script failed',
    'chunkloaderror'
];

/** Khoá lưu thời điểm tải lại gần nhất, dùng để chặn tải lại lặp. */
const RELOAD_GUARD_KEY = 'kindi_stale_version_reloaded_at';

/** Lỗi này có phải do bản mới đã phát lên trong lúc trang đang mở không. */
export function isStaleVersionError(error: unknown): boolean {
    const message = (typeof error === 'string' ? error : (error as Error)?.message ?? '').toLowerCase();
    if (!message) return false;

    return STALE_VERSION_ERRORS.some(pattern => message.includes(pattern))
        || message.includes('mime type of "text/html"');
}

/** Tải lại trang để lấy bản mới; bản mới vẫn lỗi thì không tải lại lặp. */
export function reloadForNewVersion(): void {
    if (!isBrowser()) return;

    const reloadedAt = Number(storageGet(RELOAD_GUARD_KEY) ?? 0);
    if (Date.now() - reloadedAt < 60_000) return;

    storageSet(RELOAD_GUARD_KEY, String(Date.now()));
    window.location.reload();
}
