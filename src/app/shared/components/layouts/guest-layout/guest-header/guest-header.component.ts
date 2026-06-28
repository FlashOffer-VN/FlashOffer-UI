import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../language-switcher/language-switcher.component';
import { AppService } from '../../../../../core/services/app.service';

@Component({
    selector: 'app-guest-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
    templateUrl: './guest-header.component.html',
    styleUrls: ['./guest-header.component.css']
})
export class GuestHeaderComponent {
    showAdminButton = false;
    private keySequence: string[] = [];
    private readonly SECRET_CODE = ['a', 'd', 'm', 'i', 'n'];

    constructor(private _appService: AppService, private _router: Router) {
        this.checkAuth();
        this.initSecretListener();
    }

    initSecretListener() {
        document.addEventListener('keydown', (event) => {
            this.keySequence.push(event?.key?.trim().toLowerCase());

            // Giữ tối đa 5 ký tự
            if (this.keySequence.length > 5) {
                this.keySequence.shift();
            }

            // Kiểm tra secret code "admin"
            const typed = this.keySequence.join('');
            if (typed.includes('admin')) {
                this.showAdminButton = true;
                this.keySequence = [];
                // Tự động ẩn sau 5 giây
                setTimeout(() => {
                    this.showAdminButton = false;
                }, 5000);
            }
        });
    }

    checkAuth() {
        // this._appService.auth.currentUser$.subscribe(user => {
        //     this._isLoggedIn = !!user;
        //     this._isAdmin = user?.role === UserRole.ADMIN;
        //     this._userName = user?.username || '';
        // });
    }
}