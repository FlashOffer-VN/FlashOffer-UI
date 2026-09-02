// shared/components/layouts/admin-layout/admin-sidebar/admin-sidebar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppService } from '../../../../../core/services/app.service';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './admin-sidebar.component.html',
    styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
    @Input() isOpen = true;
    @Output() toggle = new EventEmitter<void>();

    menuItems: MenuItem[] = [
        { path: '/admin/dashboard', icon: 'fa-solid fa-house', label: 'Dashboard' },
        { path: '/admin/offers', icon: 'fa-solid fa-tags', label: 'Offers' },
        { path: '/admin/collaborator', icon: 'fa-solid fa-users', label: 'Collaborator' },
        { path: '/admin/partner', icon: 'fa-solid fa-building', label: 'Partner' },
        { path: '/admin/settings', icon: 'fa-solid fa-cog', label: 'Settings' },
    ];

    constructor(private _appService: AppService) { }

    toggleSidebar(): void {
        this.toggle.emit();
    }

    logout(): void {
        if (confirm('Are you sure you want to logout?')) {
            this._appService.auth.logout();
        }
    }
}

interface MenuItem {
    path: string;
    icon: string;
    label: string;
}