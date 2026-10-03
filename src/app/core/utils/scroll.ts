import { isBrowser } from './platform';

/**
 * Cuộn tới một mục trong trang theo id.
 * Liên kết kiểu href="#id" không tự cuộn trong ứng dụng này (bộ định tuyến giữ nguyên vị trí),
 * nên các nút trong trang gọi hàm này để nhảy tới đúng khối.
 */
export function scrollToSection(id: string): void {
    if (!isBrowser()) return;

    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
