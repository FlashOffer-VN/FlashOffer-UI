// core/utils/string-helper.ts
export class StringHelper {
    // ==================== KIỂM TRA CƠ BẢN ====================

    static isNullOrEmpty(value: string | null | undefined): boolean {
        return value === null || value === undefined || value === '';
    }

    static isNullOrWhitespace(value: string | null | undefined): boolean {
        return value === null || value === undefined || value.trim() === '';
    }

    static hasValue(value: string | null | undefined): boolean {
        return !StringHelper.isNullOrWhitespace(value);
    }

    static isEmpty(value: string | null | undefined): boolean {
        return StringHelper.isNullOrEmpty(value);
    }

    // ==================== VALIDATION ====================

    static isValidEmail(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value!);
    }

    static isValidPhoneNumber(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        return /^0[0-9]{9,10}$/.test(value!);
    }

    static isValidFullName(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        return value!.trim().length >= 2;
    }

    static isValidUrl(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        try { new URL(value!); return true; } catch { return false; }
    }

    static isValidGuid(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value!);
    }

    static isNumeric(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        return /^-?\d+(\.\d+)?$/.test(value!);
    }

    static isInteger(value: string | null | undefined): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        return /^-?\d+$/.test(value!);
    }

    // ==================== PARSE (AN TOÀN) ====================

    static toInt(value: string | null | undefined, defaultValue: number = 0): number {
        if (StringHelper.isNullOrWhitespace(value)) return defaultValue;
        const parsed = parseInt(value!, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    static toFloat(value: string | null | undefined, defaultValue: number = 0): number {
        if (StringHelper.isNullOrWhitespace(value)) return defaultValue;
        const parsed = parseFloat(value!);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    static toBoolean(value: string | null | undefined, defaultValue: boolean = false): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return defaultValue;
        const lower = value!.toLowerCase().trim();
        if (lower === 'true' || lower === '1' || lower === 'yes') return true;
        if (lower === 'false' || lower === '0' || lower === 'no') return false;
        return defaultValue;
    }

    static toDate(value: string | null | undefined, defaultValue?: Date): Date | null {
        if (StringHelper.isNullOrWhitespace(value)) return defaultValue || null;
        const date = new Date(value!);
        return isNaN(date.getTime()) ? (defaultValue || null) : date;
    }

    static toJson<T>(value: string | null | undefined, defaultValue: T): T {
        if (StringHelper.isNullOrWhitespace(value)) return defaultValue;
        try { return JSON.parse(value!); } catch { return defaultValue; }
    }

    static toNumber(value: string | null | undefined, defaultValue: number = 0): number {
        return StringHelper.toFloat(value, defaultValue);
    }

    // ==================== GET / DEFAULT ====================

    static defaultIfEmpty(value: string | null | undefined, defaultValue: string): string {
        return StringHelper.isNullOrEmpty(value) ? defaultValue : value!;
    }

    static defaultIfWhitespace(value: string | null | undefined, defaultValue: string): string {
        return StringHelper.isNullOrWhitespace(value) ? defaultValue : value!;
    }

    static trimOrDefault(value: string | null | undefined, defaultValue: string = ''): string {
        if (StringHelper.isNullOrWhitespace(value)) return defaultValue;
        return value!.trim();
    }

    // ==================== FORMAT / XỬ LÝ CHUỖI ====================

    static format(template: string, ...args: any[]): string {
        return template.replace(/{(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }

    static formatWith(template: string, data: Record<string, any>): string {
        return template.replace(/{([^}]+)}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    static removeWhitespace(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.replace(/\s/g, '');
    }

    static removeSpecialChars(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.replace(/[^a-zA-Z0-9\s]/g, '');
    }

    static removeVietnameseAccents(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        const accents = 'àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ';
        const unaccent = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
        let result = value!;
        for (let i = 0; i < accents.length; i++) {
            result = result.replace(new RegExp(accents[i], 'g'), unaccent[i]);
        }
        return result;
    }

    static capitalize(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.charAt(0).toUpperCase() + value!.slice(1).toLowerCase();
    }

    static capitalizeEachWord(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    static toSlug(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return StringHelper.removeVietnameseAccents(value!)
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
    }

    static truncate(value: string | null | undefined, maxLength: number, suffix: string = '...'): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        if (value!.length <= maxLength) return value!;
        return value!.substring(0, maxLength).trim() + suffix;
    }

    static padLeft(value: string | null | undefined, totalWidth: number, paddingChar: string = ' '): string {
        if (StringHelper.isNullOrWhitespace(value)) return paddingChar.repeat(totalWidth);
        return value!.padStart(totalWidth, paddingChar);
    }

    static padRight(value: string | null | undefined, totalWidth: number, paddingChar: string = ' '): string {
        if (StringHelper.isNullOrWhitespace(value)) return paddingChar.repeat(totalWidth);
        return value!.padEnd(totalWidth, paddingChar);
    }

    static join(separator: string, ...values: (string | null | undefined)[]): string {
        return values.filter(v => StringHelper.hasValue(v)).join(separator);
    }

    // ==================== GET SUBSTRING ====================

    static left(value: string | null | undefined, length: number): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.substring(0, length);
    }

    static right(value: string | null | undefined, length: number): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.substring(Math.max(0, value!.length - length));
    }

    static mid(value: string | null | undefined, start: number, length: number): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        return value!.substring(start, start + length);
    }

    static firstN(value: string | null | undefined, n: number): string {
        return StringHelper.left(value, n);
    }

    static lastN(value: string | null | undefined, n: number): string {
        return StringHelper.right(value, n);
    }

    // ==================== SO SÁNH ====================

    static equalsIgnoreCase(a: string | null | undefined, b: string | null | undefined): boolean {
        if (!StringHelper.hasValue(a) && !StringHelper.hasValue(b)) return true;
        if (!StringHelper.hasValue(a) || !StringHelper.hasValue(b)) return false;
        return a!.toLowerCase() === b!.toLowerCase();
    }

    static contains(value: string | null | undefined, search: string, ignoreCase: boolean = false): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        if (ignoreCase) {
            return value!.toLowerCase().includes(search.toLowerCase());
        }
        return value!.includes(search);
    }

    static startsWith(value: string | null | undefined, search: string, ignoreCase: boolean = false): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        if (ignoreCase) {
            return value!.toLowerCase().startsWith(search.toLowerCase());
        }
        return value!.startsWith(search);
    }

    static endsWith(value: string | null | undefined, search: string, ignoreCase: boolean = false): boolean {
        if (StringHelper.isNullOrWhitespace(value)) return false;
        if (ignoreCase) {
            return value!.toLowerCase().endsWith(search.toLowerCase());
        }
        return value!.endsWith(search);
    }

    // ==================== MASK / ẨN DỮ LIỆU ====================

    static maskEmail(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        const [username, domain] = value!.split('@');
        if (!domain) return value!;
        const maskedUsername = username.length <= 2
            ? username
            : username.substring(0, 2) + '*'.repeat(Math.min(username.length - 2, 4));
        return `${maskedUsername}@${domain}`;
    }

    static maskPhone(value: string | null | undefined): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        if (value!.length <= 4) return value!;
        const start = value!.substring(0, 3);
        const end = value!.substring(value!.length - 3);
        return `${start}****${end}`;
    }

    static mask(value: string | null | undefined, visibleStart: number = 2, visibleEnd: number = 2): string {
        if (StringHelper.isNullOrWhitespace(value)) return '';
        const len = value!.length;
        if (len <= visibleStart + visibleEnd) return value!;
        const start = value!.substring(0, visibleStart);
        const end = value!.substring(len - visibleEnd);
        const stars = '*'.repeat(Math.min(len - visibleStart - visibleEnd, 6));
        return `${start}${stars}${end}`;
    }

    // ==================== MỞ RỘNG ====================

    static empty(): string { return ''; }

    static random(length: number = 8, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static generateSlug(value: string | null | undefined): string {
        return StringHelper.toSlug(value);
    }
}