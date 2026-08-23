// core/services/app.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { ToastType } from './toast.service';
import { Observable } from 'rxjs';
import { PartnerRegisterService } from './partner-register.service';
import { CtvRegistrationService } from './ctv-registration.service';
import { PurchaseRequestService } from './purchase-request.service';
import { GroupBuyingRequestService } from './group-buying-request.service';
import { OfferRequestService } from './offer-request.service';
import { PartnerService } from './partner.service';
import { CtvService } from './ctv.service';
import { SocialService } from './social.service';
import { UserRole } from '@core/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor(
        public auth: AuthService,
        public toast: ToastService,
        public partnerRegister: PartnerRegisterService,
        private translate: TranslateService,
        public ctvRegistration: CtvRegistrationService,
        public purchaseRequest: PurchaseRequestService,
        public groupBuyingRequest: GroupBuyingRequestService,
        public offerRequest: OfferRequestService,
        public ctvService: CtvService,
        public partnerService: PartnerService,
        public socialService: SocialService,
    ) { }

    // ========== Auth ==========
    login(credentials: any) {
        return this.auth.login(credentials);
    }

    logout() {
        this.auth.logout();
    }

    logoutToAdmin() {
        this.auth.logoutToAdmin();
    }

    getCurrentUser() {
        return this.auth.getCurrentUser();
    }

    isAuthenticated() {
        return this.auth.isAuthenticated();
    }

    extractErrorMessage(error: any): string {
        return this.auth.extractErrorMessage(error);
    }

    isAdmin(): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.role?.toUpperCase() === UserRole.ADMIN.toUpperCase();
    }

    isUser(): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return user.role?.toUpperCase() === UserRole.USER.toUpperCase();
    }

    // ========== Toast ==========
    /**
     * Hiển thị toast success
     * @param message - Nội dung thông báo
     * @param title - Tiêu đề (tùy chọn)
     * @param duration - Thời gian hiển thị (ms)
     */
    showSuccess(message: string, title?: string, duration?: number): void {
        this.toast.success(message, title, duration);
    }

    /**
     * Hiển thị toast error
     * @param message - Nội dung thông báo
     * @param title - Tiêu đề (tùy chọn)
     * @param duration - Thời gian hiển thị (ms)
     */
    showError(message: string, title?: string, duration?: number): void {
        this.toast.error(message, title, duration);
    }

    /**
     * Hiển thị toast warning
     * @param message - Nội dung thông báo
     * @param title - Tiêu đề (tùy chọn)
     * @param duration - Thời gian hiển thị (ms)
     */
    showWarning(message: string, title?: string, duration?: number): void {
        this.toast.warning(message, title, duration);
    }

    /**
     * Hiển thị toast info
     * @param message - Nội dung thông báo
     * @param title - Tiêu đề (tùy chọn)
     * @param duration - Thời gian hiển thị (ms)
     */
    showInfo(message: string, title?: string, duration?: number): void {
        this.toast.info(message, title, duration);
    }

    /**
     * Hiển thị toast với options đầy đủ
     */
    showToast(options: { message: string; type?: ToastType; title?: string; duration?: number }): void {
        this.toast.show(options);
    }

    /**
     * Đóng toast hiện tại
     */
    dismissToast(): void {
        this.toast.dismiss();
    }

    // ========== Language ==========
    changeLanguage(lang: string): void {
        localStorage.setItem('language', lang);
        this.translate.use(lang);
    }

    getCurrentLang(): string {
        return this.translate.currentLang || 'vi';
    }

    trans(key: string, params?: any): string {
        if (params) {
            return this.translate.instant(key, params);
        }
        return this.translate.instant(key);
    }

    get(key: string, params?: any): Observable<string> {
        return this.translate.get(key, params);
    }

    onLanguageChange(): Observable<any> {
        return this.translate.onLangChange;
    }
}