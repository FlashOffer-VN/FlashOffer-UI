import { Component, HostListener, Inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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
    styleUrls: ['./contact-floating.component.css']
})
export class ContactFloatingComponent {
    phone = DEFAULT_PHONE;
    phoneDisplay = ContactFloatingComponent._formatPhone(DEFAULT_PHONE);
    email = DEFAULT_EMAIL;

    /** Liên kết Zalo: ưu tiên cấu hình, chưa có thì mở Zalo theo hotline. */
    zaloLink: string | null = null;
    /** Liên kết Facebook của nền tảng (nếu đã cấu hình). */
    facebookLink: string | null = null;

    isVisible = false;

    constructor(
        @Inject(PLATFORM_ID) private platformId: any,
        private readonly _settingService: SystemSettingService
    ) {
        // Trang được prerender nên chỉ tải ở trình duyệt: tải lúc build sẽ "đóng băng" thông tin theo bản build.
        afterNextRender(() => this.loadContact());
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
