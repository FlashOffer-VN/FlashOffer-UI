import { Component, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { SystemSettingService } from '@core/services/system-setting.service';
import { PublicSystemSetting } from '@core/models/system-setting.model';

/** Một kênh liên hệ khác của nền tảng (Zalo, Facebook…). */
interface SupportChannel {
    label: string;
    url: string;
    icon: string;
}

/** Thông tin liên hệ dùng khi quản trị viên chưa cấu hình ở Cài đặt chung. */
const DEFAULT_PHONE = '0363656223';
const DEFAULT_EMAIL = 'info@kindi.vn';

/**
 * Trang Trung tâm hỗ trợ: tổng hợp hotline, email, địa chỉ, giờ làm việc và các kênh liên hệ
 * lấy từ Cài đặt chung, kèm lối gửi yêu cầu cho đội ngũ Kindi.
 */
@Component({
    selector: 'app-support',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './support.component.html',
    styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
    /** Cấu hình công khai; API lỗi thì trang dùng thông tin mặc định. */
    setting: PublicSystemSetting | null = null;

    phone = DEFAULT_PHONE;
    email = DEFAULT_EMAIL;

    /** Chỉ những kênh đã nhập liên kết mới hiển thị. */
    channels: SupportChannel[] = [];

    constructor(private readonly _settingService: SystemSettingService) {
        // Nạp lại sau khi trang chạy để thông tin mới nhất được hiển thị.
        afterNextRender(() => this.load());
    }

    ngOnInit(): void {
        this.load();
    }

    private load(): void {
        this._settingService.getPublic().subscribe({
            next: response => {
                this.setting = response.data ?? null;
                this.phone = this.setting?.supportPhone?.trim() || DEFAULT_PHONE;
                this.email = this.setting?.supportEmail?.trim() || DEFAULT_EMAIL;
                this.channels = [
                    { label: 'Zalo', url: this.setting?.zaloUrl ?? '', icon: 'fa-solid fa-comment-dots' },
                    { label: 'Facebook', url: this.setting?.facebookUrl ?? '', icon: 'fa-brands fa-facebook' },
                    { label: 'YouTube', url: this.setting?.youtubeUrl ?? '', icon: 'fa-brands fa-youtube' },
                    { label: 'TikTok', url: this.setting?.tiktokUrl ?? '', icon: 'fa-brands fa-tiktok' },
                    { label: 'Instagram', url: this.setting?.instagramUrl ?? '', icon: 'fa-brands fa-instagram' },
                    { label: 'LinkedIn', url: this.setting?.linkedinUrl ?? '', icon: 'fa-brands fa-linkedin' }
                ].filter(item => !!item.url);
            },
            error: () => {
                this.setting = null;
                this.channels = [];
            }
        });
    }
}
