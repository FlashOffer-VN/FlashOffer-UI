// src/app/pages/admin/crm/admin-crm.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, Subscription } from 'rxjs';
import type { ApexOptions } from 'apexcharts';
import { ChartComponent } from 'ng-apexcharts';
import { AppService } from '@core/services/app.service';
import { isBrowser } from '@core/utils/platform';
import { CrmDashboardStats, CrmEntityType } from '@core/models/crm.model';

const CHART_PALETTE = ['#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#db2777', '#2563eb'];

@Component({
    selector: 'app-admin-crm',
    standalone: true,
    imports: [CommonModule, TranslateModule, ChartComponent],
    templateUrl: './admin-crm.component.html',
    styleUrls: ['./admin-crm.component.css']
})
export class AdminCrmComponent implements OnInit, OnDestroy {
    isLoading = true;
    hasError = false;
    lastUpdated: Date | null = null;
    stats: CrmDashboardStats | null = null;
    cards: CrmCard[] = [];

    readonly isBrowser = isBrowser;

    trendOptions: ApexOptions | null = null;
    categoryOptions: ApexOptions | null = null;
    distributionGroups: DistributionGroup[] = [];

    private langSub: Subscription | null = null;

    constructor(private readonly appService: AppService) { }

    ngOnInit(): void {
        this.loadStats();
        // Tên series/label chart được bake vào lúc build -> rebuild khi đổi ngôn ngữ
        this.langSub = this.appService.onLanguageChange().subscribe(() => {
            if (this.stats) {
                this.buildAllCharts();
            }
        });
    }

    ngOnDestroy(): void {
        this.langSub?.unsubscribe();
    }

    loadStats(): void {
        this.isLoading = true;
        this.hasError = false;

        this.appService.crmService.getStats()
            .pipe(finalize(() => {
                this.isLoading = false;
                this.lastUpdated = new Date();
            }))
            .subscribe({
                next: response => {
                    this.stats = response.data;
                    this.buildCards();
                    this.buildAllCharts();
                },
                error: () => {
                    this.hasError = true;
                }
            });
    }

    // ===== KPI cards =====

    private buildCards(): void {
        const s = this.stats?.summary;
        if (!s) {
            this.cards = [];
            return;
        }

        this.cards = [
            {
                key: 'OFFERS',
                label: 'ADMIN.CRM.SUMMARY_OFFERS',
                icon: 'fa-solid fa-tags',
                color: 'orange',
                total: s.totalOffers,
                pending: s.pendingOffers,
                showPending: true
            },
            {
                key: 'PURCHASES',
                label: 'ADMIN.CRM.SUMMARY_PURCHASES',
                icon: 'fa-solid fa-cart-shopping',
                color: 'pink',
                total: s.totalPurchaseRequests,
                pending: s.pendingPurchaseRequests,
                showPending: true
            },
            {
                key: 'GROUP_BUYING',
                label: 'ADMIN.CRM.SUMMARY_GROUP_BUYING',
                icon: 'fa-solid fa-people-group',
                color: 'cyan',
                total: s.totalGroupBuyingRequests,
                pending: s.pendingGroupBuyingRequests,
                showPending: true
            },
            {
                key: 'CTV',
                label: 'ADMIN.CRM.SUMMARY_CTV',
                icon: 'fa-solid fa-user-plus',
                color: 'purple',
                total: s.totalCtvRegistrations,
                pending: s.pendingCtvRegistrations,
                showPending: true
            },
            {
                key: 'PARTNERS',
                label: 'ADMIN.CRM.SUMMARY_PARTNERS',
                icon: 'fa-solid fa-building',
                color: 'green',
                total: s.totalPartners,
                pending: s.pendingPartners,
                showPending: true
            },
            {
                key: 'SOCIAL',
                label: 'ADMIN.CRM.SUMMARY_SOCIAL',
                icon: 'fa-solid fa-comments',
                color: 'blue',
                total: s.totalSocialPosts,
                pending: 0,
                showPending: false
            }
        ];
    }

    // ===== Charts =====

    private buildAllCharts(): void {
        this.buildTrendOptions();
        this.buildCategoryOptions();
        this.buildDistributionGroups();
    }

    private buildTrendOptions(): void {
        const trends = this.stats?.trends ?? [];
        this.trendOptions = {
            chart: {
                type: 'area',
                height: 320,
                toolbar: { show: false },
                fontFamily: 'Inter, system-ui, sans-serif'
            },
            series: [
                { name: this.t('ADMIN.CRM.SUMMARY_OFFERS'), data: trends.map(t => t.offers) },
                { name: this.t('ADMIN.CRM.SUMMARY_PURCHASES'), data: trends.map(t => t.purchaseRequests) },
                { name: this.t('ADMIN.CRM.SUMMARY_CTV'), data: trends.map(t => t.ctvRegistrations) },
                { name: this.t('ADMIN.CRM.SUMMARY_PARTNERS'), data: trends.map(t => t.partners) }
            ],
            colors: CHART_PALETTE,
            stroke: { curve: 'smooth', width: 2 },
            fill: {
                type: 'gradient',
                gradient: { opacityFrom: 0.25, opacityTo: 0.01 }
            },
            dataLabels: { enabled: false },
            grid: { borderColor: '#e5e7eb' },
            xaxis: {
                categories: trends.map(t => t.month),
                labels: { style: { colors: '#6b7280', fontSize: '12px' } }
            },
            yaxis: {
                labels: { style: { colors: '#6b7280', fontSize: '12px' } }
            },
            legend: { position: 'bottom', fontSize: '12px' },
            tooltip: { shared: true, intersect: false },
            noData: { text: this.t('ADMIN.CRM.TRENDS_EMPTY'), align: 'center', verticalAlign: 'middle' }
        };
    }

    private buildCategoryOptions(): void {
        const cats = this.stats?.topCategories ?? [];
        this.categoryOptions = {
            chart: {
                type: 'bar',
                height: 300,
                toolbar: { show: false },
                fontFamily: 'Inter, system-ui, sans-serif'
            },
            series: [
                { name: this.t('ADMIN.CRM.CATEGORIES_SERIES'), data: cats.map(c => c.count) }
            ],
            colors: CHART_PALETTE,
            plotOptions: {
                bar: { horizontal: true, distributed: true, barHeight: '60%' }
            },
            dataLabels: { enabled: false },
            grid: { borderColor: '#e5e7eb' },
            xaxis: {
                categories: cats.map(c => c.name),
                labels: { style: { colors: '#6b7280', fontSize: '12px' } }
            },
            legend: { show: false },
            noData: { text: this.t('ADMIN.CRM.CATEGORIES_EMPTY'), align: 'center', verticalAlign: 'middle' }
        };
    }

    private buildDistributionGroups(): void {
        const dist = this.stats?.distribution ?? [];
        this.distributionGroups = [];

        const entities: Array<{ entity: CrmEntityType; titleKey: string }> = [
            { entity: 'offer', titleKey: 'ADMIN.CRM.DISTRIBUTION_OFFERS' },
            { entity: 'purchase', titleKey: 'ADMIN.CRM.DISTRIBUTION_PURCHASES' },
            { entity: 'ctv', titleKey: 'ADMIN.CRM.DISTRIBUTION_CTV' },
            { entity: 'partner', titleKey: 'ADMIN.CRM.DISTRIBUTION_PARTNERS' }
        ];

        for (const meta of entities) {
            const slices = dist
                .filter(s => s.entity === meta.entity)
                .sort((a, b) => b.count - a.count);
            if (slices.length === 0) {
                continue;
            }

            this.distributionGroups.push({
                titleKey: meta.titleKey,
                options: {
                    chart: {
                        type: 'donut',
                        height: 220,
                        toolbar: { show: false },
                        fontFamily: 'Inter, system-ui, sans-serif'
                    },
                    series: slices.map(s => s.count),
                    labels: slices.map(s => this.t(s.statusLabel)),
                    colors: CHART_PALETTE.slice(0, slices.length),
                    legend: { position: 'bottom', fontSize: '12px' },
                    dataLabels: { enabled: false },
                    plotOptions: {
                        pie: { donut: { size: '72%' } }
                    },
                    responsive: [
                        {
                            breakpoint: 480,
                            options: { legend: { position: 'bottom' } }
                        }
                    ],
                    noData: { text: this.t('ADMIN.CRM.TRENDS_EMPTY'), align: 'center', verticalAlign: 'middle' }
                }
            });
        }
    }

    private t(key: string): string {
        return this.appService.trans(key);
    }
}

interface CrmCard {
    key: string;
    label: string;
    icon: string;
    color: string;
    total: number;
    pending: number;
    showPending: boolean;
}

interface DistributionGroup {
    titleKey: string;
    options: ApexOptions;
}