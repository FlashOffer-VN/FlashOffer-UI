import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { AppService } from '@core/services/app.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    isLoading = true;
    lastUpdated: Date | null = null;
    private pendingRequests = 0;

    stats: DashboardStat[] = [
        { key: 'PARTNERS', label: 'ADMIN.DASHBOARD.PARTNERS', icon: 'fa-solid fa-building', color: 'blue', route: '/admin/partner' },
        { key: 'COLLABORATORS', label: 'ADMIN.DASHBOARD.COLLABORATORS', icon: 'fa-solid fa-users', color: 'purple', route: '/admin/collaborator' },
        { key: 'SOCIAL_POSTS', label: 'ADMIN.DASHBOARD.SOCIAL_POSTS', icon: 'fa-solid fa-comments', color: 'green', route: '/admin/social-posts' },
        { key: 'OFFER_REQUESTS', label: 'ADMIN.DASHBOARD.OFFER_REQUESTS', icon: 'fa-solid fa-tags', color: 'orange' },
        { key: 'PURCHASE_REQUESTS', label: 'ADMIN.DASHBOARD.PURCHASE_REQUESTS', icon: 'fa-solid fa-cart-shopping', color: 'pink' },
        { key: 'GROUP_BUYING_REQUESTS', label: 'ADMIN.DASHBOARD.GROUP_BUYING_REQUESTS', icon: 'fa-solid fa-people-group', color: 'cyan' }
    ];

    constructor(private readonly appService: AppService) { }

    ngOnInit(): void {
        this.loadStats();
    }

    loadStats(): void {
        this.isLoading = true;
        this.pendingRequests = 6;
        this.stats.forEach(stat => {
            stat.value = undefined;
            stat.hasError = false;
        });

        this.appService.partnerService.getData(1, 1).pipe(finalize(() => this.requestCompleted())).subscribe({
            next: response => this.setValue('PARTNERS', response.totalCount),
            error: () => this.setError('PARTNERS')
        });

        this.appService.collaboratorService.getPaged(1, 1).pipe(finalize(() => this.requestCompleted())).subscribe({
            next: response => this.setValue('COLLABORATORS', response.totalCount),
            error: () => this.setError('COLLABORATORS')
        });

        this.appService.socialService.getPosts({ pageNumber: 1, pageSize: 1 }).pipe(finalize(() => this.requestCompleted())).subscribe({
            next: response => this.setValue('SOCIAL_POSTS', response.totalCount),
            error: () => this.setError('SOCIAL_POSTS')
        });

        this.appService.offerRequest.getAll().pipe(finalize(() => this.requestCompleted())).subscribe({
            next: response => this.setValue('OFFER_REQUESTS', response.data.length),
            error: () => this.setError('OFFER_REQUESTS')
        });

        this.appService.purchaseRequest.getAll().pipe(finalize(() => this.requestCompleted())).subscribe({
            next: response => this.setValue('PURCHASE_REQUESTS', response.data.length),
            error: () => this.setError('PURCHASE_REQUESTS')
        });

        this.appService.groupBuyingRequest.getAll().pipe(finalize(() => this.requestCompleted())).subscribe({
            next: response => this.setValue('GROUP_BUYING_REQUESTS', response.data.length),
            error: () => this.setError('GROUP_BUYING_REQUESTS')
        });

        this.lastUpdated = new Date();
    }

    private requestCompleted(): void {
        this.pendingRequests -= 1;
        if (this.pendingRequests === 0) {
            this.isLoading = false;
        }
    }

    private setValue(key: DashboardStatKey, value: number): void {
        const stat = this.stats.find(item => item.key === key);
        if (stat) {
            stat.value = value;
        }
    }

    private setError(key: DashboardStatKey): void {
        const stat = this.stats.find(item => item.key === key);
        if (stat) {
            stat.hasError = true;
        }
    }
}

type DashboardStatKey =
    | 'PARTNERS'
    | 'COLLABORATORS'
    | 'SOCIAL_POSTS'
    | 'OFFER_REQUESTS'
    | 'PURCHASE_REQUESTS'
    | 'GROUP_BUYING_REQUESTS';

interface DashboardStat {
    key: DashboardStatKey;
    label: string;
    icon: string;
    color: string;
    route?: string;
    value?: number;
    hasError?: boolean;
}