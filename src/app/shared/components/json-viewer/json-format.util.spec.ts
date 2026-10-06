import { countLines, formatJson, prettyJson } from './json-format.util';

/**
 * Chốt cách hiển thị JSON của nhật ký hoạt động: in đẹp, tách token để tô màu, chịu được dữ liệu
 * không phải JSON và không làm lộ HTML trong giá trị.
 */
describe('json-format.util', () => {
    it('in đẹp JSON của một bản ghi và tách đúng loại token', () => {
        const result = formatJson('{"FullName":"Chị Chi","Role":3,"IsActive":true,"Zalo":null}');

        expect(result.isJson).toBeTrue();
        expect(result.lines.length).toBe(6); // { ... 4 dòng dữ liệu ... }
        expect(result.lines[0].tokens[0].text).toBe('{');

        const firstLine = result.lines[1].tokens.map(token => `${token.kind}:${token.text}`);
        expect(firstLine).toEqual(['plain:  ', 'key:"FullName":', 'plain: ', 'string:"Chị Chi"', 'plain:,']);
    });

    it('tô đúng màu cho số, boolean và null', () => {
        const result = formatJson('{"a":3,"b":true,"c":false,"d":null}');
        const tokens = result.lines.flatMap(line => line.tokens);

        expect(tokens.find(token => token.text === '3')!.kind).toBe('number');
        expect(tokens.filter(token => token.kind === 'boolean').map(token => token.text)).toEqual(['true', 'false']);
        expect(tokens.find(token => token.text === 'null')!.kind).toBe('null');
    });

    it('giữ nguyên văn nhưng vẫn tách dòng khi giá trị không phải JSON', () => {
        const result = formatJson('Khôi phục tài khoản đã xoá\n(SĐT: 0987654321)');

        expect(result.isJson).toBeFalse();
        expect(result.lines.length).toBe(2);
        expect(result.lines[0].tokens).toEqual([{ text: 'Khôi phục tài khoản đã xoá', kind: 'plain' }]);
    });

    it('không render HTML trong giá trị (an toàn với innerHTML nếu dùng sau này)', () => {
        const result = formatJson('{"ProductName":"<script>alert(1)</script>"}');
        const value = result.lines[1].tokens.map(token => token.text).join('');

        // Token giữ nguyên ký tự thô; component render bằng interpolation nên < > được escape tự động.
        expect(value).toContain('<script>alert(1)</script>');
        expect(result.lines[1].tokens.some(token => token.kind === 'string')).toBeTrue();
    });

    it('xử lý mảng lồng nhau và chuỗi rỗng', () => {
        const result = formatJson('{"items":[{"code":"A"},{"code":"B"}]}');

        expect(result.isJson).toBeTrue();
        expect(countLines(result)).toBe(10);
        expect(result.lines.some(line => line.tokens.some(token => token.text === '"items":'))).toBeTrue();
    });

    it('giá trị rỗng thì không có dòng nào', () => {
        expect(formatJson(null)).toEqual({ lines: [], isJson: false });
        expect(formatJson('   ')).toEqual({ lines: [], isJson: false });
    });

    it('prettyJson trả về chuỗi in đẹp để sao chép, giữ nguyên văn nếu không phải JSON', () => {
        expect(prettyJson('{"a":1}')).toBe('{\n  "a": 1\n}');
        expect(prettyJson('log thô')).toBe('log thô');
        expect(prettyJson(null)).toBe('');
    });
});
