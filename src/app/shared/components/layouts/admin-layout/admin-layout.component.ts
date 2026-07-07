// shared/components/layouts/admin-layout/admin-layout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';
import { AppService } from '../../../../core/services/app.service';
import { AdminHeaderComponent } from './admin-header/admin-header.component';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        AdminSidebarComponent,
        AdminHeaderComponent,
        AdminFooterComponent
    ],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
    isSidebarOpen = true;
    logoPath = 'logo-full-vn.svg';
    private langSubscription: Subscription | null = null;

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        this.updateLogo();

        this.langSubscription = this._appService.onLanguageChange().subscribe(() => {
            this.updateLogo();
        });
    }

    private updateLogo(): void {
        const lang = this._appService.getCurrentLang();
        this.logoPath = lang === 'en'
            ? 'logo-full-en.svg'
            : 'logo-full-vn.svg';
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    ngOnDestroy(): void {
        if (this.langSubscription) {
            this.langSubscription.unsubscribe();
        }
    }
}