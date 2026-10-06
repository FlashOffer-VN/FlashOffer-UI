/**
 * Tiện ích hiển thị JSON dễ đọc (nhật ký hoạt động): in đẹp 2 space rồi tách thành từng dòng / từng
 * token để tô màu theo kiểu dữ liệu. Không dùng innerHTML nên không phải lo sanitizer.
 */

export type JsonTokenKind = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'plain';

export interface JsonToken {
    text: string;
    kind: JsonTokenKind;
}

export interface JsonLine {
    tokens: JsonToken[];
}

export interface JsonFormatResult {
    lines: JsonLine[];
    /** false = giá trị không phải JSON (hoặc rỗng) nên chỉ hiển thị nguyên văn. */
    isJson: boolean;
}

// Nhận diện 1 token JSON: chuỗi (kèm dấu hai chấm nếu là khoá), true/false/null, hoặc số.
const TOKEN_PATTERN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"\s*:)|("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")|\b(true|false)\b|\bnull\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

const EMPTY_RESULT: JsonFormatResult = { lines: [], isJson: false };

/**
 * Chuỗi JSON (cột OldValues/NewValues/ChangedProperties) → các dòng đã tách token để render.
 * Chuỗi rỗng/không phải JSON thì trả về nguyên văn từng dòng (isJson = false) để vẫn đọc được.
 */
export function formatJson(raw: string | null | undefined): JsonFormatResult {
    if (raw === null || raw === undefined || raw.trim() === '') return EMPTY_RESULT;

    let pretty: string;
    let isJson = false;

    try {
        pretty = JSON.stringify(JSON.parse(raw), null, 2);
        isJson = true;
    } catch {
        pretty = raw;
    }

    return { lines: pretty.split(/\r?\n/).map(line => ({ tokens: tokenize(line, isJson) })), isJson };
}

/** Chuỗi JSON (nếu hợp lệ) đã in đẹp — dùng cho nút sao chép. */
export function prettyJson(raw: string | null | undefined): string {
    if (raw === null || raw === undefined || raw.trim() === '') return '';

    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
}

/** Số dòng đang hiển thị (dùng cho nhãn "N dòng"). */
export function countLines(result: JsonFormatResult): number {
    return result.lines.length;
}

function tokenize(line: string, highlight: boolean): JsonToken[] {
    if (!highlight) return line.length === 0 ? [] : [{ text: line, kind: 'plain' }];

    const tokens: JsonToken[] = [];
    let lastIndex = 0;

    for (const match of line.matchAll(TOKEN_PATTERN)) {
        const start = match.index ?? 0;
        if (start > lastIndex) tokens.push({ text: line.slice(lastIndex, start), kind: 'plain' });
        tokens.push({ text: match[0], kind: kindOf(match[0]) });
        lastIndex = start + match[0].length;
    }

    if (lastIndex < line.length) tokens.push({ text: line.slice(lastIndex), kind: 'plain' });

    return tokens;
}

function kindOf(token: string): JsonTokenKind {
    if (token.startsWith('"')) return token.trimEnd().endsWith(':') ? 'key' : 'string';
    if (token === 'true' || token === 'false') return 'boolean';
    if (token === 'null') return 'null';
    return 'number';
}
