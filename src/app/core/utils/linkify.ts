/**
 * Tự nhận liên kết trong nội dung soạn ở Cài đặt chung (Quill): người soạn dán link trần
 * thì khi hiển thị sẽ thành thẻ liên kết. Chỉ xử lý phần chữ nằm ngoài thẻ HTML và bỏ qua
 * chữ đã nằm trong thẻ <a> để không lồng hai liên kết vào nhau.
 */

/** Liên kết có giao thức hoặc tên miền có dấu chấm kèm đuôi thường gặp (bỏ qua địa chỉ email). */
const LINK_PATTERN = /(?<![@\w.\/])((?:https?:\/\/|www\.)[^\s<>"']+[^\s<>"'.,;:!?)]|(?:[a-z0-9-]+\.)+(?:com|vn|net|org|io|edu|gov|info|biz)(?:\/[^\s<>"']*)?)/gi;

/** Thêm giao thức cho liên kết viết thiếu. */
function withProtocol(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Biến liên kết trần trong HTML thành thẻ <a> mở tab mới. */
export function linkifyHtml(html: string | null | undefined): string {
    const source = String(html ?? '');
    if (!source) return '';

    let insideAnchor = 0;

    return source
        .split(/(<[^>]+>)/g)
        .map(part => {
            if (part.startsWith('<')) {
                if (/^<a\b/i.test(part)) insideAnchor += 1;
                else if (/^<\/a\b/i.test(part)) insideAnchor = Math.max(0, insideAnchor - 1);
                return part;
            }

            if (insideAnchor > 0) return part;

            return part.replace(LINK_PATTERN, match =>
                `<a href="${withProtocol(match)}" target="_blank" rel="noopener">${match}</a>`);
        })
        .join('');
}
