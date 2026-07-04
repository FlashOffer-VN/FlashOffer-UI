// shared/components/layouts/admin-layout/admin-footer/admin-footer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-footer.component.html',
    styleUrls: ['./admin-footer.component.css']
})
export class AdminFooterComponent {
    currentYear = new Date().getFullYear();
}