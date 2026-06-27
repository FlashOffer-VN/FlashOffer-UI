import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-get-offer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './get-offer.component.html',
    styleUrls: ['./get-offer.component.css']
})
export class GetOfferComponent {
    offerForm: FormGroup;
    isSubmitting = false;
    showToast = false;
    toastMessage = '';
    toastType: 'success' | 'error' = 'success';

    constructor(private fb: FormBuilder) {
        this.offerForm = this.fb.group({
            selectedOffer: ['', [Validators.required, Validators.minLength(2)]],
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
            zalo: [''],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    get f() { return this.offerForm.controls; }

    onSubmit() {
        if (this.offerForm.invalid) {
            this.offerForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        console.log('Form data:', this.offerForm.value);

        setTimeout(() => {
            this.isSubmitting = false;
            this.showToastMessage('Gửi yêu cầu nhận offer thành công!', 'success');
            this.offerForm.reset();
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