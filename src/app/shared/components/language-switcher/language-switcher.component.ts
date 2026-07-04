// shared/components/language-switcher/language-switcher.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppService } from '../../../core/services/app.service';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './language-switcher.component.html',
    styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent implements OnInit {
    currentLang = 'vi';

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        this.currentLang = this._appService.getCurrentLang();
    }

    toggleLanguage(): void {
        const newLang = this.currentLang === 'vi' ? 'en' : 'vi';
        this.currentLang = newLang;
        this._appService.changeLanguage(newLang);
    }
}