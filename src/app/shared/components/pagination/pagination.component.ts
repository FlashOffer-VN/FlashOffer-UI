import { Component, ElementRef, Input, OnDestroy, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnDestroy {
    @Input() pageNumber = 1;
    @Input() pageSize = 10;
    @Input() totalCount = 0;
    @Input() totalPages = 0;
    @Input() hasPreviousPage = false;
    @Input() hasNextPage = false;
    @Input() showInfo = true;
    @Input() showPageSize = true;
    @Input() pageSizes: number[] = [10, 20, 50];

    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    get pages(): (number | string)[] {
        const total = this.totalPages;
        const current = this.pageNumber;
        const delta = 2;
        const range: number[] = [];
        const rangeWithDots: (number | string)[] = [];
        let l: number | undefined;

        if (total === 0) {
            return [];
        }

        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l !== undefined) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    }

    getStartIndex(): number {
        if (this.totalCount === 0) return 0;
        return (this.pageNumber - 1) * this.pageSize + 1;
    }

    getEndIndex(): number {
        if (this.totalCount === 0) return 0;
        return Math.min(this.pageNumber * this.pageSize, this.totalCount);
    }

    onPageChange(page: number | string): void {
        if (typeof page === 'string') {
            return; // Skip if page is '...'
        }
        if (page >= 1 && page <= this.totalPages && page !== this.pageNumber) {
            this.pageChange.emit(page);
        }
    }

    /** Cỡ trang đang mở menu hay không. */
    sizeOpen = false;

    /** Toạ độ menu (position: fixed) tính từ nút khi mở. */
    menuTop = 0;
    menuRight = 0;

    /** Bề rộng menu — lấy đúng bằng nút để menu cân bằng với ô chính. */
    menuWidth = 0;

    @ViewChild('sizeBtn') private _sizeBtn?: ElementRef<HTMLButtonElement>;
    @ViewChild('sizeMenu') private _sizeMenu?: ElementRef<HTMLElement>;

    /** Chỗ cũ của menu để trả về trước khi Angular xoá (tránh node mồ côi trong body). */
    private _home: { parent: HTMLElement; next: Element | null } | null = null;
    private _onDocClick?: (event: MouseEvent) => void;
    private _onViewportChange?: () => void;

    /**
     * Mở/đóng menu cỡ trang. Menu được "nhấc" ra `document.body` khi mở vì bảng danh sách nằm trong
     * khối có stacking context / `overflow: hidden` — để nguyên trong đó thì z-index nào cũng bị che.
     */
    toggleSizeMenu(): void {
        if (this.sizeOpen) {
            this.closeSizeMenu();
            return;
        }
        this.sizeOpen = true;
        setTimeout(() => this.attachMenuToBody());   // đợi Angular render xong menu
    }

    /** Đóng menu và trả node về chỗ cũ để Angular xoá được sạch sẽ. */
    closeSizeMenu(): void {
        const menu = this._sizeMenu?.nativeElement;
        if (menu && this._home?.parent && menu.parentElement === document.body) {
            menu.classList.remove('is-portal');
            this._home.parent.insertBefore(menu, this._home.next);
        }
        this._home = null;
        this.detachListeners();
        this.sizeOpen = false;
    }

    private attachMenuToBody(): void {
        const btn = this._sizeBtn?.nativeElement;
        const menu = this._sizeMenu?.nativeElement;
        if (!btn || !menu) {
            return;
        }

        this._home = { parent: menu.parentElement as HTMLElement, next: menu.nextElementSibling };
        menu.classList.add('is-portal');
        document.body.appendChild(menu);

        const rect = btn.getBoundingClientRect();
        // Ưu tiên xổ LÊN trên nút; nếu không đủ chỗ thì mở xuống dưới.
        const above = rect.top - menu.offsetHeight - 6;
        this.menuTop = above >= 8 ? above : rect.bottom + 6;
        this.menuRight = Math.max(8, window.innerWidth - rect.right);
        this.menuWidth = rect.width;   // menu rộng bằng nút, canh phải trùng nhau

        this._onDocClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (!menu.contains(target) && !btn.contains(target)) {
                this.closeSizeMenu();
            }
        };
        this._onViewportChange = () => this.closeSizeMenu();
        document.addEventListener('click', this._onDocClick, true);
        window.addEventListener('scroll', this._onViewportChange, true);
        window.addEventListener('resize', this._onViewportChange, true);
    }

    private detachListeners(): void {
        if (this._onDocClick) {
            document.removeEventListener('click', this._onDocClick, true);
            this._onDocClick = undefined;
        }
        if (this._onViewportChange) {
            window.removeEventListener('scroll', this._onViewportChange, true);
            window.removeEventListener('resize', this._onViewportChange, true);
            this._onViewportChange = undefined;
        }
    }

    ngOnDestroy(): void {
        this.closeSizeMenu();
    }

    /** Chọn cỡ trang — đóng menu rồi báo cho trang gọi lại API với cỡ mới. */
    onPageSizePick(size: number): void {
        this.closeSizeMenu();
        if (size === this.pageSize) {
            return;
        }
        this.pageSizeChange.emit(Number(size));
    }
}