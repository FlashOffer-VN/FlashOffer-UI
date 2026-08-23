// shared/pipes/read-more.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'readMore',
    standalone: true
})
export class ReadMorePipe implements PipeTransform {
    transform(
        value: string | null | undefined,
        isExpanded: boolean = false,
        limit: number = 200,
        ellipsis: string = '...'
    ): string {
        if (!value) return '';
        if (isExpanded || value.length <= limit) return value;
        return value.slice(0, limit) + ellipsis;
    }
}