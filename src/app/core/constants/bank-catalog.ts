/**
 * Danh mục ngân hàng Việt Nam (mã BIN theo chuẩn NAPAS 247) dùng để dựng QR chuyển khoản.
 * Dữ liệu lấy từ danh sách công khai của VietQR; chỉ giữ ngân hàng hỗ trợ chuyển khoản.
 */
export interface BankOption {
    /** Mã viết tắt của ngân hàng (VCB, TCB...). */
    code: string;
    /** Tên đầy đủ. */
    name: string;
    /** Tên thường gọi. */
    shortName: string;
    /** Mã BIN dùng trong QR chuyển khoản. */
    bin: string;
}

export const BANK_CATALOG: BankOption[] = [
    { code: 'ABB', name: 'Ngân hàng TMCP An Bình', shortName: 'ABBANK', bin: '970425' },
    { code: 'ACB', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB', bin: '970416' },
    { code: 'VBA', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', shortName: 'Agribank', bin: '970405' },
    { code: 'BAB', name: 'Ngân hàng TMCP Bắc Á', shortName: 'BacABank', bin: '970409' },
    { code: 'BVB', name: 'Ngân hàng TMCP Bảo Việt', shortName: 'BaoVietBank', bin: '970438' },
    { code: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', shortName: 'BIDV', bin: '970418' },
    { code: 'CAKE', name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank', shortName: 'CAKE', bin: '546034' },
    { code: 'CIMB', name: 'Ngân hàng TNHH MTV CIMB Việt Nam', shortName: 'CIMB', bin: '422589' },
    { code: 'COOPBANK', name: 'Ngân hàng Hợp tác xã Việt Nam', shortName: 'COOPBANK', bin: '970446' },
    { code: 'EIB', name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam', shortName: 'Eximbank', bin: '970431' },
    { code: 'HDB', name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', shortName: 'HDBank', bin: '970437' },
    { code: 'KBank', name: 'Ngân hàng Đại chúng TNHH Kasikornbank', shortName: 'KBank', bin: '668888' },
    { code: 'KLB', name: 'Ngân hàng TMCP Kiên Long', shortName: 'KienLongBank', bin: '970452' },
    { code: 'LPB', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', shortName: 'LPBank', bin: '970449' },
    { code: 'MB', name: 'Ngân hàng TMCP Quân đội', shortName: 'MBBank', bin: '970422' },
    { code: 'MBV', name: 'Ngân hàng TNHH MTV Việt Nam Hiện Đại', shortName: 'MBV', bin: '970414' },
    { code: 'momo', name: 'CTCP Dịch Vụ Di Động Trực Tuyến', shortName: 'MoMo', bin: '971025' },
    { code: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam', shortName: 'MSB', bin: '970426' },
    { code: 'NAB', name: 'Ngân hàng TMCP Nam Á', shortName: 'NamABank', bin: '970428' },
    { code: 'NCB', name: 'Ngân hàng TMCP Quốc Dân', shortName: 'NCB', bin: '970419' },
    { code: 'OCB', name: 'Ngân hàng TMCP Phương Đông', shortName: 'OCB', bin: '970448' },
    { code: 'PGB', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển', shortName: 'PGBank', bin: '970430' },
    { code: 'PVCB', name: 'Ngân hàng TMCP Đại Chúng Việt Nam', shortName: 'PVcomBank', bin: '970412' },
    { code: 'PVDB', name: 'Ngân hàng TMCP Đại Chúng Việt Nam Ngân hàng số', shortName: 'PVcomBank Pay', bin: '971133' },
    { code: 'STB', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', shortName: 'Sacombank', bin: '970403' },
    { code: 'SGICB', name: 'Ngân hàng TMCP Sài Gòn Công Thương', shortName: 'SaigonBank', bin: '970400' },
    { code: 'SCB', name: 'Ngân hàng TMCP Sài Gòn', shortName: 'SCB', bin: '970429' },
    { code: 'SEAB', name: 'Ngân hàng TMCP Đông Nam Á', shortName: 'SeABank', bin: '970440' },
    { code: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB', bin: '970443' },
    { code: 'SHBVN', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', shortName: 'ShinhanBank', bin: '970424' },
    { code: 'TCB', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank', bin: '970407' },
    { code: 'TIMO', name: 'Ngân hàng số Timo by Ban Viet Bank (Timo by Ban Viet Bank)', shortName: 'Timo', bin: '963388' },
    { code: 'TPB', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank', bin: '970423' },
    { code: 'Ubank', name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank', shortName: 'Ubank', bin: '546035' },
    { code: 'VIB', name: 'Ngân hàng TMCP Quốc tế Việt Nam', shortName: 'VIB', bin: '970441' },
    { code: 'VAB', name: 'Ngân hàng TMCP Việt Á', shortName: 'VietABank', bin: '970427' },
    { code: 'VIETBANK', name: 'Ngân hàng TMCP Việt Nam Thương Tín', shortName: 'VietBank', bin: '970433' },
    { code: 'VCCB', name: 'Ngân hàng TMCP Bản Việt', shortName: 'VietCapitalBank', bin: '970454' },
    { code: 'VCB', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', shortName: 'Vietcombank', bin: '970436' },
    { code: 'ICB', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank', bin: '970415' },
    { code: 'VPB', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank', bin: '970432' },
    { code: 'WVN', name: 'Ngân hàng TNHH MTV Woori Việt Nam', shortName: 'Woori', bin: '970457' },
];

/** Bỏ dấu và ký tự đặc biệt để so khớp tên ngân hàng. */
function normalize(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** Tuỳ chọn cho ô chọn ngân hàng. */
export function bankSelectOptions(): { label: string; value: string }[] {
    return BANK_CATALOG.map(bank => ({ label: `${bank.shortName} · ${bank.name}`, value: bank.name }));
}

/**
 * Tìm mã BIN từ tên ngân hàng đã lưu (bản ghi cũ có thể là tên đầy đủ kèm tên thường gọi).
 */
export function findBankBin(bankName?: string | null): string | null {
    if (!bankName) return null;

    const key = normalize(bankName);
    if (!key) return null;

    const exact = BANK_CATALOG.find(bank =>
        normalize(bank.name) === key || normalize(bank.shortName) === key || normalize(bank.code) === key);
    if (exact) return exact.bin;

    // Tên cũ có thể là tên đầy đủ kèm tên thường gọi, ví dụ "Ngân hàng TMCP Kỹ Thương (Techcombank)".
    // So khớp theo TỪNG TỪ: mã "MB" không được khớp vào "techco-MB-ank".
    const padded = ` ${key} `;
    const partial = BANK_CATALOG.find(bank =>
        padded.includes(` ${normalize(bank.shortName)} `) || padded.includes(` ${normalize(bank.code)} `));
    if (partial) return partial.bin;

    return BANK_CATALOG.find(bank => normalize(bank.name).includes(key))?.bin ?? null;
}

/** URL ảnh QR chuyển khoản (VietQR) để app ngân hàng quét ra đúng tài khoản, số tiền và nội dung. */
export function buildVietQrUrl(params: {
    bin: string;
    accountNumber: string;
    accountHolder?: string | null;
    amount?: number | null;
    content?: string | null;
}): string {
    const base = `https://img.vietqr.io/image/${encodeURIComponent(params.bin)}-${encodeURIComponent(params.accountNumber)}-compact2.png`;
    const query = new URLSearchParams();
    if (params.amount) query.set('amount', String(Math.round(params.amount)));
    if (params.content) query.set('addInfo', params.content);
    if (params.accountHolder) query.set('accountName', params.accountHolder);

    const queryString = query.toString();
    return queryString ? `${base}?${queryString}` : base;
}

/**
 * QR chuyển khoản của một tài khoản nhận tiền; trả về null khi chưa nhận ra ngân hàng.
 */
export function buildAccountQr(account: {
    bankName?: string | null;
    accountNumber?: string | null;
    accountHolder?: string | null;
}, amount?: number | null, content?: string | null): string | null {
    const bin = findBankBin(account.bankName);
    if (!bin || !account.accountNumber) return null;

    return buildVietQrUrl({
        bin,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        amount,
        content
    });
}
