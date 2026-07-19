import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-pagination',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
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

    onPageSizeChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        const size = parseInt(select.value, 10);
        this.pageSizeChange.emit(size);
    }
}