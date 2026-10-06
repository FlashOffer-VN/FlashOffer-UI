import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent, LoadingType } from '@shared/components/loading/loading.component';
import { ToastComponent } from '@shared/components/toast/toast.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';
import { RadioGroupComponent, RadioOption } from '@shared/components/radio-group/radio-group.component';

@Component({
    selector: 'app-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonComponent,
        LoadingComponent,
        ToastComponent,
        ModalComponent,
        InputComponent,
        CheckboxComponent,
        RadioGroupComponent
    ],
    templateUrl: './demo.component.html',
    styleUrls: ['./demo.component.css']
})
export class DemoComponent {

    /** Trạng thái cho phần xem trước checkbox/radio ở cuối trang. */
    demoCheckbox = true;
    demoCheckboxSmall = false;
    demoRole = 'admin';
    demoRoleCard = 'user';
    demoQuick = 'day';

    /** Lựa chọn mẫu cho nhóm radio. */
    demoRoleOptions: RadioOption[] = [
        { value: 'user', label: 'Người dùng', hint: 'Chỉ dùng khu vực thành viên' },
        { value: 'admin', label: 'Quản trị', hint: 'Toàn quyền nghiệp vụ' },
        { value: 'locked', label: 'Bị khoá', disabled: true }
    ];

    demoQuickOptions: RadioOption[] = [
        { value: 'day', label: 'Hôm nay' },
        { value: 'week', label: 'Tuần này' },
        { value: 'month', label: 'Tháng này' }
    ];

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