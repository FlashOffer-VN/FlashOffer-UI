// src/app/shared/pipes/format-html.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'formatHtml',
    standalone: true
})
export class FormatHtmlPipe implements PipeTransform {
    constructor(private _sanitizer: DomSanitizer) { }

    transform(value: string | SafeHtml | null | undefined, options?: FormatOptions): SafeHtml {
        if (!value) return '';

        // Chuyển đổi an toàn sang string
        let html: string = String(value);

        // Nếu vẫn không có giá trị, return empty
        if (!html) return '';

        // 1. Font chữ - mặc định Inter
        const fontFamily = options?.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';

        // 2. Cỡ chữ - mặc định 15px
        const fontSize = options?.fontSize || '15px';

        // 3. Màu chữ - mặc định #1F2937
        const color = options?.color || '#1F2937';

        // 4. Khoảng cách dòng - mặc định 1.7
        const lineHeight = options?.lineHeight || '1.7';

        // 5. Căn lề
        const textAlign = options?.textAlign || '';

        // Build style string
        let styles = `font-family: ${fontFamily}; font-size: ${fontSize}; color: ${color}; line-height: ${lineHeight};`;
        if (textAlign) {
            styles += ` text-align: ${textAlign};`;
        }

        // Wrap với div có style
        const result = `<div style="${styles}">${html}</div>`;

        // Sanitize để bảo mật
        const sanitized = this._sanitizer.sanitize(1, result);
        return sanitized || '';
    }
}

export interface FormatOptions {
    fontFamily?: string;   // Mặc định: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    fontSize?: string;     // Mặc định: '15px'
    color?: string;        // Mặc định: '#1F2937'
    lineHeight?: string;   // Mặc định: '1.7'
    textAlign?: string;    // 'left', 'center', 'right', 'justify'
}