import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { MembershipTier, MyMembership } from '@core/models/membership.model';

import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { LoadingComponent } from '@shared/components/loading/loading.component';

/**
 * Điểm & hạng thành viên: hạng hiện tại, doanh số tích luỹ, tiến độ lên hạng kế tiếp
 * và bảng quyền lợi của từng hạng.
 */
@Component({
    selector: 'app-my-membership-page',
    standalone: true,
    imports: [CommonModule, TranslateModule, AppPricePipe, AppDatePipe, LoadingComponent],
    template: `
        <div class="space-y-5">
            <header>
                <h1 class="text-xl font-semibold text-gray-900">{{ 'USER.MEMBERSHIP.TITLE' | translate }}</h1>
                <p class="mt-1 text-sm text-gray-500">{{ 'USER.MEMBERSHIP.SUBTITLE' | translate }}</p>
            </header>

            @if (isLoading) {
                <app-loading></app-loading>
            } @else {
                <div class="grid gap-4 sm:grid-cols-3">
                    <div class="stat-card">
                        <span class="stat-card__icon"><i class="fa-solid fa-crown"></i></span>
                        <p class="stat-card__label">{{ 'USER.MEMBERSHIP.CURRENT_TIER' | translate }}</p>
                        <p class="stat-card__value">{{ membership?.tier?.name || ('USER.MEMBERSHIP.NO_TIER' | translate) }}</p>
                        @if (membership?.tier) {
                            <p class="stat-card__hint">{{ 'USER.MEMBERSHIP.LEVEL' | translate }} {{ membership?.tier?.level }}</p>
                        }
                    </div>

                    <div class="stat-card">
                        <span class="stat-card__icon"><i class="fa-solid fa-chart-line"></i></span>
                        <p class="stat-card__label">{{ 'USER.MEMBERSHIP.ACCUMULATED' | translate }}</p>
                        <p class="stat-card__value">{{ membership?.accumulatedValue || 0 | appPrice }}</p>
                        @if (membership?.evaluatedAt) {
                            <p class="stat-card__hint">
                                {{ 'USER.MEMBERSHIP.EVALUATED_AT' | translate }} {{ membership?.evaluatedAt | appDate:'date' }}
                            </p>
                        }
                    </div>

                    <div class="stat-card">
                        <span class="stat-card__icon"><i class="fa-solid fa-percent"></i></span>
                        <p class="stat-card__label">{{ 'USER.MEMBERSHIP.EARLY_FEE' | translate }}</p>
                        <p class="stat-card__value">{{ membership?.effectiveEarlyWithdrawalFeeRate || 0 }}%</p>
                        <p class="stat-card__hint">{{ 'USER.MEMBERSHIP.EARLY_FEE_HINT' | translate }}</p>
                    </div>
                </div>

                <section class="panel">
                    @if (membership?.nextTier) {
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <h2 class="panel__title">{{ 'USER.MEMBERSHIP.PROGRESS_TITLE' | translate }}</h2>
                            <span class="text-sm text-gray-500">{{ membership?.nextTier?.name }}</span>
                        </div>
                        <div class="progress">
                            <span class="progress__bar" [style.width.%]="progressPercent"></span>
                        </div>
                        <p class="mt-2 text-sm text-gray-500">
                            {{ 'USER.MEMBERSHIP.PROGRESS_HINT' | translate: { amount: (membership?.nextTierRequirement || 0) | appPrice } }}
                        </p>
                    } @else {
                        <h2 class="panel__title">{{ 'USER.MEMBERSHIP.PROGRESS_TITLE' | translate }}</h2>
                        <p class="mt-2 text-sm text-gray-500">{{ 'USER.MEMBERSHIP.MAX_TIER' | translate }}</p>
                    }
                </section>

                <section>
                    <h2 class="panel__title mb-3">{{ 'USER.MEMBERSHIP.BOARD_TITLE' | translate }}</h2>
                    @if (tiers.length === 0) {
                        <p class="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                            {{ 'USER.MEMBERSHIP.EMPTY' | translate }}
                        </p>
                    } @else {
                        <div class="board">
                            @for (tier of tiers; track tier.id) {
                                <article class="tier" [ngClass]="'tier--l' + tier.level" [class.is-current]="isCurrent(tier)">
                                    <header class="tier__head">
                                        <span class="tier__icon"><i class="fa-solid fa-medal"></i></span>
                                        <div class="min-w-0">
                                            <p class="tier__name">{{ tier.name }}</p>
                                            <p class="tier__min">
                                                {{ 'USER.MEMBERSHIP.FROM' | translate }} {{ tier.minAccumulatedValue | appPrice }}
                                            </p>
                                        </div>
                                        @if (isCurrent(tier)) {
                                            <span class="tier__badge">{{ 'USER.MEMBERSHIP.CURRENT_BADGE' | translate }}</span>
                                        }
                                    </header>

                                    <ul class="tier__benefits">
                                        <li>
                                            <i class="fa-solid fa-percent"></i>
                                            <span>{{ 'USER.MEMBERSHIP.BENEFIT_EARLY_FEE' | translate }}</span>
                                            @if (tier.earlyWithdrawalFeeRate !== null && tier.earlyWithdrawalFeeRate !== undefined) {
                                                <strong>{{ tier.earlyWithdrawalFeeRate }}%</strong>
                                            } @else {
                                                <strong class="is-muted">{{ 'USER.MEMBERSHIP.BENEFIT_INHERIT' | translate }}</strong>
                                            }
                                        </li>
                                        <li>
                                            <i class="fa-solid fa-hand-holding-dollar"></i>
                                            <span>{{ 'USER.MEMBERSHIP.BENEFIT_MONTHLY_LIMIT' | translate }}</span>
                                            @if (tier.monthlyWithdrawalLimit !== null && tier.monthlyWithdrawalLimit !== undefined) {
                                                <strong>{{ tier.monthlyWithdrawalLimit | appPrice }}</strong>
                                            } @else {
                                                <strong class="is-muted">{{ 'USER.MEMBERSHIP.BENEFIT_NO_LIMIT' | translate }}</strong>
                                            }
                                        </li>
                                        <li>
                                            <i class="fa-solid fa-bolt"></i>
                                            <span>{{ 'USER.MEMBERSHIP.BENEFIT_PRIORITY' | translate }}</span>
                                            <strong>{{ tier.approvalPriority }}</strong>
                                        </li>
                                    </ul>

                                    @if (tier.description) {
                                        <p class="tier__desc">{{ tier.description }}</p>
                                    }
                                </article>
                            }
                        </div>
                    }
                </section>
            }
        </div>
    `,
    styles: [`
        :host { display: block; }

        .stat-card {
            display: flex; flex-direction: column; gap: .25rem;
            padding: 1rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--white);
            box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
        }
        .stat-card__icon {
            display: grid; place-items: center; width: 2.25rem; height: 2.25rem; margin-bottom: .25rem;
            border-radius: .625rem; background: var(--accent-bg); color: var(--primary);
        }
        .stat-card__label { margin: 0; font-size: .75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
        .stat-card__value { margin: 0; font-size: 1.35rem; font-weight: 700; color: var(--text-heading); }
        .stat-card__hint { margin: 0; font-size: .75rem; color: var(--text-subtle); }

        .panel { padding: 1rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--white); }
        .panel__title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-heading); }

        .progress { height: .5rem; margin-top: .75rem; border-radius: 999px; background: var(--surface-muted); overflow: hidden; }
        .progress__bar { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--primary-light), var(--primary)); transition: width .3s ease; }

        .board { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }

        .tier {
            display: flex; flex-direction: column; gap: .75rem;
            padding: 1rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--white);
            box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
        }
        .tier.is-current { border-color: var(--primary); box-shadow: 0 0 0 3px var(--accent-bg); }

        .tier__head { display: flex; align-items: center; gap: .625rem; }
        .tier__icon {
            display: grid; flex: 0 0 auto; place-items: center; width: 2.25rem; height: 2.25rem;
            border-radius: 999px; background: var(--surface-muted); color: var(--slate-600); font-size: 1rem;
        }
        .tier--l1 .tier__icon { background: #f6e3d5; color: #a1571f; }
        .tier--l2 .tier__icon { background: #e6ecf3; color: #5b6b7f; }
        .tier--l3 .tier__icon { background: #fdf0cd; color: #a37500; }
        .tier--l4 .tier__icon { background: #e6f6fa; color: var(--primary-dark); }
        .tier.is-current .tier__icon { background: var(--primary); color: var(--white); }

        .tier__name { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-heading); }
        .tier__min { margin: 0; font-size: .75rem; color: var(--text-muted); }
        .tier__badge {
            margin-left: auto; padding: .125rem .5rem; border-radius: 999px;
            background: var(--accent-bg); color: var(--primary-dark); font-size: .6875rem; font-weight: 600;
            white-space: nowrap;
        }

        .tier__benefits { display: flex; flex-direction: column; gap: .5rem; margin: 0; padding: 0; list-style: none; }
        .tier__benefits li { display: flex; align-items: center; gap: .5rem; font-size: .875rem; color: var(--text-slate); }
        .tier__benefits li i { width: 1rem; color: var(--primary); text-align: center; }
        .tier__benefits li strong { margin-left: auto; color: var(--text-heading); }
        .tier__benefits li strong.is-muted { font-weight: 500; color: var(--text-subtle); }

        .tier__desc { margin: 0; padding-top: .5rem; border-top: 1px dashed var(--border); font-size: .8125rem; color: var(--text-muted); }
    `]
})
export class MyMembershipPageComponent implements OnInit {
    membership: MyMembership | null = null;
    isLoading = false;

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.isLoading = true;
        this._appService.membershipService.getMine().subscribe({
            next: response => {
                this.membership = response.data;
                this.isLoading = false;
            },
            error: () => {
                this.membership = null;
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    get tiers(): MembershipTier[] {
        return this.membership?.tiers ?? [];
    }

    isCurrent(tier: MembershipTier): boolean {
        return !!this.membership?.tier && this.membership.tier.id === tier.id;
    }

    /** Tiến độ từ mốc hạng hiện tại tới mốc hạng kế tiếp (%). */
    get progressPercent(): number {
        const next = this.membership?.nextTier;
        if (!next) return 100;

        const from = this.membership?.tier?.minAccumulatedValue ?? 0;
        const span = next.minAccumulatedValue - from;
        if (span <= 0) return 100;

        const done = (this.membership?.accumulatedValue ?? 0) - from;
        return Math.max(0, Math.min(100, Math.round((done / span) * 100)));
    }
}
