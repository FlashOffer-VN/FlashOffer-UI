/**
 * Cấu hình Quill dùng chung cho MỌI nơi soạn bài viết trong app:
 * bài viết trang Cộng đồng, bài viết trong Nhóm ngành / Hội nhóm (kể cả trang admin),
 * và nội dung pháp lý ở Cài đặt chung.
 */

/** Định dạng văn bản cơ bản dùng cho mọi loại bài viết */
const TEXT_FORMATS: any[] = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }]
];

/** Bài viết Cộng đồng: có chèn ảnh (API cho phép 5000 ký tự) */
export const QUILL_MODULES = {
    toolbar: [...TEXT_FORMATS, ['link', 'image'], ['clean']]
};

/** Bài viết trong nhóm/hội: KHÔNG chèn ảnh (API giới hạn 4000 ký tự và bảng bài nhóm không có trường ảnh) */
export const QUILL_MODULES_GROUP_POST = {
    toolbar: [...TEXT_FORMATS, ['link'], ['clean']]
};

/** Biểu tượng nút chèn đường kẻ ngang trên thanh công cụ. */
const HORIZONTAL_RULE_ICON = '<svg viewBox="0 0 18 18"><line class="ql-stroke" x1="2" x2="16" y1="9" y2="9"></line></svg>';

let horizontalRuleReady = false;

/** Đã đăng ký xong định dạng đường kẻ ngang chưa (Quill được nạp muộn nên việc này chạy sau). */
export const horizontalRuleRegistered = (): boolean => horizontalRuleReady;

/**
 * Đăng ký định dạng đường kẻ ngang cho Quill — Quill không có sẵn định dạng này.
 * Nhận thẳng module Quill vì phải nạp muộn (Quill cần DOM, máy chủ dựng sẵn không có).
 * Gọi lại nhiều lần cũng không sao.
 */
export function registerQuillHorizontalRule(quillModule: any): void {
    if (horizontalRuleReady || !quillModule) return;

    const Quill = quillModule.default ?? quillModule;
    const BlockEmbed = Quill.import('blots/block/embed');

    class HorizontalRuleBlot extends BlockEmbed { }
    (HorizontalRuleBlot as any).blotName = 'hr';
    (HorizontalRuleBlot as any).tagName = 'HR';

    Quill.register(HorizontalRuleBlot, true);
    Quill.import('ui/icons').hr = HORIZONTAL_RULE_ICON;
    horizontalRuleReady = true;
}

/**
 * Văn bản pháp lý ở Cài đặt chung: có tiêu đề mục, danh sách, liên kết, đường kẻ ngang;
 * gõ/dán link trần sẽ tự nhận khi hiển thị.
 */
export const QUILL_MODULES_LEGAL = {
    toolbar: {
        container: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'link'],
            ['hr'],
            ['clean']
        ],
        handlers: {
            /** Chèn đường kẻ ngang tại vị trí con trỏ rồi đưa con trỏ xuống dưới đường kẻ. */
            hr(this: { quill: any }): void {
                const quill = this.quill;
                const range = quill.getSelection(true);
                const index = range ? range.index : quill.getLength();

                quill.insertEmbed(index, 'hr', true, 'user');
                quill.setSelection(index + 1, 0, 'silent');
            }
        }
    }
};

/** Lấy phần chữ thật của nội dung Quill (bỏ thẻ HTML) để kiểm tra rỗng trước khi gửi */
export const quillPlainText = (html: string | null | undefined): string =>
    String(html ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();

