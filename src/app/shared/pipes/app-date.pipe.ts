// src/app/shared/pipes/app-date.pipe.ts
import { DatePipe } from '@angular/common';
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

/** Các kiểu hiển thị ngày giờ dùng chung trong app. */
export type DateDisplayMode = 'date' | 'time' | 'datetime' | 'full';

const DATE_PATTERNS: Record<DateDisplayMode, string> = {
    date: 'dd/MM/yyyy',
    time: 'HH:mm',
    datetime: 'dd/MM/yyyy HH:mm',
    full: 'dd/MM/yyyy HH:mm:ss'
};

/**
 * Hiển thị ngày giờ theo định dạng dùng chung: mặc định `dd/MM/yyyy HH:mm`,
 * truyền `'date' | 'time' | 'full'` khi cần kiểu khác.
 * Rỗng hoặc không phải ngày hợp lệ trả về `--` để template khỏi tự kiểm tra.
 */
@Pipe({
    name: 'appDate',
    standalone: true
})
export class AppDatePipe implements PipeTransform {
    private readonly _datePipe: DatePipe;

    constructor(@Inject(LOCALE_ID) locale: string) {
        this._datePipe = new DatePipe(locale);
    }

    transform(value: string | Date | null | undefined, mode: DateDisplayMode = 'datetime'): string {
        if (!value) return '--';

        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return '--';

        return this._datePipe.transform(date, DATE_PATTERNS[mode] ?? DATE_PATTERNS.datetime) ?? '--';
    }
}
