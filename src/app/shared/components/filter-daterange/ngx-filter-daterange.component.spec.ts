import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { NgxFilterDaterangeComponent } from './ngx-filter-daterange.component';
import { DateRangeValue, buildPresetRange, toIsoDate } from './date-range.util';

/**
 * Chốt hành vi của bộ chọn khoảng ngày dùng chung: khoảng nhanh, chọn 2 ngày trên lịch,
 * bỏ lọc và chữ hiển thị trên hộp.
 */
describe('NgxFilterDaterangeComponent', () => {
    // Ngày cố định để mọi phép tính khoảng nhanh có kết quả xác định (06/10/2026).
    const today = new Date(2026, 9, 6);

    beforeEach(async () => {
        jasmine.clock().install();
        jasmine.clock().mockDate(today);

        await TestBed.configureTestingModule({
            imports: [NgxFilterDaterangeComponent, TranslateModule.forRoot()]
        }).compileComponents();
    });

    afterEach(() => jasmine.clock().uninstall());

    function createComponent(): NgxFilterDaterangeComponent {
        const fixture = TestBed.createComponent(NgxFilterDaterangeComponent);
        fixture.detectChanges();
        return fixture.componentInstance;
    }

    function captureRanges(component: NgxFilterDaterangeComponent): DateRangeValue[] {
        const emitted: DateRangeValue[] = [];
        component.rangeChange.subscribe(range => emitted.push(range));
        return emitted;
    }

    function cellOf(component: NgxFilterDaterangeComponent, iso: string) {
        const cell = component.cells.find(item => item.iso === iso);
        if (!cell) throw new Error(`Không có ô lịch cho ngày ${iso}`);
        return cell;
    }

    it('hiện nhãn gợi ý khi chưa lọc ngày nào', () => {
        const component = createComponent();

        expect(component.hasValue).toBeFalse();
        expect(component.displayText).toBe('COMMON.DATE_RANGE.PLACEHOLDER');
    });

    it('chọn khoảng nhanh "tháng này" thì phát ra đúng khoảng và đóng lịch', () => {
        const component = createComponent();
        const emitted = captureRanges(component);
        component.open();

        const thisMonth = component.presets.find(preset => preset.key === 'thisMonth')!;
        component.applyPreset(thisMonth);

        expect(emitted).toEqual([{ from: '2026-10-01', to: '2026-10-06' }]);
        expect(component.isOpen).toBeFalse();
    });

    it('chọn ngày kết thúc trước ngày bắt đầu thì tự đảo lại cho đúng thứ tự', () => {
        const component = createComponent();
        const emitted = captureRanges(component);
        component.open();

        component.pick(cellOf(component, '2026-10-06'));
        expect(emitted).toEqual([]);

        component.pick(cellOf(component, '2026-10-02'));

        expect(emitted).toEqual([{ from: '2026-10-02', to: '2026-10-06' }]);
        expect(component.isOpen).toBeFalse();
    });

    it('chọn cùng một ngày hai lần thì lọc đúng ngày đó', () => {
        const component = createComponent();
        const emitted = captureRanges(component);
        component.open();

        component.pick(cellOf(component, '2026-10-03'));
        component.pick(cellOf(component, '2026-10-03'));

        expect(emitted).toEqual([{ from: '2026-10-03', to: '2026-10-03' }]);
    });

    it('khoảng đang lọc khớp khoảng nhanh thì hiện tên khoảng nhanh', () => {
        const component = createComponent();
        component.from = '2026-09-01';
        component.to = '2026-09-30';

        expect(component.activePresetKey()).toBe('lastMonth');
        expect(component.displayText).toBe('COMMON.DATE_RANGE.LAST_MONTH');
    });

    it('khoảng tự chọn thì hiện 2 ngày dạng dd/MM/yyyy', () => {
        const component = createComponent();
        component.from = '2026-01-02';
        component.to = '2026-03-15';

        expect(component.activePresetKey()).toBeNull();
        expect(component.displayText).toBe('02/01/2026 → 15/03/2026');
    });

    it('bỏ lọc thì phát ra khoảng rỗng', () => {
        const component = createComponent();
        const emitted = captureRanges(component);
        component.from = '2026-10-01';
        component.to = '2026-10-06';

        component.clear();

        expect(emitted).toEqual([{ from: null, to: null }]);
        expect(component.hasValue).toBeFalse();
    });

    it('mở lịch thì đứng ở tháng của ngày kết thúc đang lọc', () => {
        const component = createComponent();
        component.from = '2026-08-01';
        component.to = '2026-09-15';

        component.open();

        expect(component.viewMonth.getMonth()).toBe(8);
        expect(component.viewMonth.getFullYear()).toBe(2026);
    });

    it('đánh dấu đúng các ô giữa khoảng đang lọc', () => {
        const component = createComponent();
        component.from = '2026-10-01';
        component.to = '2026-10-06';
        component.open();

        expect(component.isRangeStart(cellOf(component, '2026-10-01'))).toBeTrue();
        expect(component.isRangeEnd(cellOf(component, '2026-10-06'))).toBeTrue();
        expect(component.isInRange(cellOf(component, '2026-10-03'))).toBeTrue();
        expect(component.isInRange(cellOf(component, '2026-10-07'))).toBeFalse();
        expect(component.isSelectedDay(cellOf(component, '2026-10-04'))).toBeTrue();
    });

    it('render bảng lịch gồm 5 khoảng nhanh và đủ ô của tháng đang xem', () => {
        const fixture = TestBed.createComponent(NgxFilterDaterangeComponent);
        fixture.componentInstance.open();
        fixture.detectChanges();

        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelectorAll('.dr__preset').length).toBe(5);
        // 42 ô của lưới 6 tuần, trong đó 31 ngày thuộc tháng 10/2026.
        expect(element.querySelectorAll('.dr__day').length).toBe(42);
        expect(element.querySelectorAll('.dr__day:not(.is-out)').length).toBe(31);
    });

    it('ngày đầu của khoảng nhanh "15 ngày qua" cách hôm nay 14 ngày', () => {
        expect(buildPresetRange('last15Days', today).from).toBe(toIsoDate(new Date(2026, 8, 22)));
    });

    it('bấm 2 ngày trên lịch mới phát ra khoảng, lịch vẫn mở sau cú bấm đầu', () => {
        const fixture = TestBed.createComponent(NgxFilterDaterangeComponent);
        fixture.detectChanges();
        const component = fixture.componentInstance;
        const emitted = captureRanges(component);

        // Mở lịch bằng đúng cú bấm người dùng thao tác (không gọi thẳng open()).
        (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.dr__box')!.click();
        fixture.detectChanges();
        expect(component.isOpen).toBeTrue();

        const dayButton = (iso: string) => {
            const cells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.dr__day'));
            const index = component.cells.findIndex(cell => cell.iso === iso);
            if (index < 0) throw new Error(`Không có ô lịch cho ngày ${iso}`);
            return cells[index];
        };

        // Cú bấm đầu = ngày bắt đầu: chưa phát ra khoảng, lịch phải còn mở và ô được tô để thấy đã chọn.
        dayButton('2026-10-05').click();
        fixture.detectChanges();

        expect(emitted).toEqual([]);
        expect(component.isOpen).toBeTrue();
        // Truy vấn lại nút sau khi render (không giữ tham chiếu cũ) rồi mới soi class.
        expect(dayButton('2026-10-05').classList.contains('is-start')).toBeTrue();

        // Cú bấm thứ hai = ngày kết thúc: phát ra khoảng rồi đóng lịch.
        dayButton('2026-10-12').click();
        fixture.detectChanges();

        expect(emitted).toEqual([{ from: '2026-10-05', to: '2026-10-12' }]);
        expect(component.isOpen).toBeFalse();
    });

    it('mở lại lịch sau khi đã lọc: cú bấm đầu là ngày BẮT ĐẦU mới và khoảng cũ bị bỏ', () => {
        const fixture = TestBed.createComponent(NgxFilterDaterangeComponent);
        const component = fixture.componentInstance;
        component.from = '2026-10-01';
        component.to = '2026-10-06';
        fixture.detectChanges();

        const emitted = captureRanges(component);
        component.open();
        fixture.detectChanges();

        // Chưa bấm gì thì vẫn thấy khoảng đang lọc.
        expect(component.isRangeStart(cellOf(component, '2026-10-01'))).toBeTrue();
        expect(component.isRangeEnd(cellOf(component, '2026-10-06'))).toBeTrue();

        // Bấm một ngày khác: phải là BẮT ĐẦU của lựa chọn mới (không phát khoảng 01→20 theo đầu cũ).
        component.pick(cellOf(component, '2026-10-20'));
        fixture.detectChanges();

        expect(emitted).toEqual([]);
        expect(component.selectionHintKey).toBe('COMMON.DATE_RANGE.HINT_END');
        expect(component.isRangeStart(cellOf(component, '2026-10-20'))).toBeTrue();
        expect(component.isRangeEnd(cellOf(component, '2026-10-06'))).toBeFalse();

        // Bấm ngày thứ hai: phát ra khoảng MỚI.
        component.pick(cellOf(component, '2026-10-25'));

        expect(emitted).toEqual([{ from: '2026-10-20', to: '2026-10-25' }]);
    });

    it('nút ngày không bị dựng lại sau mỗi lần render (trackBy theo ngày)', () => {
        const fixture = TestBed.createComponent(NgxFilterDaterangeComponent);
        fixture.componentInstance.open();
        fixture.detectChanges();

        const host = fixture.nativeElement as HTMLElement;
        const before = host.querySelectorAll('.dr__day')[20];

        // Render thêm vài lần: nếu *ngFor mất trackBy thì toàn bộ nút bị thay mới (bấm vào là mất tham chiếu).
        fixture.detectChanges();
        fixture.detectChanges();

        expect(host.querySelectorAll('.dr__day')[20]).toBe(before);
    });

    it('nhãn thứ ngắn gọn để không tràn ô lịch', () => {
        const component = createComponent();

        for (const label of component.weekDayLabels()) {
            // Ô lịch rộng 2.15rem: nhãn dài hơn 3 ký tự ("THỨ 2") là tràn sang ô bên cạnh.
            expect(label.length).toBeLessThanOrEqual(3);
        }
    });
});
