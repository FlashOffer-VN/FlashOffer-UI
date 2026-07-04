import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';
import { AppService } from './core/services/app.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, ScrollToTopComponent, TranslateModule],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent {
    constructor(private app: AppService) {
        // Translate đã được init trong app.config, AppService chỉ dùng để gọi
        console.log('Current lang:', this.app.getCurrentLang());
    }

    // ngOnInit() {
    //     // ✅ Xử lý BFCache - Reload lại khi quay lại trang
    //     this.router.events.pipe(
    //         filter(event => event instanceof NavigationStart)
    //     ).subscribe((event: NavigationStart) => {
    //         // Kiểm tra nếu là back/forward
    //         if (event.navigationTrigger === 'popstate') {
    //             // Reload nhẹ để refresh state
    //             // window.location.reload(); // Có thể gây loop, không khuyến khích
    //         }
    //     });
    // }
}