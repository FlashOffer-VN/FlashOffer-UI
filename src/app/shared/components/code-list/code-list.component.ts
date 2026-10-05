import { Component, Input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ToastService } from '@core/services/toast.service';
import { copyToClipboard } from '@core/utils/share-link';

/** Một dòng mã trong danh sách: nhãn nhỏ + giá trị mã + nút copy nhanh. */
export interface CodeListItem {
    /** Nhãn hiển thị (đã dịch sẵn), ví dụ "Mã tài khoản"; để trống khi bảng/cột đã có tiêu đề riêng. */
    label: string;
    /** Giá trị mã; rỗng thì hiện "--" và KHÔNG có nút copy. */
    value?: string | null;
    /** Tên gợi ý hiển thị cạnh mã (text-xs, xám nhạt) - ví dụ tên người giới thiệu; KHÔNG nằm trong nội dung copy. */
    hint?: string | null;
}

/**
 * Danh sách mã dùng chung cho các bảng danh sách: mỗi dòng là một cặp nhãn (text-xs, xám nhạt)
 * và giá trị (font-mono, KHÔNG bẻ dòng) kèm nút copy nhanh, có thể kèm tên gợi ý bên cạnh mã.
 *
 * - Nhãn nằm chung một cột nên các hàng thẳng nhau, khoảng cách đều nhau.
 * - Nhãn và giá trị đều KHÔNG bẻ dòng; mã quá dài làm bảng rộng ra và cuộn ngang trong khung
 *   `overflow-x-auto` của trang, không đẩy tràn ngang cả trang ở màn hình hẹp (390px).
 * - `hint` (tùy chọn) hiển thị tên gợi ý cạnh mã bằng `text-xs text-gray-500`; nút copy CHỈ copy mã.
 * - Nút copy tối thiểu 44px trên mobile, 32px từ màn hình sm trở lên.
 */
@Component({
    selector: 'app-code-list',
    standalone: true,
    imports: [TranslateModule],
    template: `
        @if (items.length) {
            <div class="inline-grid grid-cols-[auto_auto_auto] items-center gap-x-2 gap-y-1">
                @for (item of items; track $index) {
                    <span class="whitespace-nowrap text-xs text-gray-400" [title]="item.label">{{ item.label }}{{ item.label ? ':' : '' }}</span>
                    <span class="flex items-center gap-2">
                        @if (trimmed(item.value)) {
                            <span class="font-mono text-sm text-gray-700 whitespace-nowrap" [title]="trimmed(item.value)">{{ trimmed(item.value) }}</span>
                        } @else {
                            <span class="font-mono text-sm text-gray-400 whitespace-nowrap">--</span>
                        }
                        @if (trimmed(item.hint)) {
                            <span class="max-w-[8.5rem] truncate text-xs text-gray-500" [title]="trimmed(item.hint)">{{ trimmed(item.hint) }}</span>
                        }
                    </span>
                    @if (trimmed(item.value)) {
                        <button type="button"
                            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-400 transition-colors hover:border-primary hover:text-primary sm:h-8 sm:w-8"
                            [title]="'COMMON.CODE.COPY' | translate"
                            [attr.aria-label]="'COMMON.CODE.COPY' | translate"
                            (click)="onCopy(item.value)">
                            <i class="fa-regular fa-copy text-xs"></i>
                        </button>
                    } @else {
                        <span aria-hidden="true"></span>
                    }
                }
            </div>
        }
    `
})
export class CodeListComponent {
    /** Các dòng mã cần hiển thị, theo thứ tự từ trên xuống. */
    @Input() items: CodeListItem[] = [];

    constructor(
        private readonly _toast: ToastService,
        private readonly _translate: TranslateService
    ) { }

    /** Giá trị mã đã cắt khoảng trắng; rỗng nghĩa là không có mã để hiển thị/copy. */
    trimmed(value?: string | null): string {
        return (value ?? '').toString().trim();
    }

    /** Chép một mã vào clipboard rồi báo toast xác nhận. */
    onCopy(value?: string | null): void {
        const text = this.trimmed(value);
        if (!text) return;

        copyToClipboard(text).then(() =>
            this._toast.success(this._translate.instant('COMMON.CODE.COPIED'))
        );
    }
}
