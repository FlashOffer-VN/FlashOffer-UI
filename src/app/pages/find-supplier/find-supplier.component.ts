import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-find-supplier',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './find-supplier.component.html',
    styleUrls: ['./find-supplier.component.css']
})
export class FindSupplierComponent {
    findForm: FormGroup;
    isSubmitting = false;
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';

    constructor(private fb: FormBuilder) {
        this.findForm = this.fb.group({
            productName: ['', [Validators.required, Validators.minLength(2)]],
            quantity: ['', [Validators.required, Validators.min(1)]],
            expectedPrice: [''],
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
            email: ['', [Validators.required, Validators.email]],
            note: ['']
        });
    }

    get f() { return this.findForm.controls; }

    onSubmit() {
        if (this.findForm.invalid) {
            this.findForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        console.log('Form data:', this.findForm.value);

        setTimeout(() => {
            this.isSubmitting = false;
            this.showToastMessage('Gửi yêu cầu tìm hàng thành công!', 'success');
            this.findForm.reset();
        }, 1500);
    }

    showToastMessage(message: string, type: 'success' | 'error') {
        this.toastMessage = message;
        this.toastType = type;
        this.showToast = true;
        setTimeout(() => {
            this.showToast = false;
        }, 3000);
    }

    closeToast() {
        this.showToast = false;
    }
}