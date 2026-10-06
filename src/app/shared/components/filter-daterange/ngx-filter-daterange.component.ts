import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
    DATE_RANGE_PRESETS,
    DateCell,
    DateRangePreset,
    DateRangePresetKey,
    DateRangeValue,
    addDays,
    addMonths,
    buildMonthGrid,
    buildPresetRange,
    computePopupPosition,
    formatDisplayDate,
    isWithinRange,
    parseIsoDate,
    presetOf,
    startOfMonth,
    toIsoDate
} from './date-range.util';

/**
 * Bộ chọn khoảng ngày dùng chung cho mọi màn lọc: một hộp duy nhất hiển thị khoảng đang lọc
 * (hoặc tên khoảng nhanh), bấm vào mở lịch tháng kèm cột dọc chọn nhanh (hôm nay / 7 ngày / 15 ngày /
 * tháng này / tháng trước). Chọn ngày đầu rồi ngày cuối trên lịch là lọc ngay.
 *
 * Giữ nguyên giao diện [from] / [to] / (rangeChange) như bản 2 ô ngày trước đây nên mọi màn
 * đang dùng component này tự động có bộ chọn mới.
 */
@Component({
    selector: 'ngx-filter-daterange',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './ngx-filter-daterange.component.html',
    styleUrls: ['./ngx-filter-daterange.component.css']
})
export class NgxFilterDaterangeComponent {
    /** Ngày bắt đầu (YYYY-MM-DD) đang lọc. */
    @Input() from: string | null = null;

    /** Ngày kết thúc (YYYY-MM-DD) đang lọc. */
    @Input() to: string | null = null;

    /** Khoá i18n của nhãn khi chưa chọn khoảng nào. */
    @Input() placeholderKey = 'COMMON.DATE_RANGE.PLACEHOLDER';

    /** Khoảng ngày mới sau khi người dùng chọn (from/to = null nghĩa là bỏ lọc). */
    @Output() rangeChange = new EventEmitter<DateRangeValue>();

    readonly presets: readonly DateRangePreset[] = DATE_RANGE_PRESETS;

    isOpen = false;

    /** Tháng đang xem trên lịch (ngày 1 của tháng đó). */
    viewMonth: Date = startOfMonth(new Date());

    /** Ngày bắt đầu đang chờ chọn ngày kết thúc (chỉ dùng khi lịch đang mở). */
    pendingFrom: string | null = null;
    pendingTo: string | null = null;

    /** Toạ độ màn hình của bảng lịch (position: fixed) — tính lại mỗi lần mở/đổi kích thước/ cuộn. */
    popupTop: number | null = null;
    popupLeft: number | null = null;

    /** Bảng lịch (để đo kích thước thật khi tính vị trí). */
    @ViewChild('pop') private _pop?: ElementRef<HTMLElement>;

    private readonly _elementRef = inject(ElementRef<HTMLElement>);
    private readonly _translate = inject(TranslateService);

    /** Ngày hôm nay — tách riêng để test khoá được thời gian. */
    protected today(): Date {
        return new Date();
    }

    get hasValue(): boolean {
        return !!(this.from || this.to);
    }

    /** Chữ trên hộp: tên khoảng nhanh nếu khớp, không thì 2 ngày, không có gì thì nhãn gợi ý. */
    get displayText(): string {
        const preset = this.activePresetKey();
        if (preset) return this._translate.instant(this.labelOf(preset));

        if (this.from && this.to) return `${formatDisplayDate(this.from)} → ${formatDisplayDate(this.to)}`;
        if (this.from) return `${this._translate.instant('COMMON.FROM_DATE')} ${formatDisplayDate(this.from)}`;
        if (this.to) return `${this._translate.instant('COMMON.TO_DATE')} ${formatDisplayDate(this.to)}`;

        return this._translate.instant(this.placeholderKey);
    }

    get cells(): DateCell[] {
        return buildMonthGrid(this.viewMonth.getFullYear(), this.viewMonth.getMonth(), this.today());
    }

    get monthLabel(): string {
        return new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' }).format(this.viewMonth);
    }

    /** Gợi ý thao tác tiếp theo trên lịch. */
    get selectionHintKey(): string {
        return this.pendingFrom && !this.pendingTo ? 'COMMON.DATE_RANGE.HINT_END' : 'COMMON.DATE_RANGE.HINT_START';
    }

    toggle(): void {
        if (this.isOpen) {
            this.close();
            return;
        }
        this.open();
    }

    open(): void {
        this.isOpen = true;
        // Mở lịch ở tháng của ngày kết thúc (khoảng đang lọc) để thấy ngay lựa chọn hiện tại.
        const anchor = parseIsoDate(this.to) ?? parseIsoDate(this.from) ?? this.today();
        this.viewMonth = startOfMonth(anchor);
        this.pendingFrom = this.from;
        this.pendingTo = this.to;

        // Đo kích thước bảng lịch sau khi nó vào DOM rồi mới đặt vị trí (mở xuống dưới, hết chỗ thì mở lên trên).
        setTimeout(() => this.positionPopup());
    }

    /**
     * Đặt bảng lịch theo toạ độ màn hình (position: fixed) để không bị khung cuộn/ô chứa cắt mất nội dung,
     * đồng thời lật lên trên khi bên dưới không đủ chỗ và kẹp ngang trong màn hình.
     */
    positionPopup(): void {
        const panel = this._pop?.nativeElement;
        if (!this.isOpen || !panel) return;

        const trigger = this._elementRef.nativeElement.getBoundingClientRect();
        const position = computePopupPosition(
            { top: trigger.top, bottom: trigger.bottom, left: trigger.left },
            { width: panel.offsetWidth, height: panel.offsetHeight },
            { width: window.innerWidth, height: window.innerHeight });

        this.popupTop = position.top;
        this.popupLeft = position.left;
    }

    /** Đổi kích thước cửa sổ hoặc cuộn trang thì đặt lại vị trí bảng lịch. */
    @HostListener('window:resize')
    @HostListener('window:scroll')
    onViewportChange(): void {
        if (this.isOpen) this.positionPopup();
    }

    close(): void {
        this.isOpen = false;
        this.pendingFrom = null;
        this.pendingTo = null;
        this.popupTop = null;
        this.popupLeft = null;
    }

    /** Bấm ra ngoài component thì đóng lịch. */
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.isOpen) return;
        if (this._elementRef.nativeElement.contains(event.target as Node)) return;

        this.close();
    }

    applyPreset(preset: DateRangePreset): void {
        this.emit(buildPresetRange(preset.key, this.today()));
        this.close();
    }

    /** Chọn ngày trên lịch: lần 1 là ngày bắt đầu, lần 2 là ngày kết thúc → lọc ngay. */
    pick(cell: DateCell): void {
        const iso = cell.iso;

        if (!this.pendingFrom || this.pendingTo) {
            this.pendingFrom = iso;
            this.pendingTo = null;
            return;
        }

        const start = iso < this.pendingFrom ? iso : this.pendingFrom;
        const end = iso < this.pendingFrom ? this.pendingFrom : iso;

        this.emit({ from: start, to: end });
        this.close();
    }

    clear(event?: Event): void {
        event?.stopPropagation();
        this.emit({ from: null, to: null });
        this.close();
    }

    previousMonth(): void {
        this.viewMonth = startOfMonth(addMonths(this.viewMonth, -1));
    }

    nextMonth(): void {
        this.viewMonth = startOfMonth(addMonths(this.viewMonth, 1));
    }

    goToToday(): void {
        this.viewMonth = startOfMonth(this.today());
    }

    /** Khoảng nhanh khớp với khoảng đang lọc (để tô đậm mục tương ứng ở cột dọc). */
    activePresetKey(): DateRangePresetKey | null {
        return presetOf({ from: this.from, to: this.to }, this.today());
    }

    isPresetActive(preset: DateRangePreset): boolean {
        return this.activePresetKey() === preset.key;
    }

    /** Trạng thái của một ô lịch: đang là đầu/cuối khoảng, nằm trong khoảng, hay đang chờ chọn. */
    isRangeStart(cell: DateCell): boolean {
        return cell.iso === (this.pendingFrom ?? this.from);
    }

    isRangeEnd(cell: DateCell): boolean {
        return cell.iso === (this.pendingTo ?? this.to);
    }

    isInRange(cell: DateCell): boolean {
        const from = this.pendingFrom ?? this.from;
        const to = this.pendingTo ?? this.to;

        if (!from || !to || from === to) return false;
        return cell.iso > from && cell.iso < to;
    }

    isSelectedDay(cell: DateCell): boolean {
        return this.isRangeStart(cell) || this.isRangeEnd(cell) || this.isInRange(cell);
    }

    private emit(range: DateRangeValue): void {
        // Phòng khi dữ liệu vào lệch (from > to) — không phát ra khoảng sai.
        if (range.from && range.to && range.from > range.to) return;

        this.from = range.from;
        this.to = range.to;
        this.rangeChange.emit(range);
    }

    private labelOf(key: DateRangePresetKey): string {
        return this.presets.find(preset => preset.key === key)?.labelKey ?? key;
    }

    private get locale(): string {
        return (this._translate.currentLang || 'vi').startsWith('en') ? 'en-US' : 'vi-VN';
    }

    /** Nhãn thứ trong tuần theo ngôn ngữ đang dùng — gọi lúc render vì ngôn ngữ có thể đổi. */
    weekDayLabels(): string[] {
        const formatter = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });
        const monday = new Date(2024, 0, 1);

        return Array.from({ length: 7 }, (_, index) => formatter.format(addDays(monday, index)));
    }
}

/** Giữ export cũ để nơi khác import từ component vẫn chạy. */
export type { DateRangeValue } from './date-range.util';
