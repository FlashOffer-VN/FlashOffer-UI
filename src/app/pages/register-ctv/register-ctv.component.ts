import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-register-ctv',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './register-ctv.component.html',
    styleUrls: ['./register-ctv.component.css']
})
export class RegisterCtvComponent {
    ctvForm: FormGroup;
    isSubmitting = false;

    salesChannels = [
        { value: 'retail', label: 'Bán lẻ' },
        { value: 'wholesale', label: 'Bán sỉ' },
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
        { value: 'other', label: 'Khác' }
    ];

    constructor(private fb: FormBuilder) {
        this.ctvForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
            zalo: [''],
            email: ['', [Validators.required, Validators.email]],
            salesChannel: ['', Validators.required],
            experience: ['']
        });
    }

    get f() { return this.ctvForm.controls; }

    onSubmit() {
        if (this.ctvForm.invalid) {
            this.ctvForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        console.log('Form data:', this.ctvForm.value);

        setTimeout(() => {
            this.isSubmitting = false;
            alert('Đăng ký CTV thành công!');
            this.ctvForm.reset();
        }, 1500);
    }
}