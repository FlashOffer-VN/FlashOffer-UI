import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AppService } from '../services/app.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private _appService: AppService,
        private router: Router
    ) { }

    canActivate(): boolean {
        if (this._appService.auth.isAuthenticated()) {
            return true;
        }

        // Chưa login -> redirect về login
        this.router.navigate(['/login']);
        return false;
    }
}