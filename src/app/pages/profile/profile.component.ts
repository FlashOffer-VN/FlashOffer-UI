import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    template: `<h1 class="text-2xl font-bold text-secondary">Profile Page</h1>`,
})
export class ProfileComponent { }