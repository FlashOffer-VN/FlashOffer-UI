import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface DateRangeValue {
    from: string | null;
    to: string | null;
}

@Component({
    selector: 'ngx-filter-daterange',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './ngx-filter-daterange.component.html',
    styleUrls: ['./ngx-filter-daterange.component.css']
})
export class NgxFilterDaterangeComponent {
    @Input() from: string | null = null;
    @Input() to: string | null = null;
    @Output() rangeChange = new EventEmitter<DateRangeValue>();

    onFromChange(value: string): void {
        this.from = value || null;
        this.emit();
    }

    onToChange(value: string): void {
        this.to = value || null;
        this.emit();
    }

    clear(): void {
        this.from = null;
        this.to = null;
        this.emit();
    }

    private emit(): void {
        // Không emit khi from > to (2 input date format YYYY-MM-DD so sánh chuỗi được)
        if (this.from && this.to && this.from > this.to) {
            return;
        }
        this.rangeChange.emit({ from: this.from, to: this.to });
    }
}