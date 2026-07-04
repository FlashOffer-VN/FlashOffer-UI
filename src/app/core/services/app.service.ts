import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppService {
    constructor(
        public auth: AuthService,
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
}