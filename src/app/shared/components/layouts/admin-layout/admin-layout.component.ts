// shared/components/layouts/admin-layout/admin-layout.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { AppService } from '../../../../core/services/app.service';
import { isBrowser } from '../../../../core/utils/platform';
import { AdminHeaderComponent } from './admin-header/admin-header.component';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        AdminSidebarComponent,
        AdminHeaderComponent,
        AdminFooterComponent
    ],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css', './admin-layout.component.mobile.css']
})
export class AdminLayoutComponent implements OnInit {
    isSidebarOpen = true;

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        // Màn hình nhỏ: mặc định thu gọn sidebar để nội dung không bị chèn ép.
        if (isBrowser() && window.matchMedia('(max-width: 1023px)').matches) {
            this.isSidebarOpen = false;
        }
    }

    /** Đóng ngăn kéo bằng phím Esc — chỉ ở chế độ ngăn kéo (≤1023px). */
    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.isSidebarOpen && isBrowser() && window.matchMedia('(max-width: 1023px)').matches) {
            this.toggleSidebar();
        }
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }
}