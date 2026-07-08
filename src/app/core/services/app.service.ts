// core/services/app.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { ToastType } from './toast.service';
import { Observable } from 'rxjs';
import { PartnerRegisterService } from './partner-register.service';
import { CtvRegistrationService } from './ctv-registration.service';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor(
        public auth: AuthService,
        public toast: ToastService,
        public partner: PartnerRegisterService,
        private translate: TranslateService,
        public ctvRegistration: CtvRegistrationService
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

    // ========== Language ==========
    changeLanguage(lang: string): void {
        localStorage.setItem('language', lang);
        this.translate.use(lang);
    }

    getCurrentLang(): string {
        return this.translate.currentLang || 'vi';
    }

    instant(key: string, params?: any): string {
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

    // ========== Toast ==========
    showToast(message: string, type: ToastType = 'info', duration?: number): void {
        this.toast.show(message, type, duration);
    }

    showSuccess(message: string, duration?: number): void {
        this.toast.success(message, duration);
    }

    showError(message: string, duration?: number): void {
        this.toast.error(message, duration);
    }

    showWarning(message: string, duration?: number): void {
        this.toast.warning(message, duration);
    }

    showInfo(message: string, duration?: number): void {
        this.toast.info(message, duration);
    }
}