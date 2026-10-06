/**
 * Tiện ích dùng chung cho bộ chọn khoảng ngày: khoảng nhanh (hôm nay / 7 ngày / 15 ngày / tháng này /
 * tháng trước), lưới lịch tháng và chuỗi ngày dạng YYYY-MM-DD — cùng định dạng với value của
 * input[type=date] và tham số FromDate/ToDate của API.
 */

/** Khoảng ngày đang lọc; null nghĩa là không giới hạn ở đầu đó. */
export interface DateRangeValue {
    from: string | null;
    to: string | null;
}

/** Mã khoảng nhanh hiển thị ở cột dọc bên trái lịch. */
export type DateRangePresetKey = 'today' | 'last7Days' | 'last15Days' | 'thisMonth' | 'lastMonth';

export interface DateRangePreset {
    key: DateRangePresetKey;
    /** Khoá i18n của nhãn hiển thị. */
    labelKey: string;
}

export const DATE_RANGE_PRESETS: readonly DateRangePreset[] = [
    { key: 'today', labelKey: 'COMMON.DATE_RANGE.TODAY' },
    { key: 'last7Days', labelKey: 'COMMON.DATE_RANGE.LAST_7_DAYS' },
    { key: 'last15Days', labelKey: 'COMMON.DATE_RANGE.LAST_15_DAYS' },
    { key: 'thisMonth', labelKey: 'COMMON.DATE_RANGE.THIS_MONTH' },
    { key: 'lastMonth', labelKey: 'COMMON.DATE_RANGE.LAST_MONTH' }
];

/** Một ô của lưới lịch tháng. */
export interface DateCell {
    date: Date;
    /** Chuỗi YYYY-MM-DD của ngày. */
    iso: string;
    day: number;
    /** false = ngày của tháng trước/sau (hiển thị mờ cho đủ 6 tuần). */
    inMonth: boolean;
    isToday: boolean;
    isWeekend: boolean;
}

/** Lưới lịch luôn đủ 6 tuần × 7 ngày để chiều cao không nhảy khi đổi tháng. */
export const MONTH_CELL_COUNT = 42;

const pad = (value: number): string => value.toString().padStart(2, '0');

/**
 * Ngày theo giờ ĐỊA PHƯƠNG → YYYY-MM-DD. Không dùng toISOString (quy về UTC) vì sẽ lệch ngày
 * khi múi giờ âm/dương so với UTC — lọc theo ngày sẽ sai và UI hiển thị lệch 1 ngày.
 */
export function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** YYYY-MM-DD → Date giờ địa phương (00:00); chuỗi rỗng/không hợp lệ trả null. */
export function parseIsoDate(value: string | null | undefined): Date | null {
    if (!value) return null;

    const parts = value.split('-').map(part => Number(part));
    if (parts.length !== 3 || parts.some(part => Number.isNaN(part))) return null;

    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
}

/** Cộng/trừ số ngày, trả về Date mới (không sửa Date gốc). */
export function addDays(date: Date, days: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Cộng/trừ số tháng; ngày vượt quá số ngày của tháng đích sẽ tự neo về ngày cuối tháng. */
export function addMonths(date: Date, months: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

/** Ngày đầu tháng của một mốc thời gian. */
export function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Ngày cuối tháng của một mốc thời gian. */
export function endOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Chuỗi YYYY-MM-DD của khoảng nhanh, tính theo ngày hiện tại (truyền vào để test được). */
export function buildPresetRange(key: DateRangePresetKey, today: Date = new Date()): DateRangeValue {
    switch (key) {
        case 'today':
            return { from: toIsoDate(today), to: toIsoDate(today) };
        case 'last7Days':
            // 7 ngày tính cả hôm nay: hôm nay lùi 6 ngày.
            return { from: toIsoDate(addDays(today, -6)), to: toIsoDate(today) };
        case 'last15Days':
            // 15 ngày tính cả hôm nay: hôm nay lùi 14 ngày.
            return { from: toIsoDate(addDays(today, -14)), to: toIsoDate(today) };
        case 'thisMonth':
            return { from: toIsoDate(startOfMonth(today)), to: toIsoDate(today) };
        case 'lastMonth': {
            const lastMonth = addMonths(startOfMonth(today), -1);
            return { from: toIsoDate(startOfMonth(lastMonth)), to: toIsoDate(endOfMonth(lastMonth)) };
        }
    }
}

/**
 * Khoảng nhanh khớp đúng khoảng đang lọc (để hiển thị tên khoảng thay vì 2 ngày), null nếu là
 * khoảng tự chọn.
 */
export function presetOf(range: DateRangeValue, today: Date = new Date()): DateRangePresetKey | null {
    if (!range.from || !range.to) return null;

    const matched = DATE_RANGE_PRESETS.find(preset => {
        const built = buildPresetRange(preset.key, today);
        return built.from === range.from && built.to === range.to;
    });

    return matched ? matched.key : null;
}

/** Lưới lịch 6 tuần của một tháng, tuần bắt đầu từ THỨ HAI (thói quen lịch Việt Nam). */
export function buildMonthGrid(year: number, month: number, today: Date = new Date()): DateCell[] {
    const firstOfMonth = new Date(year, month, 1);
    // getDay(): 0 = Chủ nhật → 6 = thứ Bảy; (x + 6) % 7 quy về thứ Hai = 0.
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = addDays(firstOfMonth, -mondayOffset);
    const todayIso = toIsoDate(today);

    const cells: DateCell[] = [];
    for (let index = 0; index < MONTH_CELL_COUNT; index++) {
        const date = addDays(gridStart, index);
        const iso = toIsoDate(date);
        cells.push({
            date,
            iso,
            day: date.getDate(),
            inMonth: date.getMonth() === month && date.getFullYear() === year,
            isToday: iso === todayIso,
            isWeekend: date.getDay() === 0 || date.getDay() === 6
        });
    }

    return cells;
}

/** dd/MM/yyyy để hiển thị trên hộp chọn. */
export function formatDisplayDate(iso: string | null): string {
    if (!iso) return '';

    const [year, month, day] = iso.split('-');
    return `${day}/${month}/${year}`;
}

/** Ngày ISO nằm trong khoảng [from, to] (so sánh chuỗi YYYY-MM-DD là so sánh đúng thứ tự thời gian). */
export function isWithinRange(iso: string, from: string | null, to: string | null): boolean {
    if (from && iso < from) return false;
    if (to && iso > to) return false;
    return true;
}

/** Kích thước/khung cần cho việc đặt bảng lịch. */
export interface PopupRect {
    top: number;
    bottom: number;
    left: number;
}

export interface PopupSize {
    width: number;
    height: number;
}

/** Vị trí bảng lịch sau khi tính (toạ độ màn hình, dùng với position: fixed). */
export interface PopupPosition {
    top: number;
    left: number;
    /** true = phải mở LÊN TRÊN ô chọn vì bên dưới không đủ chỗ. */
    flippedUp: boolean;
}

/** Khoảng cách giữa ô chọn và bảng lịch (px) — khớp với CSS. */
export const POPUP_GAP = 6;

/** Lề tối thiểu so với mép màn hình (px). */
export const POPUP_MARGIN = 8;

/**
 * Tính vị trí bảng lịch kiểu "popup nổi": ưu tiên mở xuống dưới, không đủ chỗ thì mở lên trên, và luôn
 * kẹp ngang trong màn hình — tránh bị cắt mất nội dung khi ô chọn nằm sát mép phải hoặc đáy màn hình.
 */
export function computePopupPosition(trigger: PopupRect, panel: PopupSize, viewport: PopupSize): PopupPosition {
    const spaceBelow = viewport.height - trigger.bottom - POPUP_GAP - POPUP_MARGIN;
    const spaceAbove = trigger.top - POPUP_GAP - POPUP_MARGIN;
    const flippedUp = spaceBelow < panel.height && spaceAbove > spaceBelow;

    const top = flippedUp
        ? Math.max(POPUP_MARGIN, trigger.top - POPUP_GAP - panel.height)
        : trigger.bottom + POPUP_GAP;

    const maxLeft = Math.max(POPUP_MARGIN, viewport.width - panel.width - POPUP_MARGIN);
    const left = Math.min(Math.max(trigger.left, POPUP_MARGIN), maxLeft);

    return { top, left, flippedUp };
}
