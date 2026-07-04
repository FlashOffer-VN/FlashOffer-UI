// core/services/toast.service.ts
import { Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ToastComponent } from '../../shared/components/toast/toast.component';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastRef: ComponentRef<ToastComponent> | null = null;

    constructor(
        private appRef: ApplicationRef,
        private injector: EnvironmentInjector
    ) { }

    show(message: string, type: ToastType = 'info', duration: number = 3000): void {
        this.dismiss();

        // ✅ Tạo component với generic
        const componentRef = createComponent<ToastComponent>(ToastComponent, {
            environmentInjector: this.injector,
        });

        // Set data
        componentRef.instance.message = message;
        componentRef.instance.type = type;
        componentRef.instance.duration = duration;
        componentRef.instance.visible = true;

        // Attach vào DOM
        document.body.appendChild(componentRef.location.nativeElement);
        this.appRef.attachView(componentRef.hostView);

        this.toastRef = componentRef;

        setTimeout(() => this.dismiss(), duration);
    }

    success(message: string, duration?: number): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration?: number): void {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }

    dismiss(): void {
        if (this.toastRef) {
            this.appRef.detachView(this.toastRef.hostView);
            this.toastRef.destroy();
            this.toastRef = null;
        }
    }
}