import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { UserRole } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private _appService: AppService,
        private router: Router
    ) { }

    canActivate(): boolean {
        // Kiểm tra đã login chưa
        if (!this._appService.auth.isAuthenticated()) {
            this.router.navigate(['/admin-login']);
            return false;
        }

        // Kiểm tra role admin
        const user = this._appService.auth.getCurrentUser();
        if (user?.role?.toLowerCase() === UserRole.ADMIN.toLowerCase()) {
            return true;
        }

        // Không phải admin -> về home
        this.router.navigate(['/home']);
        return false;
    }
}