import { MAX_DELETE_IDS, buildDeleteScope } from './audit-log-delete.util';

/**
 * Chốt điều kiện xoá nhật ký gửi lên API: chọn dòng thì xoá theo dòng, không chọn thì xoá theo khoảng
 * ngày, và chặn sớm các trường hợp API cũng chặn (thiếu điều kiện / khoảng ngày ngược / quá nhiều dòng).
 */
describe('audit-log-delete.util', () => {
    const empty = { ids: [], fromDate: null, toDate: null };

    it('chọn dòng thì xoá theo lựa chọn và bỏ id trùng/rỗng', () => {
        const result = buildDeleteScope({ ...empty, ids: ['a', 'a', '', 'b'] });

        expect(result.ok).toBeTrue();
        if (!result.ok) return;
        expect(result.mode).toBe('selection');
        expect(result.request).toEqual({ ids: ['a', 'b'] });
    });

    it('ưu tiên lựa chọn dòng dù có khoảng ngày đang lọc', () => {
        const result = buildDeleteScope({ ids: ['x'], fromDate: '2026-10-01', toDate: '2026-10-06' });

        expect(result.ok).toBeTrue();
        if (!result.ok) return;
        expect(result.mode).toBe('selection');
        expect(result.request.ids).toEqual(['x']);
        expect(result.request.fromDate).toBeUndefined();
    });

    it('không chọn dòng thì xoá theo khoảng ngày', () => {
        const result = buildDeleteScope({ ...empty, fromDate: '2026-10-01', toDate: '2026-10-06' });

        expect(result.ok).toBeTrue();
        if (!result.ok) return;
        expect(result.mode).toBe('dateRange');
        expect(result.request).toEqual({ fromDate: '2026-10-01', toDate: '2026-10-06' });
    });

    it('chỉ có một mốc ngày vẫn xoá được (từ ngày trở đi / tới ngày)', () => {
        const fromOnly = buildDeleteScope({ ...empty, fromDate: '2026-10-01' });
        const toOnly = buildDeleteScope({ ...empty, toDate: '2026-10-06' });

        expect(fromOnly.ok).toBeTrue();
        expect(toOnly.ok).toBeTrue();
        if (fromOnly.ok) expect(fromOnly.request).toEqual({ fromDate: '2026-10-01' });
        if (toOnly.ok) expect(toOnly.request).toEqual({ toDate: '2026-10-06' });
    });

    it('báo thiếu điều kiện khi không chọn gì', () => {
        expect(buildDeleteScope(empty)).toEqual({ ok: false, reason: 'noCriteria' });
    });

    it('báo khoảng ngày ngược thứ tự', () => {
        expect(buildDeleteScope({ ...empty, fromDate: '2026-10-10', toDate: '2026-10-01' }))
            .toEqual({ ok: false, reason: 'invalidRange' });
    });

    it('báo quá nhiều dòng khi vượt giới hạn của API', () => {
        const ids = Array.from({ length: MAX_DELETE_IDS + 1 }, (_, index) => `id-${index}`);

        expect(buildDeleteScope({ ...empty, ids })).toEqual({ ok: false, reason: 'tooManyIds' });
    });

    it('đúng giới hạn thì vẫn xoá được', () => {
        const ids = Array.from({ length: MAX_DELETE_IDS }, (_, index) => `id-${index}`);
        const result = buildDeleteScope({ ...empty, ids });

        expect(result.ok).toBeTrue();
    });
});
