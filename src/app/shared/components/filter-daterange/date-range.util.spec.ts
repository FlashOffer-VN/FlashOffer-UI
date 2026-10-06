import {
    DATE_RANGE_PRESETS,
    POPUP_GAP,
    POPUP_MARGIN,
    addDays,
    buildMonthGrid,
    buildPresetRange,
    computePopupPosition,
    endOfMonth,
    formatDisplayDate,
    isWithinRange,
    parseIsoDate,
    presetOf,
    startOfMonth,
    toIsoDate
} from './date-range.util';

/**
 * Chốt phần tính toán của bộ chọn khoảng ngày: mọi khoảng nhanh, lưới lịch tháng và chuỗi ngày
 * YYYY-MM-DD (không lệch ngày theo múi giờ).
 */
describe('date-range.util', () => {
    const today = new Date(2026, 9, 6); // 06/10/2026

    describe('toIsoDate / parseIsoDate', () => {
        it('giữ đúng ngày theo giờ địa phương, không lệch sang ngày khác', () => {
            expect(toIsoDate(new Date(2026, 0, 1))).toBe('2026-01-01');
            expect(toIsoDate(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
            expect(toIsoDate(new Date(2026, 9, 6))).toBe('2026-10-06');
        });

        it('đọc lại chuỗi YYYY-MM-DD thành ngày đầu ngày theo giờ địa phương', () => {
            const date = parseIsoDate('2026-10-06')!;

            expect(date.getFullYear()).toBe(2026);
            expect(date.getMonth()).toBe(9);
            expect(date.getDate()).toBe(6);
            expect(date.getHours()).toBe(0);
        });

        it('trả null với chuỗi rỗng hoặc sai định dạng', () => {
            expect(parseIsoDate(null)).toBeNull();
            expect(parseIsoDate('')).toBeNull();
            expect(parseIsoDate('06/10/2026')).toBeNull();
        });
    });

    describe('buildPresetRange', () => {
        it('hôm nay là đúng một ngày', () => {
            expect(buildPresetRange('today', today)).toEqual({ from: '2026-10-06', to: '2026-10-06' });
        });

        it('7 ngày qua tính cả hôm nay', () => {
            expect(buildPresetRange('last7Days', today)).toEqual({ from: '2026-09-30', to: '2026-10-06' });
        });

        it('15 ngày qua tính cả hôm nay', () => {
            expect(buildPresetRange('last15Days', today)).toEqual({ from: '2026-09-22', to: '2026-10-06' });
        });

        it('tháng này từ ngày 1 tới hôm nay', () => {
            expect(buildPresetRange('thisMonth', today)).toEqual({ from: '2026-10-01', to: '2026-10-06' });
        });

        it('tháng trước trọn tháng', () => {
            expect(buildPresetRange('lastMonth', today)).toEqual({ from: '2026-09-01', to: '2026-09-30' });
        });

        it('tháng trước qua mốc năm mới', () => {
            expect(buildPresetRange('lastMonth', new Date(2026, 0, 15)))
                .toEqual({ from: '2025-12-01', to: '2025-12-31' });
        });

        it('tháng trước của tháng 3 năm nhuận kết thúc ngày 29', () => {
            expect(buildPresetRange('lastMonth', new Date(2028, 2, 10)))
                .toEqual({ from: '2028-02-01', to: '2028-02-29' });
        });

        it('tháng này khi hôm nay là ngày 1', () => {
            expect(buildPresetRange('thisMonth', new Date(2026, 10, 1)))
                .toEqual({ from: '2026-11-01', to: '2026-11-01' });
        });
    });

    describe('presetOf', () => {
        it('nhận ra khoảng khớp một khoảng nhanh', () => {
            expect(presetOf({ from: '2026-10-01', to: '2026-10-06' }, today)).toBe('thisMonth');
            expect(presetOf({ from: '2026-10-06', to: '2026-10-06' }, today)).toBe('today');
        });

        it('trả null khi khoảng tự chọn hoặc thiếu một đầu', () => {
            expect(presetOf({ from: '2026-10-02', to: '2026-10-06' }, today)).toBeNull();
            expect(presetOf({ from: '2026-10-06', to: null }, today)).toBeNull();
        });

        it('mọi khoảng nhanh đều tự nhận ra chính nó', () => {
            for (const preset of DATE_RANGE_PRESETS) {
                expect(presetOf(buildPresetRange(preset.key, today), today)).toBe(preset.key);
            }
        });
    });

    describe('buildMonthGrid', () => {
        it('bắt đầu từ thứ Hai của tuần chứa ngày 1 và luôn đủ 42 ô', () => {
            const cells = buildMonthGrid(2026, 9, today); // tháng 10/2026, ngày 1 là thứ Năm

            expect(cells.length).toBe(42);
            expect(cells[0].iso).toBe('2026-09-28'); // thứ Hai tuần trước
            expect(cells[0].date.getDay()).toBe(1);
            expect(cells[41].iso).toBe('2026-11-08');
        });

        it('đánh dấu ngày thuộc tháng đang xem, hôm nay và cuối tuần', () => {
            const cells = buildMonthGrid(2026, 9, today);

            expect(cells.find(cell => cell.iso === '2026-10-01')!.inMonth).toBeTrue();
            expect(cells.find(cell => cell.iso === '2026-09-28')!.inMonth).toBeFalse();
            expect(cells.find(cell => cell.iso === '2026-10-06')!.isToday).toBeTrue();
            expect(cells.find(cell => cell.iso === '2026-10-03')!.isWeekend).toBeTrue(); // thứ Bảy
            expect(cells.find(cell => cell.iso === '2026-10-05')!.isWeekend).toBeFalse();
        });

        it('đủ số ngày của tháng 2 năm nhuận', () => {
            const inMonth = buildMonthGrid(2028, 1, today).filter(cell => cell.inMonth);

            expect(inMonth.length).toBe(29);
            expect(inMonth[28].iso).toBe('2028-02-29');
        });
    });

    describe('formatDisplayDate / isWithinRange', () => {
        it('hiển thị dd/MM/yyyy', () => {
            expect(formatDisplayDate('2026-10-06')).toBe('06/10/2026');
            expect(formatDisplayDate(null)).toBe('');
        });

        it('so sánh ngày nằm trong khoảng, kể cả khi chỉ có một đầu', () => {
            expect(isWithinRange('2026-10-03', '2026-10-01', '2026-10-06')).toBeTrue();
            expect(isWithinRange('2026-10-06', '2026-10-01', '2026-10-06')).toBeTrue();
            expect(isWithinRange('2026-09-30', '2026-10-01', '2026-10-06')).toBeFalse();
            expect(isWithinRange('2026-10-07', '2026-10-01', '2026-10-06')).toBeFalse();
            expect(isWithinRange('2026-10-07', '2026-10-01', null)).toBeTrue();
        });
    });

    describe('biên tháng / cộng ngày', () => {
        it('startOfMonth và endOfMonth trả đúng ngày đầu và ngày cuối', () => {
            expect(toIsoDate(startOfMonth(today))).toBe('2026-10-01');
            expect(toIsoDate(endOfMonth(today))).toBe('2026-10-31');
        });

        it('cộng ngày qua mốc tháng vẫn đúng', () => {
            expect(toIsoDate(addDays(new Date(2026, 9, 31), 1))).toBe('2026-11-01');
            expect(toIsoDate(addDays(new Date(2026, 10, 1), -1))).toBe('2026-10-31');
        });
    });

    describe('computePopupPosition (đặt bảng lịch kiểu popup nổi)', () => {
        const panel = { width: 470, height: 320 };
        const viewport = { width: 1280, height: 800 };

        it('mặc định mở xuống dưới ô chọn', () => {
            const position = computePopupPosition({ top: 100, bottom: 140, left: 300 }, panel, viewport);

            expect(position.top).toBe(140 + POPUP_GAP);
            expect(position.left).toBe(300);
            expect(position.flippedUp).toBeFalse();
        });

        it('hết chỗ bên dưới thì mở lên trên', () => {
            const position = computePopupPosition({ top: 700, bottom: 740, left: 300 }, panel, viewport);

            expect(position.flippedUp).toBeTrue();
            expect(position.top).toBe(700 - POPUP_GAP - panel.height);
        });

        it('vẫn mở xuống dưới khi bên trên còn ít chỗ hơn', () => {
            const position = computePopupPosition({ top: 30, bottom: 70, left: 300 }, panel, viewport);

            expect(position.flippedUp).toBeFalse();
            expect(position.top).toBe(70 + POPUP_GAP);
        });

        it('sát mép phải thì kẹp lại, không tràn khỏi màn hình', () => {
            const position = computePopupPosition({ top: 100, bottom: 140, left: 1200 }, panel, viewport);

            expect(position.left).toBe(viewport.width - panel.width - POPUP_MARGIN);
        });

        it('sát mép trái thì giữ lề tối thiểu', () => {
            const position = computePopupPosition({ top: 100, bottom: 140, left: -20 }, panel, viewport);

            expect(position.left).toBe(POPUP_MARGIN);
        });

        it('bảng rộng hơn màn hình thì vẫn giữ lề trái', () => {
            const narrow = computePopupPosition({ top: 100, bottom: 140, left: 40 }, panel, { width: 400, height: 800 });

            expect(narrow.left).toBe(POPUP_MARGIN);
        });
    });
});
