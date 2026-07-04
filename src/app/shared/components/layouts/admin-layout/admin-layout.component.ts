import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AppService } from '../../../../core/services/app.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
    isSidebarOpen = true;
    logoPath: string = 'assets/logos/kindi-logo-dark-vi.svg';
    logoAlt: string = 'Kindi Admin';
    private langSubscription: Subscription | null = null;

    constructor(private _appService: AppService) { }

    ngOnInit() {
        this.updateLogo();

        this.langSubscription = this._appService.onLanguageChange().subscribe(() => {
            this.updateLogo();
        });
    }

    private updateLogo() {
        const lang = this._appService.getCurrentLang();
        this.logoPath = lang === 'en' ? 'logo-full-en.svg' : 'logo-full-vn.svg';
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    ngOnDestroy() {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }
}