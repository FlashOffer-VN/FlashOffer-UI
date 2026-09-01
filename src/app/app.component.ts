// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { routeAnimation } from './shared/animations/animations';
import { AppService } from './core/services/app.service';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ContactFloatingComponent } from "@shared/components/contact-floating/contact-floating.component";
import { SeoService } from './core/services/seo.service';
import { SEO_CONFIG } from './core/configs/seo.config';
import { isBrowser } from './core/utils/platform';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, TranslateModule, ContactFloatingComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css'],
    animations: [routeAnimation]
})
export class AppComponent implements OnInit {
    constructor(
        private app: AppService,
        private router: Router,
        private seoService: SeoService  // 👈 Inject SeoService
    ) {
        console.log('Current lang:', this.app.getCurrentLang());
    }

    ngOnInit() {
        // ✅ Cuộn lên đầu khi chuyển trang + Cập nhật SEO
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            // Cuộn lên đầu trang (browser-only — `window` doesn't exist during prerender)
            if (isBrowser()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // 👇 Cập nhật SEO cho trang hiện tại
            this.updateSEO();
        });
    }

    /**
     * Cập nhật SEO dựa trên route hiện tại
     */
    private updateSEO(): void {
        const currentUrl = this.router.url;
        const seoConfig = SEO_CONFIG[currentUrl];

        if (seoConfig) {
            this.seoService.setSEO(seoConfig);
        } else {
            // Fallback mặc định nếu route chưa có config
            this.seoService.setSEO({
                title: 'Kindi - Nền tảng kết nối doanh nghiệp SME',
                description: 'Kết nối doanh nghiệp SME, mua chung hàng hóa, tìm nhà cung cấp và phát triển kênh bán hàng CTV.',
                image: 'https://kindi.vn/assets/images/og-image.png',
                url: 'https://kindi.vn' + currentUrl
            });
        }
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet?.activatedRouteData?.['animation'] || 'default';
    }
}