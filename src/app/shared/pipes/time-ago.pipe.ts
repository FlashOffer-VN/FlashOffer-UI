// src/app/shared/pipes/time-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    standalone: true
})
export class TimeAgoPipe implements PipeTransform {
    transform(value: string | Date | null | undefined): string {
        if (!value) return '';

        const date = typeof value === 'string' ? new Date(value) : value;
        if (!(date instanceof Date) || isNaN(date.getTime())) return '';

        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 0) return 'Vừa xong';
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
        if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
        if (diff < 2592000) return Math.floor(diff / 86400) + ' ngày trước';
        if (diff < 31536000) return Math.floor(diff / 2592000) + ' tháng trước';
        return Math.floor(diff / 31536000) + ' năm trước';
    }
} // 