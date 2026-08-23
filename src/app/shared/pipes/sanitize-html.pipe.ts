// src/app/shared/pipes/sanitize-html.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'sanitizeHtml',
    standalone: true
})
export class SanitizeHtmlPipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) { }

    transform(value: string | SafeHtml | null | undefined): SafeHtml {
        if (!value) return '';

        // Chuyển sang string
        const html = String(value);
        if (!html) return '';

        const sanitized = this._sanitizer.sanitize(1, html);
        return sanitized || '';
    }
}