import { Injectable, ApplicationRef, ComponentRef, EnvironmentInjector, createComponent, Type } from '@angular/core';
import { ModalComponent } from '@shared/components/modal/modal.component';

export interface ModalOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    showCancel?: boolean;
    data?: any;
}

export interface ModalRef {
    close: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    componentRef: ComponentRef<ModalComponent>;
}

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    private _modalRef: ComponentRef<ModalComponent> | null = null;

    constructor(
        private _appRef: ApplicationRef,
        private _injector: EnvironmentInjector
    ) { }

    confirm(options: ModalOptions): Promise<boolean> {
        const service = this;  // 👈 LƯU THIS
        return new Promise((resolve) => {
            const modalRef = service._createModal({
                ...options,
                confirmVariant: options.confirmVariant || 'danger'
            });

            modalRef.onConfirm = () => {
                resolve(true);
                modalRef.close();
            };

            modalRef.onCancel = () => {
                resolve(false);
                modalRef.close();
            };
        });
    }

    alert(options: ModalOptions): Promise<void> {
        const service = this;  // 👈 LƯU THIS
        return new Promise((resolve) => {
            const modalRef = service._createModal({
                ...options,
                showCancel: false,
                confirmVariant: options.confirmVariant || 'primary'
            });

            modalRef.onConfirm = () => {
                resolve();
                modalRef.close();
            };

            modalRef.onCancel = () => {
                resolve();
                modalRef.close();
            };
        });
    }

    create<T>(component: Type<T>, options: ModalOptions): ModalRef {
        const modalRef = this._createModal(options);

        if (options.data && modalRef.componentRef.instance) {
            Object.assign(modalRef.componentRef.instance, options.data);
        }

        return modalRef;
    }

    close(): void {
        if (this._modalRef) {
            this._appRef.detachView(this._modalRef.hostView);
            this._modalRef.destroy();
            this._modalRef = null;
        }
    }

    private _createModal(options: ModalOptions): ModalRef {
        this.close();

        const componentRef = createComponent(ModalComponent, {
            environmentInjector: this._injector
        });

        const instance = componentRef.instance;
        instance.title = options.title || '';
        instance.message = options.message || '';
        instance.confirmText = options.confirmText || 'Xác nhận';
        instance.cancelText = options.cancelText || 'Hủy bỏ';
        instance.confirmVariant = options.confirmVariant || 'primary';
        instance.size = options.size || 'md';
        instance.showCancel = options.showCancel !== undefined ? options.showCancel : true;
        instance.visible = true;

        this._appRef.attachView(componentRef.hostView);
        document.body.appendChild(componentRef.location.nativeElement);

        this._modalRef = componentRef;

        const ref: ModalRef = {
            close: () => {
                instance.visible = false;
                this.close();
            },
            onConfirm: () => { },
            onCancel: () => { },
            componentRef: componentRef
        };

        const confirmSub = instance.confirm.subscribe(() => {
            if (ref.onConfirm) ref.onConfirm();
        });

        const cancelSub = instance.cancel.subscribe(() => {
            if (ref.onCancel) ref.onCancel();
        });

        const closedSub = instance.closed.subscribe(() => {
            this.close();
            confirmSub.unsubscribe();
            cancelSub.unsubscribe();
            closedSub.unsubscribe();
        });

        return ref;
    }
}