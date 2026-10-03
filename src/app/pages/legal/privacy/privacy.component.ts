import { Component, OnInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SystemSettingService } from '@core/services/system-setting.service';
import { linkifyHtml } from '@core/utils/linkify';

/**
 * Trang Chính sách bảo mật. Nội dung lấy từ Cài đặt chung (quản trị viên soạn); chưa cấu hình thì
 * hiển thị nội dung mặc định có sẵn trong trang.
 */
@Component({
    selector: 'app-privacy',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './privacy.component.html',
    styleUrls: ['./privacy.component.css']
})
export class PrivacyComponent implements OnInit {
    /** Nội dung đã soạn ở Cài đặt chung, rỗng khi quản trị viên chưa nhập. */
    content: string | null = null;

    constructor(private readonly _settingService: SystemSettingService) {
        // Nạp lại sau khi trang chạy để nội dung mới nhất được hiển thị.
        afterNextRender(() => this.load());
    }

    ngOnInit(): void {
        this.load();
    }

    private load(): void {
        this._settingService.getPublic().subscribe({
            next: response => {
                this.content = linkifyHtml(response.data?.privacyPolicy) || null;
            },
            error: () => { }
        });
    }
}
