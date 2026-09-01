// core/services/toast.service.ts
import { Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { TranslateService } from '@ngx-translate/core';
import { isBrowser } from '../utils/platform';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
    message: string;
    type?: ToastType;
    title?: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastRef: ComponentRef<ToastComponent> | null = null;
    private timeoutId: any = null;

    constructor(
        private appRef: ApplicationRef,
        private environmentInjector: EnvironmentInjector,
        private translate: TranslateService
    ) { }

    /**
     * Hiển thị toast với options
     */
    show(options: ToastOptions | string, type?: ToastType, duration?: number): void {
        let opts: ToastOptions;
        if (typeof options === 'string') {
            opts = { message: options, type, duration };
        } else {
            opts = options;
        }

        this.dismiss();

        const componentRef = createComponent(ToastComponent, {
            environmentInjector: this.environmentInjector,
        });

        const instance = componentRef.instance;
        instance.message = opts.message;
        instance.type = opts.type || 'info';
        instance.title = opts.title || '';
        instance.duration = opts.duration || 3000;
        instance.visible = true;

        if (isBrowser()) {
            document.body.appendChild(componentRef.location.nativeElement);
        }
        this.appRef.attachView(componentRef.hostView);

        this.toastRef = componentRef;

        this.timeoutId = setTimeout(() => {
            this.dismiss();
        }, opts.duration || 3000);
    }

    // ✅ Các method tiện ích - Dùng translate
    success(message: string, title?: string, duration?: number): void {
        const translatedTitle = title || this.translate.instant('TOAST.SUCCESS');
        this.show({ message, type: 'success', title: translatedTitle, duration });
    }

    error(message: string, title?: string, duration?: number): void {
        const translatedTitle = title || this.translate.instant('TOAST.ERROR');
        this.show({ message, type: 'error', title: translatedTitle, duration });
    }

    warning(message: string, title?: string, duration?: number): void {
        const translatedTitle = title || this.translate.instant('TOAST.WARNING');
        this.show({ message, type: 'warning', title: translatedTitle, duration });
    }

    info(message: string, title?: string, duration?: number): void {
        const translatedTitle = title || this.translate.instant('TOAST.INFO');
        this.show({ message, type: 'info', title: translatedTitle, duration });
    }

    /**
     * Đóng toast hiện tại
     */
    dismiss(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        if (this.toastRef) {
            // Đánh dấu removing để chạy animation
            const instance = this.toastRef.instance;
            if (instance) {
                instance.isRemoving = true;
            }

            setTimeout(() => {
                if (this.toastRef) {
                    this.appRef.detachView(this.toastRef.hostView);
                    this.toastRef.destroy();
                    this.toastRef = null;
                }
            }, 300);
        }
    }

    /**
     * Kiểm tra xem có toast đang hiển thị không
     */
    isVisible(): boolean {
        return this.toastRef !== null;
    }
}