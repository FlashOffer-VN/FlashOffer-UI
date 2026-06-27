// login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    template: `<h1 class="text-2xl font-bold text-secondary">Login Page</h1>`,
})
export class LoginComponent { }