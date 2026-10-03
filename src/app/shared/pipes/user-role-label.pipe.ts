import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { userRoleLabelKey } from '@core/models/auth.model';

/** Nhãn hiển thị của vai trò tài khoản (1/2/3) theo ngôn ngữ đang dùng. */
@Pipe({
    name: 'userRoleLabel',
    standalone: true,
    pure: false
})
export class UserRoleLabelPipe implements PipeTransform {
    constructor(private _translate: TranslateService) { }

    transform(role: unknown): string {
        return this._translate.instant(userRoleLabelKey(role));
    }
}
