import { Pipe, PipeTransform } from '@angular/core';
import { PermissionService } from '@core/services/permission.service';
import { Permission } from '@core/models/permission.model';

/** `'P020' | hasPermission` hoặc `Permission.ViewUsers | hasPermission` — dùng cho bất kỳ thẻ nào. */
@Pipe({
    name: 'hasPermission',
    standalone: true,
    pure: false
})
export class HasPermissionPipe implements PipeTransform {
    constructor(private _permission: PermissionService) { }

    transform(permission: Permission | string | readonly (Permission | string)[] | null | undefined): boolean {
        return this._permission.has(permission);
    }
}
