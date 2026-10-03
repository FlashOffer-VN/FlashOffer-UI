import { Component, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SystemSettingService } from '@core/services/system-setting.service';
import { PublicSystemSetting } from '@core/models/system-setting.model';

/** Một nền tảng mạng xã hội đã cấu hình trong phần cài đặt chung. */
interface FooterSocial {
    label: string;
    url: string;
    icon: string;
}

@Component({
    selector: 'app-guest-footer',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, ],
    templateUrl: './guest-footer.component.html',
    styleUrls: ['./guest-footer.component.css']
})
/** Footer trang người dùng: thông tin liên hệ và liên kết mạng xã hội lấy từ cài đặt chung. */
export class GuestFooterComponent {
    /** Cấu hình công khai; chưa cấu hình hoặc API lỗi thì footer giữ nguyên như trước. */
    setting: PublicSystemSetting | null = null;

    /** Chỉ những nền tảng đã nhập liên kết mới hiển thị. */
    socials: FooterSocial[] = [];

    constructor(private readonly _settingService: SystemSettingService) {
        // Trang được prerender nên chỉ tải ở trình duyệt: tải lúc build sẽ "đóng băng" thông tin theo bản build.
        afterNextRender(() => this.loadSetting());
    }

    /** Nạp thông tin liên hệ và liên kết mạng xã hội từ cài đặt chung. */
    private loadSetting(): void {
        this._settingService.getPublic().subscribe({
            next: response => {
                this.setting = response.data ?? null;
                this.socials = [
                    { label: 'Facebook', url: this.setting?.facebookUrl ?? '', icon: 'fa-brands fa-facebook' },
                    { label: 'YouTube', url: this.setting?.youtubeUrl ?? '', icon: 'fa-brands fa-youtube' },
                    { label: 'TikTok', url: this.setting?.tiktokUrl ?? '', icon: 'fa-brands fa-tiktok' },
                    { label: 'Zalo', url: this.setting?.zaloUrl ?? '', icon: 'fa-solid fa-comment-dots' },
                    { label: 'Instagram', url: this.setting?.instagramUrl ?? '', icon: 'fa-brands fa-instagram' },
                    { label: 'X', url: this.setting?.xUrl ?? '', icon: 'fa-brands fa-x-twitter' },
                    { label: 'Threads', url: this.setting?.threadsUrl ?? '', icon: 'fa-brands fa-threads' },
                    { label: 'LinkedIn', url: this.setting?.linkedinUrl ?? '', icon: 'fa-brands fa-linkedin' }
                ].filter(item => !!item.url);
            },
            error: () => {
                this.setting = null;
                this.socials = [];
            }
        });
    }
}