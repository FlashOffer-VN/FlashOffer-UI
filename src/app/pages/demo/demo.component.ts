import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { LoadingComponent, LoadingType } from '../../shared/components/loading/loading.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { InputComponent } from '../../shared/components/input/input.component';

@Component({
    selector: 'app-demo',
    standalone: true,
    imports: [
        CommonModule,
        ButtonComponent,
        LoadingComponent,
        ToastComponent,
        ModalComponent,
        InputComponent
    ],
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css']
})
export class DemoComponent {
    // ===== TOAST =====
    toastVisible = false;
    toastType: 'success' | 'error' | 'warning' | 'info' = 'success';
    toastMessage = '';
    toastTitle = '';

    // ===== MODAL =====
    modalVisible = false;

    // ===== LOADING =====
    currentLoading: LoadingType | null = null;
    isFullscreen = false;

    // ===== TOAST METHODS =====
    showToast(type: 'success' | 'error' | 'warning' | 'info') {
        this.toastType = type;
        this.toastTitle = type.charAt(0).toUpperCase() + type.slice(1);
        this.toastMessage = `This is a ${type} toast message!`;
        this.toastVisible = true;
        setTimeout(() => {
            this.toastVisible = false;
        }, 3000);
    }

    // ===== MODAL METHODS =====
    openModal() {
        this.modalVisible = true;
    }

    onModalConfirm() {
        alert('Confirmed!');
        this.modalVisible = false;
    }

    onModalCancel() {
        this.modalVisible = false;
    }

    // ===== LOADING METHODS =====
    showLoading(type: LoadingType) {
        this.currentLoading = type;
        this.isFullscreen = false;
        setTimeout(() => {
            this.currentLoading = null;
        }, 3000);
    }

    showFullscreenLoading() {
        this.currentLoading = null;
        this.isFullscreen = true;
        setTimeout(() => {
            this.isFullscreen = false;
        }, 3000);
    }

    hideLoading() {
        this.currentLoading = null;
        this.isFullscreen = false;
    }
}