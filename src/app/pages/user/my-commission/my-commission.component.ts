import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppService } from '@core/services/app.service';
import { CommissionService } from '@core/services/commission.service';
import { PayoutService } from '@core/services/payout.service';
import { CommissionConfig } from '@core/models/commission.model';
import {
    BankAccount,
    BankAccountVerificationCode,
    MyWallet,
    PayoutPeriodStatus,
    PayoutStatus,
    SaveBankAccountRequest,
    getPayoutStatusLabel,
    getPayoutTypeLabel
} from '@core/models/payout.model';
import { CommissionType, getCommissionTypeLabel } from '@core/models/partner.model';
import { UserRole, toUserRole } from '@core/models/auth.model';
import { bankSelectOptions, buildAccountQr } from '@core/constants/bank-catalog';

import { AppPricePipe } from '@shared/pipes/app-price.pipe';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

/**
 * Trang hoa hồng của tôi: mức hoa hồng đang áp dụng, ví hoa hồng (khả dụng, chờ duyệt, đã nhận),
 * cách hoa hồng được tính, kỳ chốt sổ, lịch sử chi trả và ngân hàng nhận tiền. Mỗi tài khoản chỉ
 * nhận một mức: đối tác chiến lược xem mức của đối tác, các tài khoản còn lại xem mức người giới thiệu.
 */
@Component({
    selector: 'app-my-commission-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        TranslateModule,
        AppPricePipe,
        AppDatePipe,
        LoadingComponent,
        InputComponent,
        ButtonComponent,
        NgSelectWrapperComponent
    ],
    template: `
        <div class="space-y-5">
            <section class="bg-gradient-to-r from-teal-50 via-white to-blue-50 border border-gray-200 rounded-2xl p-5">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div class="max-w-2xl">
                        <p class="text-xs font-semibold text-teal-700 uppercase tracking-wide">{{ 'USER.COMMISSION.KICKER' | translate }}</p>
                        <h1 class="text-2xl font-semibold text-gray-900 mt-1">{{ 'USER.COMMISSION.TITLE' | translate }}</h1>
                        <p class="text-sm text-gray-600 mt-1">{{ 'USER.COMMISSION.SUBTITLE' | translate }}</p>
                    </div>

                    @if (wallet?.membership?.tier; as tier) {
                        <div class="bg-white border border-teal-200 rounded-xl px-4 py-3 text-center">
                            <p class="text-xs text-gray-500">{{ 'USER.COMMISSION.TIER_LABEL' | translate }}</p>
                            <p class="text-lg font-semibold text-teal-700">{{ tier.name }}</p>
                            <p class="text-xs text-gray-500">
                                {{ 'USER.COMMISSION.TIER_ACCUMULATED' | translate }}: {{ wallet?.membership?.accumulatedValue | appPrice }}
                            </p>
                            <a routerLink="/user/my-membership" class="text-xs font-medium text-teal-700 hover:underline">
                                {{ 'USER.COMMISSION.TIER_LINK' | translate }}
                            </a>
                        </div>
                    }
                </div>
            </section>

            @if (isLoading) {
                <app-loading></app-loading>
            } @else {
                <section class="grid gap-4 sm:grid-cols-3">
                    <div class="bg-white rounded-xl border border-gray-200 p-4">
                        <div class="flex items-start justify-between gap-2">
                            <p class="text-sm text-gray-500">{{ 'USER.COMMISSION.AVAILABLE' | translate }}</p>
                            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 text-teal-700">
                                <i class="fa-solid fa-wallet"></i>
                            </span>
                        </div>
                        <p class="text-2xl font-semibold text-gray-900 mt-2">{{ (wallet?.availableAmount ?? 0) | appPrice }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ 'USER.COMMISSION.AVAILABLE_HINT' | translate }}</p>
                    </div>

                    <div class="bg-white rounded-xl border border-gray-200 p-4">
                        <div class="flex items-start justify-between gap-2">
                            <p class="text-sm text-gray-500">{{ 'USER.COMMISSION.PENDING' | translate }}</p>
                            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-600">
                                <i class="fa-solid fa-hourglass-half"></i>
                            </span>
                        </div>
                        <p class="text-2xl font-semibold text-gray-900 mt-2">{{ (wallet?.pendingAmount ?? 0) | appPrice }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ 'USER.COMMISSION.PENDING_HINT' | translate }}</p>
                    </div>

                    <div class="bg-white rounded-xl border border-gray-200 p-4">
                        <div class="flex items-start justify-between gap-2">
                            <p class="text-sm text-gray-500">{{ 'USER.COMMISSION.PAID' | translate }}</p>
                            <span class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
                                <i class="fa-solid fa-circle-check"></i>
                            </span>
                        </div>
                        <p class="text-2xl font-semibold text-gray-900 mt-2">{{ (wallet?.paidAmount ?? 0) | appPrice }}</p>
                        <p class="text-xs text-gray-500 mt-1">{{ 'USER.COMMISSION.PAID_HINT' | translate }}</p>
                    </div>
                </section>

                <section class="bg-white rounded-xl border border-gray-200 p-5">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h2 class="text-base font-semibold text-gray-900">{{ roleTitleKey | translate }}</h2>
                        @if (config) {
                            <span class="px-2 py-0.5 rounded text-xs"
                                [class]="config.isPersonal ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'">
                                {{ (config.isPersonal ? 'USER.COMMISSION.BADGE_PERSONAL' : 'USER.COMMISSION.BADGE_GLOBAL') | translate }}
                            </span>
                        }
                    </div>

                    @if (!config) {
                        <p class="text-sm text-gray-500 mt-3">{{ 'USER.COMMISSION.EMPTY' | translate }}</p>
                    } @else {
                        <div class="flex flex-wrap items-end gap-6 mt-4">
                            <div>
                                <p class="text-xs text-gray-500">{{ 'USER.COMMISSION.RATE_LABEL' | translate }}</p>
                                @if (config.type === tiered) {
                                    <p class="text-2xl font-semibold text-gray-900">{{ 'COMMISSION.TIERS' | translate }}</p>
                                } @else if (config.type === fixed) {
                                    <p class="text-2xl font-semibold text-gray-900">{{ config.rate | appPrice }}</p>
                                } @else {
                                    <p class="text-2xl font-semibold text-gray-900">{{ config.rate }}%</p>
                                }
                                <p class="text-sm text-gray-500">{{ getCommissionTypeLabel(config.type) | translate }}</p>
                            </div>
                            @if (config.minOrderValue) {
                                <div>
                                    <p class="text-xs text-gray-500">{{ 'COMMISSION.MIN_ORDER' | translate }}</p>
                                    <p class="text-base font-medium text-gray-800">{{ config.minOrderValue | appPrice }}</p>
                                </div>
                            }
                            @if (config.maxCommission) {
                                <div>
                                    <p class="text-xs text-gray-500">{{ 'COMMISSION.MAX_COMMISSION' | translate }}</p>
                                    <p class="text-base font-medium text-gray-800">{{ config.maxCommission | appPrice }}</p>
                                </div>
                            }
                        </div>

                        @if (config.type === tiered && config.tiers.length > 0) {
                            <div class="mt-4 overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="text-left text-gray-500">
                                            <th class="py-1">{{ 'COMMISSION.TIER_FROM' | translate }}</th>
                                            <th class="py-1">{{ 'COMMISSION.TIER_TO' | translate }}</th>
                                            <th class="py-1">{{ 'COMMISSION.TIER_RATE' | translate }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (tier of config.tiers; track $index) {
                                            <tr class="border-t border-gray-100 text-gray-700">
                                                <td class="py-1.5">{{ tier.fromValue | appPrice }}</td>
                                                <td class="py-1.5">
                                                    {{ tier.toValue === null || tier.toValue === undefined
                                                        ? ('COMMISSION.TIER_NO_LIMIT' | translate)
                                                        : (tier.toValue | appPrice) }}
                                                </td>
                                                <td class="py-1.5 font-medium">{{ tier.rate }}%</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                                <p class="text-xs text-gray-500 mt-2">{{ 'USER.COMMISSION.TIER_HINT' | translate }}</p>
                            </div>
                        }

                        @if (config.note) {
                            <p class="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 mt-3">{{ config.note }}</p>
                        }
                        @if (!config.isActive) {
                            <p class="text-sm text-red-600 mt-2">{{ 'USER.COMMISSION.PAUSED' | translate }}</p>
                        }
                    }
                </section>

                <section class="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 class="text-base font-semibold text-gray-900">{{ 'USER.COMMISSION.HOW_TITLE' | translate }}</h2>
                    <p class="text-sm text-gray-600 mt-1">{{ 'USER.COMMISSION.HOW_SUBTITLE' | translate }}</p>

                    <ol class="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                        @for (step of steps; track step.key) {
                            <li class="bg-gray-50 rounded-xl border border-gray-100 p-4">
                                <span class="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-sm font-semibold text-white">{{ $index + 1 }}</span>
                                <p class="text-sm font-semibold text-gray-900 mt-3">{{ step.titleKey | translate }}</p>
                                <p class="text-xs text-gray-600 mt-1">{{ step.descriptionKey | translate }}</p>
                            </li>
                        }
                    </ol>
                </section>

                <section class="grid gap-4 lg:grid-cols-2">
                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <div class="flex items-center justify-between gap-2">
                            <h2 class="text-base font-semibold text-gray-900">{{ 'USER.COMMISSION.PERIOD_TITLE' | translate }}</h2>
                            @if (wallet?.currentPeriod; as period) {
                                <span class="px-2 py-0.5 rounded text-xs" [class]="periodStatusClass(period.status)">
                                    {{ periodStatusLabel(period.status) | translate }}
                                </span>
                            }
                        </div>

                        @if (wallet?.currentPeriod; as period) {
                            <dl class="space-y-2 text-sm mt-3">
                                <div class="flex justify-between gap-3">
                                    <dt class="text-gray-500">{{ 'USER.COMMISSION.PERIOD_LABEL' | translate }}</dt>
                                    <dd class="font-medium text-gray-800">{{ period.periodLabel }}</dd>
                                </div>
                                <div class="flex justify-between gap-3">
                                    <dt class="text-gray-500">{{ 'USER.COMMISSION.PERIOD_RANGE' | translate }}</dt>
                                    <dd class="text-gray-700">{{ period.fromDate | appDate: 'date' }} → {{ period.toDate | appDate: 'date' }}</dd>
                                </div>
                                <div class="flex justify-between gap-3">
                                    <dt class="text-gray-500">{{ 'USER.COMMISSION.PERIOD_PAYOUT_DATE' | translate }}</dt>
                                    <dd class="text-gray-700">
                                        {{ period.payoutDate ? (period.payoutDate | appDate: 'date') : ('USER.COMMISSION.PERIOD_PAYOUT_PENDING' | translate) }}
                                    </dd>
                                </div>
                                <div class="flex justify-between gap-3">
                                    <dt class="text-gray-500">{{ 'USER.COMMISSION.PERIOD_MY_TOTAL' | translate }}</dt>
                                    <dd class="font-medium text-gray-800">{{ myPeriodNet | appPrice }}</dd>
                                </div>
                            </dl>
                        } @else {
                            <p class="text-sm text-gray-500 mt-3">{{ 'USER.COMMISSION.PERIOD_EMPTY' | translate }}</p>
                        }

                        <p class="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-800 mt-3">{{ 'USER.COMMISSION.PERIOD_HINT' | translate }}</p>
                    </div>

                    <div class="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 class="text-base font-semibold text-gray-900">{{ 'USER.COMMISSION.EARLY_TITLE' | translate }}</h2>

                        <dl class="space-y-2 text-sm mt-3">
                            <div class="flex justify-between gap-3">
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.EARLY_FEE' | translate }}</dt>
                                <dd class="font-medium text-gray-800">{{ wallet?.earlyWithdrawalFeeRate ?? 0 }}%</dd>
                            </div>
                            <div class="flex justify-between gap-3">
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.EARLY_MIN' | translate }}</dt>
                                <dd class="text-gray-700">{{ wallet?.minWithdrawalAmount | appPrice }}</dd>
                            </div>
                            <div class="flex justify-between gap-3">
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.EARLY_LIMIT' | translate }}</dt>
                                <dd class="text-gray-700">
                                    @if (wallet?.monthlyLimit) {
                                        {{ wallet?.remainingLimit | appPrice }} / {{ wallet?.monthlyLimit | appPrice }}
                                    } @else {
                                        {{ 'USER.COMMISSION.EARLY_NO_LIMIT' | translate }}
                                    }
                                </dd>
                            </div>
                            <div class="flex justify-between gap-3">
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.EARLY_WITHDRAWN' | translate }}</dt>
                                <dd class="text-gray-700">{{ wallet?.withdrawnThisMonth | appPrice }}</dd>
                            </div>
                        </dl>

                        @if (!wallet?.isEarlyWithdrawalEnabled) {
                            <p class="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-800 mt-3">{{ 'USER.COMMISSION.EARLY_DISABLED' | translate }}</p>
                        } @else {
                            <p class="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 mt-3">{{ 'USER.COMMISSION.EARLY_HINT' | translate }}</p>
                        }
                    </div>
                </section>

                <section class="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 class="text-base font-semibold text-gray-900">{{ 'USER.COMMISSION.HISTORY_TITLE' | translate }}</h2>
                    <p class="text-sm text-gray-500 mt-1">{{ 'USER.COMMISSION.HISTORY_SUBTITLE' | translate }}</p>

                    @if (wallet?.recentPayouts?.length) {
                        <div class="overflow-x-auto mt-3">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="text-left text-gray-500">
                                        <th class="py-2">{{ 'USER.COMMISSION.COL_PERIOD' | translate }}</th>
                                        <th class="py-2">{{ 'USER.COMMISSION.COL_TYPE' | translate }}</th>
                                        <th class="py-2 text-right">{{ 'USER.COMMISSION.COL_ACCRUED' | translate }}</th>
                                        <th class="py-2 text-right">{{ 'USER.COMMISSION.COL_FEE' | translate }}</th>
                                        <th class="py-2 text-right">{{ 'USER.COMMISSION.COL_NET' | translate }}</th>
                                        <th class="py-2">{{ 'USER.COMMISSION.COL_STATUS' | translate }}</th>
                                        <th class="py-2">{{ 'USER.COMMISSION.COL_TIME' | translate }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @for (item of wallet?.recentPayouts; track item.id) {
                                        <tr class="border-t border-gray-100 text-gray-700">
                                            <td class="py-2 font-medium">{{ item.periodLabel || '—' }}</td>
                                            <td class="py-2">{{ getPayoutTypeLabel(item.type) | translate }}</td>
                                            <td class="py-2 text-right">{{ item.accruedAmount | appPrice }}</td>
                                            <td class="py-2 text-right">
                                                {{ item.feeAmount | appPrice }}
                                                @if (item.feeRate) {
                                                    <span class="text-xs text-gray-500">({{ item.feeRate }}%)</span>
                                                }
                                            </td>
                                            <td class="py-2 text-right font-semibold">{{ item.netAmount | appPrice }}</td>
                                            <td class="py-2">
                                                <span class="px-2 py-0.5 rounded text-xs" [class]="statusClass(item.status)">
                                                    {{ getPayoutStatusLabel(item.status) | translate }}
                                                </span>
                                            </td>
                                            <td class="py-2 text-xs text-gray-500">{{ (item.requestedAt || item.createdAt) | appDate }}</td>
                                        </tr>
                                    }
                                </tbody>
                            </table>
                        </div>
                    } @else {
                        <p class="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 mt-3">{{ 'USER.COMMISSION.HISTORY_EMPTY' | translate }}</p>
                    }
                </section>

                <section class="bg-white rounded-xl border border-gray-200 p-5">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h2 class="text-base font-semibold text-gray-900">{{ 'USER.COMMISSION.BANK_TITLE' | translate }}</h2>
                        @if (bankAccount && !isEditingBank) {
                            <span class="px-2 py-0.5 rounded text-xs"
                                [class]="bankAccount.isVerified ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'">
                                {{ (bankAccount.isVerified ? 'USER.COMMISSION.BANK_VERIFIED' : 'USER.COMMISSION.BANK_UNVERIFIED') | translate }}
                            </span>
                        }
                    </div>

                    @if (isEditingBank) {
                        <form [formGroup]="bankForm" (ngSubmit)="saveBankAccount()" class="mt-4 space-y-4">
                            <div class="grid gap-4 sm:grid-cols-2">
                                <app-ng-select-wrapper formControlName="bankName" [items]="bankOptions"
                                    [label]="'USER.COMMISSION.BANK_NAME' | translate"
                                    [placeholder]="'USER.COMMISSION.BANK_NAME_PLACEHOLDER' | translate"
                                    [required]="true" [searchable]="true" [id]="'bankAccountName'"
                                    [isInvalid]="isBankInvalid('bankName')"
                                    [errorMessage]="bankError('bankName')">
                                </app-ng-select-wrapper>

                                <app-input formControlName="branch" type="text" icon="fas fa-code-branch"
                                    [label]="'USER.COMMISSION.BANK_BRANCH' | translate"
                                    [placeholder]="'USER.COMMISSION.BANK_BRANCH_PLACEHOLDER' | translate">
                                </app-input>

                                <app-input formControlName="accountNumber" type="text" icon="fas fa-hashtag"
                                    [label]="'USER.COMMISSION.BANK_NUMBER' | translate"
                                    [placeholder]="'USER.COMMISSION.BANK_NUMBER_PLACEHOLDER' | translate"
                                    [required]="true"
                                    [isInvalid]="isBankInvalid('accountNumber')"
                                    [errorMessage]="bankError('accountNumber')">
                                </app-input>

                                <app-input formControlName="accountHolder" type="text" icon="fas fa-user"
                                    [label]="'USER.COMMISSION.BANK_HOLDER' | translate"
                                    [placeholder]="'USER.COMMISSION.BANK_HOLDER_PLACEHOLDER' | translate"
                                    [required]="true"
                                    [isInvalid]="isBankInvalid('accountHolder')"
                                    [errorMessage]="bankError('accountHolder')">
                                </app-input>
                            </div>

                            <p class="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-800">{{ 'USER.COMMISSION.BANK_EDIT_HINT' | translate }}</p>

                            <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <app-button type="button" variant="outline" (click)="cancelBankEdit()">
                                    {{ 'USER.COMMISSION.BANK_CANCEL' | translate }}
                                </app-button>
                                <app-button type="submit" variant="primary" [loading]="isSavingBank" [disabled]="isSavingBank">
                                    <i class="fas fa-floppy-disk mr-2"></i>{{ 'USER.COMMISSION.BANK_SAVE' | translate }}
                                </app-button>
                            </div>
                        </form>
                    } @else if (bankAccount) {
                        <dl class="grid gap-3 text-sm mt-3 sm:grid-cols-2">
                            <div>
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.BANK_NAME' | translate }}</dt>
                                <dd class="font-medium text-gray-800">{{ bankAccount.bankName }}</dd>
                            </div>
                            <div>
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.BANK_BRANCH' | translate }}</dt>
                                <dd class="text-gray-700">{{ bankAccount.branch || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.BANK_NUMBER' | translate }}</dt>
                                <dd class="font-medium text-gray-800">{{ bankAccount.accountNumber }}</dd>
                            </div>
                            <div>
                                <dt class="text-gray-500">{{ 'USER.COMMISSION.BANK_HOLDER' | translate }}</dt>
                                <dd class="text-gray-700">{{ bankAccount.accountHolder }}</dd>
                            </div>
                        </dl>
                        @if (!bankAccount.isVerified) {
                            <p class="bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-800 mt-3">{{ 'USER.COMMISSION.BANK_UNVERIFIED_HINT' | translate }}</p>

                            <!-- Chuyển khoản kèm đúng nội dung này để thông tin ngân hàng được đối chiếu và xác thực -->
                            @if (verificationCode) {
                                <div class="mt-3 rounded-lg border border-teal-200 bg-teal-50 p-3">
                                    <div class="flex flex-wrap items-center justify-between gap-2">
                                        <span class="text-xs font-medium text-teal-800">{{ 'USER.COMMISSION.BANK_CODE_TITLE' | translate }}</span>
                                        <span class="text-xs text-teal-700">{{ 'USER.COMMISSION.BANK_CODE_AMOUNT' | translate }}: {{ verificationCode.amount | appPrice }}</span>
                                    </div>

                                    <div class="mt-2 flex flex-wrap items-center gap-2">
                                        <code class="px-2 py-1 rounded bg-white border border-teal-200 font-mono text-sm text-teal-900">{{ verificationCode.transferContent }}</code>
                                        <app-button size="sm" variant="outline" (click)="copyTransferContent()">
                                            <i class="fa-regular fa-copy mr-1"></i>{{ 'USER.COMMISSION.BANK_CODE_COPY' | translate }}
                                        </app-button>
                                        <app-button size="sm" variant="outline" [loading]="isIssuingCode" (click)="issueVerificationCode()">
                                            <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'USER.COMMISSION.BANK_CODE_RENEW' | translate }}
                                        </app-button>
                                    </div>

                                    <p class="text-xs text-teal-800 mt-2">{{ 'USER.COMMISSION.BANK_CODE_HINT' | translate }}</p>

                                    <!-- QR chuyển khoản: quét bằng app ngân hàng là ra đúng tài khoản, số tiền và nội dung -->
                                    @if (verificationQr) {
                                        <div class="mt-3 flex flex-wrap items-center gap-3">
                                            <img [src]="verificationQr" alt="QR chuyển khoản xác thực tài khoản"
                                                class="w-40 h-40 rounded-lg border border-teal-200 bg-white p-1">
                                            <div class="text-xs text-teal-800 space-y-1">
                                                <div class="font-medium">{{ 'USER.COMMISSION.BANK_QR_TITLE' | translate }}</div>
                                                <div>{{ 'USER.COMMISSION.BANK_QR_HINT' | translate }}</div>
                                                <div>{{ 'USER.COMMISSION.BANK_QR_BANK' | translate }}: {{ bankAccount.bankName }}</div>
                                            </div>
                                        </div>
                                    }
                                    @if (verificationCode.expiresAt) {
                                        <p class="text-xs text-teal-700 mt-1">{{ 'USER.COMMISSION.BANK_CODE_EXPIRES' | translate }}: {{ verificationCode.expiresAt | appDate }}</p>
                                    }
                                </div>
                            } @else {
                                <div class="mt-3 flex flex-wrap items-center gap-2">
                                    <app-button size="sm" variant="primary" [loading]="isIssuingCode" (click)="issueVerificationCode()">
                                        <i class="fa-solid fa-key mr-1"></i>{{ 'USER.COMMISSION.BANK_CODE_CREATE' | translate }}
                                    </app-button>
                                    <span class="text-xs text-gray-500">{{ 'USER.COMMISSION.BANK_CODE_CREATE_HINT' | translate }}</span>
                                </div>
                            }
                        }
                        <div class="flex justify-end mt-4">
                            <app-button type="button" variant="outline" (click)="startBankEdit()">
                                <i class="fas fa-pen mr-2"></i>{{ 'USER.COMMISSION.BANK_UPDATE' | translate }}
                            </app-button>
                        </div>
                    } @else {
                        <p class="bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-800 mt-3">{{ 'USER.COMMISSION.BANK_EMPTY' | translate }}</p>
                        <div class="flex justify-end mt-4">
                            <app-button type="button" variant="primary" (click)="startBankEdit()">
                                <i class="fas fa-plus mr-2"></i>{{ 'USER.COMMISSION.BANK_ADD' | translate }}
                            </app-button>
                        </div>
                    }

                    <p class="text-xs text-gray-500 mt-3">{{ 'USER.COMMISSION.BANK_HINT' | translate }}</p>
                </section>

                <p class="text-xs text-gray-500">{{ 'USER.COMMISSION.HINT' | translate }}</p>
            }
        </div>
    `
})
export class MyCommissionPageComponent implements OnInit {
    wallet: MyWallet | null = null;
    bankAccount: BankAccount | null = null;
    config: CommissionConfig | null = null;
    isLoading = false;

    /** Form thông tin ngân hàng nhận tiền của thành viên. */
    readonly bankForm: FormGroup;
    isEditingBank = false;
    isSavingBank = false;

    /** Danh mục ngân hàng cho ô chọn (kèm mã BIN để dựng QR chuyển khoản). */
    readonly bankOptions = bankSelectOptions();

    /** Mã đối chiếu chuyển khoản để xác thực thông tin ngân hàng. */
    verificationCode: BankAccountVerificationCode | null = null;
    isIssuingCode = false;

    readonly tiered = CommissionType.Tiered;
    readonly fixed = CommissionType.Fixed;

    /** Bốn bước giải thích hoa hồng được ghi nhận và chi trả thế nào. */
    readonly steps = [
        { key: 'share', titleKey: 'USER.COMMISSION.STEP_SHARE_TITLE', descriptionKey: 'USER.COMMISSION.STEP_SHARE_DESC' },
        { key: 'event', titleKey: 'USER.COMMISSION.STEP_EVENT_TITLE', descriptionKey: 'USER.COMMISSION.STEP_EVENT_DESC' },
        { key: 'closing', titleKey: 'USER.COMMISSION.STEP_CLOSING_TITLE', descriptionKey: 'USER.COMMISSION.STEP_CLOSING_DESC' },
        { key: 'payout', titleKey: 'USER.COMMISSION.STEP_PAYOUT_TITLE', descriptionKey: 'USER.COMMISSION.STEP_PAYOUT_DESC' }
    ];

    constructor(
        private readonly _appService: AppService,
        private readonly _commissionService: CommissionService,
        private readonly _payoutService: PayoutService,
        private readonly _fb: FormBuilder
    ) {
        this.bankForm = this._fb.group({
            bankName: ['', [Validators.required, Validators.maxLength(200)]],
            branch: ['', [Validators.maxLength(200)]],
            accountNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{6,30}$/)]],
            accountHolder: ['', [Validators.required, Validators.maxLength(200)]]
        });
    }

    ngOnInit(): void {
        this.isLoading = true;

        // Ba nguồn dữ liệu độc lập: mức hoa hồng, ví hoa hồng và ngân hàng nhận tiền. Tài khoản chưa
        // được cấp quyền xem ngân hàng vẫn phải xem được phần còn lại nên lỗi từng nguồn bỏ qua riêng.
        forkJoin({
            commission: this._commissionService.getMine().pipe(catchError(() => of(null))),
            wallet: this._payoutService.getMyWallet().pipe(catchError(() => of(null))),
            bank: this._payoutService.getMyBankAccount().pipe(catchError(() => of(null)))
        }).subscribe({
            next: result => {
                const mine = result.commission?.data ?? null;
                const isPartner = toUserRole(this._appService.auth.getCurrentUser()?.role) === UserRole.Partner;
                this.config = (isPartner ? mine?.partner : mine?.referrer) ?? null;
                this.wallet = result.wallet?.data ?? null;
                this.bankAccount = result.bank?.data ?? null;
                // Còn mã đối chiếu nhưng chưa xác minh: nạp lại mã để hiện số tiền và hạn dùng.
                if (this.bankAccount && !this.bankAccount.isVerified && this.bankAccount.verificationCode) {
                    this.issueVerificationCode(false);
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Tiêu đề khối mức hoa hồng theo vai trò của tài khoản. */
    get roleTitleKey(): string {
        const isPartner = toUserRole(this._appService.auth.getCurrentUser()?.role) === UserRole.Partner;
        return isPartner ? 'USER.COMMISSION.PARTNER_TITLE' : 'USER.COMMISSION.REFERRER_TITLE';
    }

    /** Tổng thực nhận của tài khoản trong kỳ giải ngân đang mở. */
    get myPeriodNet(): number {
        const label = this.wallet?.currentPeriod?.periodLabel;
        if (!label) return 0;

        return (this.wallet?.recentPayouts ?? [])
            .filter(item => item.periodLabel === label)
            .reduce((total, item) => total + item.netAmount, 0);
    }

    /** Lớp hiển thị cho huy hiệu trạng thái chi trả. */
    statusClass(status: PayoutStatus): string {
        const classes: Record<PayoutStatus, string> = {
            [PayoutStatus.Pending]: 'bg-amber-50 text-amber-700',
            [PayoutStatus.Approved]: 'bg-blue-50 text-blue-700',
            [PayoutStatus.Rejected]: 'bg-red-50 text-red-700',
            [PayoutStatus.Paid]: 'bg-teal-50 text-teal-700',
            [PayoutStatus.Cancelled]: 'bg-gray-100 text-gray-600'
        };
        return classes[status] ?? 'bg-gray-100 text-gray-600';
    }

    /** Nhãn trạng thái kỳ giải ngân (khoá i18n). */
    periodStatusLabel(status: PayoutPeriodStatus): string {
        const labels: Record<PayoutPeriodStatus, string> = {
            [PayoutPeriodStatus.Open]: 'USER.COMMISSION.PERIOD_STATUS_OPEN',
            [PayoutPeriodStatus.Closed]: 'USER.COMMISSION.PERIOD_STATUS_CLOSED',
            [PayoutPeriodStatus.Paid]: 'USER.COMMISSION.PERIOD_STATUS_PAID'
        };
        return labels[status] ?? '';
    }

    /** Lớp hiển thị cho huy hiệu trạng thái kỳ giải ngân. */
    periodStatusClass(status: PayoutPeriodStatus): string {
        const classes: Record<PayoutPeriodStatus, string> = {
            [PayoutPeriodStatus.Open]: 'bg-blue-50 text-blue-700',
            [PayoutPeriodStatus.Closed]: 'bg-amber-50 text-amber-700',
            [PayoutPeriodStatus.Paid]: 'bg-teal-50 text-teal-700'
        };
        return classes[status] ?? 'bg-gray-100 text-gray-600';
    }

    /** Nhãn cách tính hoa hồng (key i18n). */
    getCommissionTypeLabel = getCommissionTypeLabel;

    /** Nhãn trạng thái và loại chi trả (key i18n). */
    getPayoutStatusLabel = getPayoutStatusLabel;
    getPayoutTypeLabel = getPayoutTypeLabel;

    /** Mở form nhập thông tin ngân hàng nhận tiền, điền sẵn dữ liệu đang có. */
    startBankEdit(): void {
        this.bankForm.reset({
            bankName: this.bankAccount?.bankName ?? '',
            branch: this.bankAccount?.branch ?? '',
            accountNumber: this.bankAccount?.accountNumber ?? '',
            accountHolder: this.bankAccount?.accountHolder ?? ''
        });
        this.isEditingBank = true;
    }

    /** Đóng form nhập mà không lưu. */
    cancelBankEdit(): void {
        this.isEditingBank = false;
    }

    /**
     * Lưu thông tin ngân hàng nhận tiền. Đổi số tài khoản thì API đặt lại trạng thái xác minh,
     * nên sau khi lưu phải nạp lại ví để huy hiệu xác minh hiển thị đúng.
     */
    saveBankAccount(): void {
        if (this.bankForm.invalid) {
            this.bankForm.markAllAsTouched();
            return;
        }

        const request = this.bankForm.getRawValue() as SaveBankAccountRequest;
        this.isSavingBank = true;

        this._payoutService.saveMyBankAccount(request).subscribe({
            next: response => {
                this.isSavingBank = false;
                this.isEditingBank = false;
                this.bankAccount = response.data ?? this.bankAccount;
                this.reloadWallet();
                this._appService.showSuccess(this._appService.trans('USER.COMMISSION.BANK_SAVED'));
            },
            error: error => {
                this.isSavingBank = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** QR chuyển khoản của tài khoản nhận tiền kèm nội dung xác thực; chưa nhận ra ngân hàng thì không hiện. */
    get verificationQr(): string | null {
        if (!this.bankAccount) return null;

        return buildAccountQr(
            this.bankAccount,
            this.verificationCode?.amount ?? 1000,
            this.verificationCode?.transferContent ?? this.bankAccount.verificationCode ?? null
        );
    }

    /** Tạo mã đối chiếu chuyển khoản để xác thực thông tin ngân hàng. */
    issueVerificationCode(notify = true): void {
        this.isIssuingCode = true;

        this._payoutService.issueMyBankAccountVerificationCode().subscribe({
            next: response => {
                this.isIssuingCode = false;
                this.verificationCode = response.data ?? null;
                if (notify) {
                    this._appService.showSuccess(this._appService.trans('USER.COMMISSION.BANK_CODE_ISSUED'));
                }
            },
            error: error => {
                this.isIssuingCode = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Chép nội dung chuyển khoản để dán vào ứng dụng ngân hàng. */
    copyTransferContent(): void {
        const content = this.verificationCode?.transferContent;
        if (!content) return;

        navigator.clipboard?.writeText(content)
            .then(() => this._appService.showSuccess(this._appService.trans('USER.COMMISSION.BANK_CODE_COPIED')))
            .catch(() => this._appService.showError(this._appService.trans('COMMON.ERROR.UNKNOWN')));
    }

    /** Ô nhập ngân hàng đang lỗi và người dùng đã chạm vào. */
    isBankInvalid(field: string): boolean {
        const control = this.bankForm.get(field);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    /** Thông báo lỗi của ô nhập ngân hàng (đã dịch). */
    bankError(field: string): string {
        const control = this.bankForm.get(field);
        if (!control || !control.errors) return '';
        if (control.errors['pattern']) return this._appService.trans('USER.COMMISSION.BANK_ERROR_NUMBER');
        return this._appService.trans('USER.COMMISSION.BANK_ERROR_REQUIRED');
    }

    /** Nạp lại ví hoa hồng (trạng thái ngân hàng có thể đổi sau khi lưu). */
    private reloadWallet(): void {
        this._payoutService.getMyWallet().subscribe({
            next: response => { this.wallet = response.data ?? this.wallet; },
            error: () => { }
        });
    }
}
