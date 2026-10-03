// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationError, RouterOutlet } from '@angular/router';
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
import { isStaleVersionError, reloadForNewVersion } from './core/utils/version-reload';
import {
    captureReferralCode,
    isReferralCodeSynced,
    markReferralCodeSynced,
    resolveReferralCode
} from './core/utils/share-link';

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
        // Ghi nhận mã chia sẻ (?ref=) của mọi trang khách mở vào máy + tài khoản đang đăng nhập
        this.captureReferral();

        // Bản mới phát lên trong lúc trang đang mở thì mô-đun của bản cũ không còn tải được,
        // tải lại trang để người dùng không nhìn thấy màn hình trắng.
        this.router.events.pipe(
            filter(event => event instanceof NavigationError)
        ).subscribe(event => {
            this.recoverFromStaleVersion((event as NavigationError).error);
        });

        if (isBrowser()) {
            // Trường hợp không đi qua bộ định tuyến (một thành phần được nạp muộn trong trang).
            window.addEventListener('unhandledrejection', event => {
                this.recoverFromStaleVersion(event.reason);
            });
        }

        // ✅ Cuộn lên đầu khi chuyển trang + Cập nhật SEO
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.captureReferral();
            // Cuộn lên đầu trang (browser-only — `window` doesn't exist during prerender)
            if (isBrowser()) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            // 👇 Cập nhật SEO cho trang hiện tại
            this.updateSEO();
        });
    }

    /** Tải lại trang khi lỗi đến từ tệp mô-đun của bản cũ (không phải lỗi nghiệp vụ). */
    private recoverFromStaleVersion(error: unknown): void {
        if (isStaleVersionError(error)) {
            reloadForNewVersion();
        }
    }

    /**
     * Ghi nhận mã chia sẻ trên link (?ref=) vào máy, và đồng bộ vào tài khoản khi đã đăng nhập.
     * Mã lấy lần đầu được giữ nguyên — mở link của CTV khác sau đó không ghi đè.
     */
    private captureReferral(): void {
        if (!isBrowser()) return;

        const referralCode = captureReferralCode();
        if (!referralCode) return;

        if (!this.app.isAuthenticated() || isReferralCodeSynced(referralCode)) return;

        this.app.referralService.saveMyReferralCode(referralCode).subscribe(() => {
            markReferralCodeSynced(referralCode);
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