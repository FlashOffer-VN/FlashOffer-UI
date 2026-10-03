import {
    Directive,
    Input,
    OnChanges,
    TemplateRef,
    ViewContainerRef,
    EmbeddedViewRef
} from '@angular/core';
import { PermissionService } from '@core/services/permission.service';
import { Permission } from '@core/models/permission.model';

/**
 * Gắn quyền cho bất kỳ thẻ nào:
 * - `*appHasPermission="Permission.ViewUsers"`: thiếu quyền thì không render thẻ.
 * - `*appHasPermission="Permission.ResetUserPassword; mode: 'disable'"`: vẫn render nhưng khoá thẻ.
 *
 * Truyền nhiều mã nghĩa là có MỘT trong các mã đó.
 */
@Directive({
    selector: '[appHasPermission]',
    standalone: true
})
export class HasPermissionDirective implements OnChanges {
    @Input() appHasPermission: Permission | string | readonly (Permission | string)[] | null = null;

    /** remove: bỏ khỏi DOM (mặc định) | disable: khoá thẻ | hide: giữ chỗ nhưng ẩn */
    @Input() appHasPermissionMode: 'remove' | 'disable' | 'hide' = 'remove';

    private _view?: EmbeddedViewRef<unknown>;

    constructor(
        private _templateRef: TemplateRef<unknown>,
        private _viewContainer: ViewContainerRef,
        private _permission: PermissionService
    ) { }

    ngOnChanges(): void {
        const allowed = this._permission.has(this.appHasPermission);

        if (!allowed && this.appHasPermissionMode === 'remove') {
            this._viewContainer.clear();
            this._view = undefined;
            return;
        }

        if (!this._view) {
            this._view = this._viewContainer.createEmbeddedView(this._templateRef);
        }

        this._applyState(allowed);
    }

    private _applyState(allowed: boolean): void {
        const nodes = this._view?.rootNodes ?? [];
        for (const node of nodes) {
            if (!(node instanceof HTMLElement)) continue;

            if (allowed) {
                node.removeAttribute('data-permission-denied');
                node.style.removeProperty('display');
                if (this.appHasPermissionMode === 'disable') {
                    this._setDisabled(node, false);
                }
                continue;
            }

            node.setAttribute('data-permission-denied', 'true');

            if (this.appHasPermissionMode === 'hide') {
                node.style.setProperty('display', 'none');
            } else if (this.appHasPermissionMode === 'disable') {
                this._setDisabled(node, true);
            }
        }
    }

    private _setDisabled(node: HTMLElement, disabled: boolean): void {
        node.classList.toggle('permission-disabled', disabled);
        node.setAttribute('aria-disabled', String(disabled));

        // Thẻ có thuộc tính disabled (button/input/select...) thì khoá trực tiếp.
        if ('disabled' in node) {
            (node as HTMLElement & { disabled: boolean }).disabled = disabled;
        }
    }
}
