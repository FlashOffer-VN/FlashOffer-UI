import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AppService } from '../services/app.service';
import { Permission } from '../models/permission.model';

/**
 * Chặn route theo quyền khai báo ở `data.permission` — gõ thẳng URL cũng không vào được:
 * `{ path: 'permissions', data: { permission: Permission.ViewPermissions }, ... }`
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
    constructor(
        private _permissionService: PermissionService,
        private _appService: AppService,
        private _router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (!this._appService.auth.isAuthenticated()) {
            this._router.navigate(['/admin-login']);
            return false;
        }

        const required = route.data?.['permission'] as Permission | Permission[] | undefined;
        if (!required || this._permissionService.has(required)) {
            return true;
        }

        // Khu vực thành viên bị chặn thì về trang cá nhân, không đẩy sang khu vực quản trị.
        this._router.navigate([this._router.url.startsWith('/user') ? '/user/profile' : '/admin/dashboard']);
        return false;
    }
}
