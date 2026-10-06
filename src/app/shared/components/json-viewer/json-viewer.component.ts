import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { isBrowser } from '@core/utils/platform';

import { JsonFormatResult, JsonTokenKind, countLines, formatJson, prettyJson } from './json-format.util';

/**
 * Khung hiển thị JSON của nhật ký hoạt động: in đẹp 2 space, tô màu theo kiểu dữ liệu
 * (khoá / chuỗi / số / boolean / null), cuộn trong khung và có nút sao chép.
 * Giá trị không phải JSON thì hiển thị nguyên văn để vẫn đọc được.
 */
@Component({
    selector: 'app-json-viewer',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        @if (result.lines.length === 0) {
            <span class="jv__empty">—</span>
        } @else {
            <div class="jv__head">
                <span class="jv__meta">{{ lineCount }} {{ 'COMMON.JSON.LINES' | translate }}</span>
                <button type="button" class="jv__copy" (click)="copy()" [title]="'COMMON.CODE.COPY' | translate">
                    <i class="fa-regular" [class.fa-copy]="!copied" [class.fa-circle-check]="copied"></i>
                    {{ (copied ? 'COMMON.CODE.COPIED' : 'COMMON.CODE.COPY') | translate }}
                </button>
            </div>

            <pre class="jv__body" [class.jv__body--raw]="!result.isJson" [style.max-height.px]="maxHeight">@for (line of result.lines; track $index) {<div class="jv__line">@for (token of line.tokens; track $index) {<span class="jv__t" [ngClass]="kindClass(token.kind)">{{ token.text }}</span>}</div>}</pre>
        }
    `,
    styles: [`
        :host {
            display: block;
        }

        .jv__head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            margin-bottom: 4px;
        }

        .jv__meta {
            font-size: 11px;
            color: var(--text-subtle);
        }

        .jv__copy {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            border: 1px solid var(--border);
            border-radius: 0.375rem;
            background: var(--white);
            color: var(--text-muted);
            font-family: inherit;
            font-size: 11px;
            cursor: pointer;
            transition: all 150ms ease;
        }

        .jv__copy:hover {
            border-color: var(--accent);
            color: var(--accent-dark);
        }

        .jv__body {
            margin: 0;
            padding: 8px 10px;
            max-height: 224px;
            overflow: auto;
            background: var(--surface-soft);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            font-family: 'JetBrains Mono', 'Cascadia Code', Consolas, monospace;
            font-size: 12px;
            line-height: 1.5;
            white-space: pre;
        }

        .jv__body--raw {
            white-space: pre-wrap;
        }

        .jv__line {
            display: block;
        }

        .jv__t {
            white-space: pre;
        }

        .jv__t--key {
            color: var(--accent-dark);
        }

        .jv__t--string {
            color: var(--success-dark);
        }

        .jv__t--number {
            color: var(--orange-dark);
        }

        .jv__t--boolean {
            color: var(--pink-dark);
        }

        .jv__t--null {
            color: var(--text-subtle);
            font-style: italic;
        }

        .jv__empty {
            color: var(--text-subtle);
        }
    `]
})
export class JsonViewerComponent implements OnChanges {
    /** Chuỗi JSON thô (OldValues / NewValues / ChangedProperties của nhật ký). */
    @Input() value: string | null | undefined = null;

    /** Chiều cao tối đa của khung (px). */
    @Input() maxHeight = 224;

    result: JsonFormatResult = { lines: [], isJson: false };
    copied = false;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['value']) {
            this.result = formatJson(this.value);
            this.copied = false;
        }
    }

    get lineCount(): number {
        return countLines(this.result);
    }

    kindClass(kind: JsonTokenKind): string {
        return `jv__t--${kind}`;
    }

    /** Sao chép bản in đẹp để dán ra ngoài (log thô không phải JSON thì sao chép nguyên văn). */
    copy(): void {
        const text = prettyJson(this.value);
        // isBrowser(): navigator chỉ có trong trình duyệt (lúc prerender không có) — không có thì bỏ qua.
        if (!text || !isBrowser()) return;

        navigator.clipboard?.writeText(text).then(
            () => {
                this.copied = true;
                setTimeout(() => (this.copied = false), 1500);
            },
            () => (this.copied = false)
        );
    }
}
