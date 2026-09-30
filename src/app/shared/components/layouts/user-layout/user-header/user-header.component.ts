// shared/components/layouts/user-layout/user-header/user-header.component.ts
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppService } from '../../../../../core/services/app.service';
import { LanguageSwitcherComponent } from '../../../language-switcher/language-switcher.component';

@Component({
    selector: 'app-user-header',
    standalone: true,
    imports: [CommonModule, RouterLink, LanguageSwitcherComponent ],
    templateUrl: './user-header.component.html',
    styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent {
    @Input() logoPath = 'logo-full-vn.svg';
    @Output() toggleSidebar = new EventEmitter<void>();

    constructor(private _appService: AppService) { }

    get userInitial(): string {
        const user = this._appService.auth.getCurrentUser();
        return user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U';
    }

    get userName(): string {
        const user = this._appService.auth.getCurrentUser();
        return user?.fullName || user?.username || '';
    }

    onToggleSidebar(): void {
        this.toggleSidebar.emit();
    }
}
