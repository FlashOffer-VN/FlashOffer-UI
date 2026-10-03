import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { isAdminRole } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class GuestGuard implements CanActivate {
    constructor(
        private _appService: AppService,
        private router: Router
    ) { }

    canActivate(): boolean {
        // Đã login -> redirect về home
        if (this._appService.auth.isAuthenticated()) {
            const user = this._appService.auth.getCurrentUser();
            if (isAdminRole(user?.role)) {
                this.router.navigate(['/admin/dashboard']);
            } else {
                this.router.navigate(['/home']);
            }
            return false;
        }

        // Chưa login -> cho vào
        return true;
    }
}