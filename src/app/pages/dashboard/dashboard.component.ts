import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AppService } from '@core/services/app.service';
import { DashboardStats, RecentActivity, RecentActivityType } from '@core/models/dashboard.model';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    isLoading = true;
    hasError = false;
    lastUpdated: Date | null = null;
    stats: DashboardStats | null = null;
    cards: DashboardCard[] = [];

    readonly quickLinks = [
        { label: 'ADMIN.DASHBOARD.PARTNERS', icon: 'fa-solid fa-building', route: '/admin/partner' },
        { label: 'ADMIN.DASHBOARD.COLLABORATORS', icon: 'fa-solid fa-users', route: '/admin/collaborator' },
        { label: 'ADMIN.DASHBOARD.SOCIAL_POSTS', icon: 'fa-solid fa-comments', route: '/admin/social-posts' }
    ];

    constructor(private readonly appService: AppService) { }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.isLoading = true;
        this.hasError = false;

        this.appService.dashboardService.getStats()
            .pipe(finalize(() => {
                this.isLoading = false;
                this.lastUpdated = new Date();
            }))
            .subscribe({
                next: response => {
                    this.stats = response.data;
                    this.buildCards();
                },
                error: () => {
                    this.hasError = true;
                }
            });
    }

    activityIcon(type: RecentActivityType): string {
        switch (type) {
            case RecentActivityType.OFFER_REQUEST: return 'fa-solid fa-tags';
            case RecentActivityType.PURCHASE_REQUEST: return 'fa-solid fa-cart-shopping';
            case RecentActivityType.GROUP_BUYING_REQUEST: return 'fa-solid fa-people-group';
            case RecentActivityType.CTV_REGISTRATION: return 'fa-solid fa-user-plus';
            default: return 'fa-solid fa-circle';
        }
    }

    activityText(activity: RecentActivity): string {
        const action = this.appService.trans(this.activityActionKey(activity.type));
        const type = this.appService.trans(this.activityTypeKey(activity.type));
        return `${activity.userName} ${action} ${type}`;
    }

    private buildCards(): void {
        const s = this.stats;
        if (!s) {
            this.cards = [];
            return;
        }

        this.cards = [
            {
                key: 'OFFER_REQUESTS',
                label: 'ADMIN.DASHBOARD.OFFER_REQUESTS',
                icon: 'fa-solid fa-tags',
                color: 'orange',
                total: s.totalOfferRequests,
                pending: s.pendingOfferRequests
            },
            {
                key: 'PURCHASE_REQUESTS',
                label: 'ADMIN.DASHBOARD.PURCHASE_REQUESTS',
                icon: 'fa-solid fa-cart-shopping',
                color: 'pink',
                total: s.totalPurchaseRequests,
                pending: s.pendingPurchaseRequests
            },
            {
                key: 'GROUP_BUYING_REQUESTS',
                label: 'ADMIN.DASHBOARD.GROUP_BUYING_REQUESTS',
                icon: 'fa-solid fa-people-group',
                color: 'cyan',
                total: s.totalGroupBuyingRequests,
                pending: s.pendingGroupBuyingRequests
            },
            {
                key: 'CTV_REGISTRATIONS',
                label: 'ADMIN.DASHBOARD.CTV_REGISTRATIONS',
                icon: 'fa-solid fa-user-plus',
                color: 'purple',
                total: s.totalCTVRegistrations,
                pending: s.pendingCTVRegistrations
            }
        ];
    }

    private activityTypeKey(type: RecentActivityType): string {
        switch (type) {
            case RecentActivityType.OFFER_REQUEST: return 'ADMIN.DASHBOARD.ACTIVITY.OFFER_REQUEST';
            case RecentActivityType.PURCHASE_REQUEST: return 'ADMIN.DASHBOARD.ACTIVITY.PURCHASE_REQUEST';
            case RecentActivityType.GROUP_BUYING_REQUEST: return 'ADMIN.DASHBOARD.ACTIVITY.GROUP_BUYING_REQUEST';
            case RecentActivityType.CTV_REGISTRATION: return 'ADMIN.DASHBOARD.ACTIVITY.CTV_REGISTRATION';
            default: return 'ADMIN.DASHBOARD.ACTIVITY.OFFER_REQUEST';
        }
    }

    private activityActionKey(type: RecentActivityType): string {
        switch (type) {
            case RecentActivityType.CTV_REGISTRATION: return 'ADMIN.DASHBOARD.ACTIVITY.REGISTERED';
            default: return 'ADMIN.DASHBOARD.ACTIVITY.CREATED';
        }
    }
}

type DashboardCardKey =
    | 'OFFER_REQUESTS'
    | 'PURCHASE_REQUESTS'
    | 'GROUP_BUYING_REQUESTS'
    | 'CTV_REGISTRATIONS';

interface DashboardCard {
    key: DashboardCardKey;
    label: string;
    icon: string;
    color: string;
    total: number;
    pending: number;
}