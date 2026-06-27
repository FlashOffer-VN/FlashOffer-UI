import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-group-buying',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './group-buying.component.html',
    styleUrls: ['./group-buying.component.css']
})
export class GroupBuyingComponent {
    groupForm: FormGroup;
    isSubmitting = false;
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';

    constructor(private fb: FormBuilder) {
        this.groupForm = this.fb.group({
            productName: ['', [Validators.required, Validators.minLength(2)]],
            targetPeopleCount: ['', [Validators.required, Validators.min(2)]],
            targetPrice: ['', [Validators.required, Validators.min(1000)]],
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
            note: ['']
        });
    }

    get f() { return this.groupForm.controls; }

    onSubmit() {
        if (this.groupForm.invalid) {
            this.groupForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        console.log('Form data:', this.groupForm.value);

        setTimeout(() => {
            this.isSubmitting = false;
            this.showToastMessage('Tạo yêu cầu mua chung thành công!', 'success');
            this.groupForm.reset();
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