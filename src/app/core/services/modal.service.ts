// core/services/modal.service.ts
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
    contentComponent?: any;
    contentData?: any;
    customWidth?: string;
    showHeader?: boolean;
    showCloseButton?: boolean;
    showFooter?: boolean;
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
        const service = this;
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
        const service = this;
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

    create<T>(component: Type<T> | string, options: ModalOptions = {}): ModalRef {
        // Nếu component là string → hiển thị text message
        if (typeof component === 'string') {
            const modalRef = this._createModal(options);
            const instance = modalRef.componentRef.instance;
            instance.message = component;
            instance.title = options.title || '';
            instance.showFooter = options.showCancel !== undefined ? options.showCancel : false;
            return modalRef;
        }

        // Nếu có contentComponent → render vào ng-content
        if (options.contentComponent) {
            const modalRef = this._createModal(options);

            setTimeout(() => {
                const contentRef = createComponent(options.contentComponent, {
                    environmentInjector: this._injector
                });

                if (options.contentData) {
                    Object.assign(contentRef.instance as any, options.contentData);
                }

                this._appRef.attachView(contentRef.hostView);

                const nativeEl = modalRef.componentRef.location.nativeElement;
                const bodyEl = nativeEl.querySelector('.modal-body');
                const contentEl = nativeEl.querySelector('.px-6.py-4');

                if (bodyEl) {
                    bodyEl.appendChild(contentRef.location.nativeElement);
                } else if (contentEl) {
                    contentEl.appendChild(contentRef.location.nativeElement);
                } else {
                    const container = nativeEl.querySelector('.bg-white.rounded-xl > div');
                    if (container) {
                        container.appendChild(contentRef.location.nativeElement);
                    }
                }
            }, 100);

            return modalRef;
        }

        // Fallback: tạo modal với component truyền vào (cách cũ)
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
        instance.customWidth = options.customWidth || '';
        instance.showCancel = options.showCancel !== undefined ? options.showCancel : true;
        instance.showHeader = options.showHeader !== undefined ? options.showHeader : true;
        instance.showFooter = options.showFooter !== undefined ? options.showFooter : true;
        instance.showCloseButton = options.showCloseButton !== undefined ? options.showCloseButton : true;
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