import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { CommissionService } from '@core/services/commission.service';
import { CommissionConfig } from '@core/models/commission.model';
import { CommissionType, getCommissionTypeLabel } from '@core/models/partner.model';
import { UserRole, toUserRole } from '@core/models/auth.model';

import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { LoadingComponent } from '@shared/components/loading/loading.component';

/** Một khối mức hoa hồng theo bên nhận. */
interface CommissionCard {
    key: string;
    titleKey: string;
    config: CommissionConfig | null;
}

/**
 * Mức hoa hồng giới thiệu của cá nhân. Mỗi tài khoản chỉ nhận một vai trò: đối tác chiến lược
 * nhận mức của bên nhận đối tác, các tài khoản còn lại nhận mức của người giới thiệu.
 */
@Component({
    selector: 'app-my-commission-page',
    standalone: true,
    imports: [CommonModule, TranslateModule, AppPricePipe, LoadingComponent],
    template: `
        <div class="space-y-4">
            <header>
                <h1 class="text-xl font-semibold text-gray-900">{{ 'USER.COMMISSION.TITLE' | translate }}</h1>
                <p class="text-sm text-gray-500 mt-1">{{ 'USER.COMMISSION.SUBTITLE' | translate }}</p>
            </header>

            @if (isLoading) {
                <app-loading></app-loading>
            } @else {
                @for (card of cards; track card.key) {
                    <section class="bg-white rounded-xl border border-gray-200 p-4">
                        <div class="flex items-center justify-between gap-2">
                            <h2 class="text-base font-semibold text-gray-900">{{ card.titleKey | translate }}</h2>
                            @if (card.config) {
                                <span class="px-2 py-0.5 rounded text-xs"
                                    [class]="card.config.isPersonal ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'">
                                    {{ (card.config.isPersonal ? 'USER.COMMISSION.BADGE_PERSONAL' : 'USER.COMMISSION.BADGE_GLOBAL') | translate }}
                                </span>
                            }
                        </div>

                        @if (!card.config) {
                            <p class="text-sm text-gray-500 mt-3">{{ 'USER.COMMISSION.EMPTY' | translate }}</p>
                        } @else {
                            @if (card.config.type === tiered) {
                                <p class="mt-3 text-lg font-semibold text-gray-900">{{ 'COMMISSION.TIERS' | translate }}</p>
                            } @else if (card.config.type === fixed) {
                                <p class="mt-3 text-2xl font-semibold text-gray-900">{{ card.config.rate | appPrice }}</p>
                            } @else {
                                <p class="mt-3 text-2xl font-semibold text-gray-900">{{ card.config.rate }}%</p>
                            }
                            <p class="text-sm text-gray-500">{{ getCommissionTypeLabel(card.config.type) | translate }}</p>

                            @if (card.config.type === tiered && card.config.tiers.length > 0) {
                                <table class="mt-3 w-full text-sm">
                                    <thead>
                                        <tr class="text-left text-gray-500">
                                            <th class="py-1">{{ 'COMMISSION.TIER_FROM' | translate }}</th>
                                            <th class="py-1">{{ 'COMMISSION.TIER_TO' | translate }}</th>
                                            <th class="py-1">{{ 'COMMISSION.TIER_RATE' | translate }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (tier of card.config.tiers; track $index) {
                                            <tr class="border-t border-gray-100 text-gray-700">
                                                <td class="py-1">{{ tier.fromValue | appPrice }}</td>
                                                <td class="py-1">
                                                    {{ tier.toValue === null || tier.toValue === undefined
                                                        ? ('COMMISSION.TIER_NO_LIMIT' | translate)
                                                        : (tier.toValue | appPrice) }}
                                                </td>
                                                <td class="py-1">{{ tier.rate }}</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            }

                            @if (card.config.minOrderValue) {
                                <p class="text-sm text-gray-600 mt-3">
                                    {{ 'COMMISSION.MIN_ORDER' | translate }}: <strong>{{ card.config.minOrderValue | appPrice }}</strong>
                                </p>
                            }
                            @if (card.config.maxCommission) {
                                <p class="text-sm text-gray-600">
                                    {{ 'COMMISSION.MAX_COMMISSION' | translate }}: <strong>{{ card.config.maxCommission | appPrice }}</strong>
                                </p>
                            }
                            @if (!card.config.isActive) {
                                <p class="text-sm text-red-600 mt-2">{{ 'USER.COMMISSION.PAUSED' | translate }}</p>
                            }
                        }
                    </section>
                }

                <p class="text-xs text-gray-500">{{ 'USER.COMMISSION.HINT' | translate }}</p>
            }
        </div>
    `
})
export class MyCommissionPageComponent implements OnInit {
    cards: CommissionCard[] = [];
    isLoading = false;

    readonly tiered = CommissionType.Tiered;
    readonly fixed = CommissionType.Fixed;

    constructor(
        private readonly _appService: AppService,
        private readonly _commissionService: CommissionService
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this._commissionService.getMine().subscribe({
            next: response => {
                const mine = response.data;
                // Hoa hồng hiển thị theo vai trò của tài khoản: đối tác chiến lược xem mức của đối tác,
                // các tài khoản còn lại xem mức của người giới thiệu.
                const isPartner = toUserRole(this._appService.auth.getCurrentUser()?.role) === UserRole.Partner;
                this.cards = isPartner
                    ? [{
                        key: 'partner',
                        titleKey: 'USER.COMMISSION.PARTNER_TITLE',
                        config: mine?.partner ?? null
                    }]
                    : [{
                        key: 'referrer',
                        titleKey: 'USER.COMMISSION.REFERRER_TITLE',
                        config: mine?.referrer ?? null
                    }];
                this.isLoading = false;
            },
            error: () => {
                this.cards = [];
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Nhãn cách tính hoa hồng (key i18n). */
    getCommissionTypeLabel = getCommissionTypeLabel;
}
