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
import { ModalService } from './modal.service';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor(
        public auth: AuthService,
        public toast: ToastService,
        public modal: ModalService,
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
    showSuccess(message: string, title?: string, duration?: number): void {
        this.toast.success(message, title, duration);
    }

    showError(message: string, title?: string, duration?: number): void {
        this.toast.error(message, title, duration);
    }

    showWarning(message: string, title?: string, duration?: number): void {
        this.toast.warning(message, title, duration);
    }

    showInfo(message: string, title?: string, duration?: number): void {
        this.toast.info(message, title, duration);
    }

    showToast(options: { message: string; type?: ToastType; title?: string; duration?: number }): void {
        this.toast.show(options);
    }

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

    // ========== Modal ==========
    /**
  * Xác nhận xóa
  * @param message - Nội dung xác nhận (tùy chọn)
  * @param confirmText - Text nút xác nhận (tùy chọn)
  * @param cancelText - Text nút hủy (tùy chọn)
  * @returns Promise<boolean> - true nếu xác nhận, false nếu hủy
  */
    confirmDelete(message?: string, confirmText?: string, cancelText?: string): Promise<boolean> {
        return this.modal.confirm({
            title: this.trans('COMMON.CONFIRM_DELETE'),
            message: message || this.trans('COMMON.CONFIRM_DELETE_MESSAGE'),
            confirmText: confirmText || this.trans('COMMON.BUTTON.DELETE'),
            cancelText: cancelText || this.trans('COMMON.BUTTON.CANCEL'),
            confirmVariant: 'danger'
        });
    }

    /**
     * Xác nhận chung
     * @param options - Cấu hình confirm
     * @returns Promise<boolean>
     */
    confirm(options: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
    }): Promise<boolean> {
        return this.modal.confirm({
            title: options.title,
            message: options.message,
            confirmText: options.confirmText || this.trans('COMMON.BUTTON.CONFIRM'),
            cancelText: options.cancelText || this.trans('COMMON.BUTTON.CANCEL'),
            confirmVariant: options.confirmVariant || 'primary'
        });
    }

    /**
     * Thông báo
     * @param options - Cấu hình alert
     * @returns Promise<void>
     */
    alert(options: {
        title: string;
        message: string;
        confirmText?: string;
        confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
    }): Promise<void> {
        return this.modal.alert({
            title: options.title,
            message: options.message,
            confirmText: options.confirmText || this.trans('COMMON.BUTTON.OK'),
            confirmVariant: options.confirmVariant || 'primary'
        });
    }
}