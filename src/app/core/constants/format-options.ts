/** Tuỳ chọn cho ô chọn của app (`app-ng-select-wrapper`). */
export interface SelectOption {
    label: string;
    value: string;
}

/** Ký hiệu tiền tệ thường dùng, giá trị lưu chính là ký hiệu. */
export const CURRENCY_OPTIONS: SelectOption[] = [
    { value: '₫', label: '₫ · VND — Việt Nam Đồng' },
    { value: '$', label: '$ · USD — Đô la Mỹ' },
    { value: '€', label: '€ · EUR — Euro' },
    { value: '£', label: '£ · GBP — Bảng Anh' },
    { value: '¥', label: '¥ · JPY — Yên Nhật' },
    { value: '元', label: '元 · CNY — Nhân dân tệ' },
    { value: '₩', label: '₩ · KRW — Won Hàn Quốc' },
    { value: '฿', label: '฿ · THB — Baht Thái' },
    { value: '₱', label: '₱ · PHP — Peso Philippines' },
    { value: 'RM', label: 'RM · MYR — Ringgit Malaysia' },
    { value: 'S$', label: 'S$ · SGD — Đô la Singapore' },
    { value: '₹', label: '₹ · INR — Rupee Ấn Độ' },
    { value: 'Rp', label: 'Rp · IDR — Rupiah Indonesia' },
    { value: 'NT$', label: 'NT$ · TWD — Đô la Đài Loan' },
    { value: 'A$', label: 'A$ · AUD — Đô la Úc' }
];

/** Danh sách dự phòng khi trình duyệt không hỗ trợ `Intl.supportedValuesOf`. */
const FALLBACK_TIME_ZONES: string[] = [
    'Asia/Ho_Chi_Minh', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Hong_Kong', 'Asia/Shanghai', 'Asia/Taipei',
    'Asia/Seoul', 'Asia/Tokyo', 'Asia/Jakarta', 'Asia/Kuala_Lumpur', 'Asia/Manila', 'Asia/Kolkata',
    'Asia/Dubai', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow', 'America/New_York',
    'America/Chicago', 'America/Los_Angeles', 'Australia/Sydney', 'Pacific/Auckland', 'UTC'
];

/** Múi giờ kèm chênh lệch UTC, sắp theo chênh lệch để dễ tìm. */
export function timeZoneOptions(): SelectOption[] {
    const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
    const zones = intl.supportedValuesOf?.('timeZone') ?? FALLBACK_TIME_ZONES;

    return zones
        .map(zone => {
            const offset = timeZoneOffsetLabel(zone);
            return { value: zone, label: `${zone} · ${offset}`, hours: offsetHours(zone) };
        })
        .sort((a, b) => a.hours - b.hours || a.value.localeCompare(b.value))
        .map(({ label, value }) => ({ label, value }));
}

/** Chênh lệch UTC của một múi giờ, ví dụ `UTC+7`. */
export function timeZoneOffsetLabel(zone: string): string {
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(new Date());
        return parts.find(part => part.type === 'timeZoneName')?.value ?? '';
    } catch {
        return '';
    }
}

function offsetHours(zone: string): number {
    const label = timeZoneOffsetLabel(zone);
    const match = /UTC([+-])(\d{1,2})(?::(\d{2}))?/.exec(label);
    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    return sign * (Number(match[2]) + Number(match[3] ?? 0) / 60);
}

/** Khung giờ làm việc thường dùng của bộ phận hỗ trợ; giá trị lưu chính là nhãn hiển thị. */
export const WORKING_HOURS_OPTIONS: SelectOption[] = [
    { value: 'Thứ 2 - Thứ 6, 8:00 - 17:00', label: 'Thứ 2 - Thứ 6 · 8:00 - 17:00' },
    { value: 'Thứ 2 - Thứ 6, 8:00 - 17:30', label: 'Thứ 2 - Thứ 6 · 8:00 - 17:30' },
    { value: 'Thứ 2 - Thứ 6, 8:30 - 18:00', label: 'Thứ 2 - Thứ 6 · 8:30 - 18:00' },
    { value: 'Thứ 2 - Thứ 6, 9:00 - 18:00', label: 'Thứ 2 - Thứ 6 · 9:00 - 18:00' },
    { value: 'Thứ 2 - Thứ 7, 8:00 - 17:00', label: 'Thứ 2 - Thứ 7 · 8:00 - 17:00' },
    { value: 'Thứ 2 - Thứ 7, 8:00 - 17:30', label: 'Thứ 2 - Thứ 7 · 8:00 - 17:30' },
    { value: 'Thứ 2 - Chủ nhật, 8:00 - 21:00', label: 'Cả tuần · 8:00 - 21:00' },
    { value: 'Hỗ trợ 24/7', label: 'Hỗ trợ 24/7' }
];

/** Định dạng ngày hiển thị; giá trị lưu chính là mẫu định dạng. */
export const DATE_FORMAT_OPTIONS: SelectOption[] = [
    { value: 'dd/MM/yyyy', label: 'dd/MM/yyyy · 31/12/2026' },
    { value: 'dd-MM-yyyy', label: 'dd-MM-yyyy · 31-12-2026' },
    { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy · 12/31/2026' },
    { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd · 2026-12-31' },
    { value: 'dd/MM/yyyy HH:mm', label: 'dd/MM/yyyy HH:mm · 31/12/2026 23:59' }
];

/**
 * Bổ sung giá trị đang lưu vào danh sách chọn nếu danh sách chưa có, để ô chọn không hiện trống.
 */
export function withCurrentOption(options: SelectOption[], current?: string | null): SelectOption[] {
    if (!current || options.some(option => option.value === current)) return options;

    return [{ label: current, value: current }, ...options];
}
