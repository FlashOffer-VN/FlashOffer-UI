// core/services/app.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { ToastType } from './toast.service';  // ✅ Import từ toast.service
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor(
        public auth: AuthService,
        public toast: ToastService,  // ✅ Export toast
        private translate: TranslateService
    ) { }

    changeLanguage(lang: string): void {
        localStorage.setItem('language', lang);
        this.translate.use(lang);
    }

    getCurrentLang(): string {
        return this.translate.currentLang || 'vi';
    }

    instant(key: string): string {
        return this.translate.instant(key);
    }

    get(key: string): Observable<string> {
        return this.translate.get(key);
    }

    onLanguageChange(): Observable<any> {
        return this.translate.onLangChange;
    }

    // ✅ Các method toast
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