import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './language-switcher.component.html',
    styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent implements OnInit {
    currentLang: string = 'vi';

    constructor(private translate: TranslateService) { }

    ngOnInit() {
        // The initial language should already be set by appInitializer
        this.currentLang = this.translate.currentLang;

        // Subscribe to language changes from other parts of the app (e.g., appInitializer)
        this.translate.onLangChange.subscribe(event => {
            this.currentLang = event.lang;
        });
    }

    switchLanguage(lang: string) {
        this.currentLang = lang;
        this.translate.use(lang);
        localStorage.setItem('language', lang);
    }
}