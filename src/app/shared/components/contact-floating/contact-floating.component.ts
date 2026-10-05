import { Component, HostBinding, HostListener, Inject, OnInit, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { Router } from '@angular/router';
import { SystemSettingService } from '@core/services/system-setting.service';
import { PublicSystemSetting } from '@core/models/system-setting.model';

/** Thông tin liên hệ dùng khi quản trị viên chưa cấu hình trong Cài đặt chung. */
const DEFAULT_PHONE = '0363656223';
const DEFAULT_EMAIL = 'info@kindi.vn';

/**
 * Cụm nút liên hệ ở góc phải màn hình: gọi điện, Zalo, email, Facebook và cuộn lên đầu trang.
 * Thông tin lấy từ Cài đặt chung (hotline, email hỗ trợ, liên kết Zalo/Facebook).
 */
@Component({
    selector: 'app-contact-floating',
    standalone: true,
    imports: [TranslateModule],
    templateUrl: './contact-floating.component.html',
    styleUrls: ['./contact-floating.component.css', './contact-floating.component.mobile.css']
})
export class ContactFloatingComponent implements OnInit {
    phone = DEFAULT_PHONE;
    phoneDisplay = ContactFloatingComponent._formatPhone(DEFAULT_PHONE);
    email = DEFAULT_EMAIL;

    /** Liên kết Zalo: ưu tiên cấu hình, chưa có thì mở Zalo theo hotline. */
    zaloLink: string | null = null;
    /** Liên kết Facebook của nền tảng (nếu đã cấu hình). */
    facebookLink: string | null = null;

    isVisible = false;

    /**
     * Cụm nút liên hệ dành cho khách và người dùng cuối. Trong khu vực quản trị thì ẩn:
     * ở đó nó nằm đè lên cột thao tác của bảng và các thẻ nội dung (bấm vào bảng bị vướng).
     */
    @HostBinding('style.display')
    get display(): string | null {
        return this._router.url.startsWith('/admin') ? 'none' : null;
    }

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private readonly _settingService: SystemSettingService,
        private readonly _router: Router
    ) {
        // Sau khi trang chạy ở trình duyệt thì nạp lại, tránh giữ giá trị của bản dựng sẵn.
        afterNextRender(() => this.loadContact());
    }

    /** Nạp thông tin liên hệ ngay từ đầu để bản dựng sẵn cũng có nút, không lệch khi thuỷ hợp hoá. */
    ngOnInit(): void {
        this.loadContact();
    }

    /** Nạp thông tin liên hệ từ cài đặt chung (hotline, email, Zalo, Facebook). */
    private loadContact(): void {
        this._settingService.getPublic().subscribe({
            next: response => this.applySettings(response.data ?? null),
            // Lỗi mạng thì giữ nguyên thông tin mặc định, không làm hỏng trang.
            error: () => { }
        });
    }

    @HostListener('window:scroll')
    onScroll() {
        if (isPlatformBrowser(this.platformId)) {
            const scrollY = window.scrollY || window.pageYOffset || 0;
            this.isVisible = scrollY > 300;
        }
    }

    scrollToTop() {
        if (isPlatformBrowser(this.platformId)) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }

    /** Áp thông tin liên hệ từ Cài đặt chung; trường nào chưa cấu hình thì giữ giá trị mặc định. */
    private applySettings(setting: PublicSystemSetting | null): void {
        const phone = setting?.supportPhone?.trim();
        if (phone) {
            this.phone = phone;
            this.phoneDisplay = ContactFloatingComponent._formatPhone(phone);
        }

        const email = setting?.supportEmail?.trim();
        if (email) this.email = email;

        const zalo = setting?.zaloUrl?.trim();
        this.zaloLink = zalo || (phone ? `https://zalo.me/${phone.replace(/[^0-9]/g, '')}` : null);
        this.facebookLink = setting?.facebookUrl?.trim() || null;
    }

    private static _formatPhone(value: string): string {
        const digits = value.replace(/[^0-9]/g, '');
        return digits.length === 10 ? `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}` : value;
    }
}
