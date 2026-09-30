// src/app/pages/user/my-referral/my-referral.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { buildReferralShareUrl, copyToClipboard } from '@core/utils/share-link';

import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

/** Mã chia sẻ của tài khoản đang đăng nhập (khu vực thành viên) */
@Component({
    selector: 'app-my-referral',
    standalone: true,
    imports: [CommonModule, TranslateModule, ButtonComponent, LoadingComponent],
    template: `
        <div class="space-y-6">
            <section class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div class="bg-gradient-to-r from-secondary to-primary px-6 py-8 text-white sm:px-10">
                    <h1 class="text-2xl font-bold">{{ 'USER.MY_REFERRAL.TITLE' | translate }}</h1>
                    <p class="mt-1 max-w-2xl text-sm text-cyan-50">{{ 'USER.MY_REFERRAL.DESCRIPTION' | translate }}</p>
                </div>

                <div *ngIf="isLoading" class="flex justify-center py-12">
                    <app-loading></app-loading>
                </div>

                <div *ngIf="!isLoading && !referralCode" class="px-6 py-12 text-center text-slate-500">
                    <i class="fa-solid fa-share-nodes mb-3 text-3xl text-slate-300"></i>
                    <p class="font-medium">{{ 'USER.MY_REFERRAL.EMPTY' | translate }}</p>
                </div>

                <div *ngIf="!isLoading && referralCode" class="grid gap-5 p-6 sm:grid-cols-2">
                    <div class="flex flex-col rounded-xl bg-slate-50 p-5">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {{ 'USER.MY_REFERRAL.CODE_LABEL' | translate }}
                        </p>
                        <p class="mt-2 break-all font-mono text-2xl font-bold text-primary">{{ referralCode }}</p>
                        <p class="mt-2 flex-1 text-xs text-slate-500">{{ 'USER.MY_REFERRAL.CODE_HINT' | translate }}</p>
                        <div class="mt-4">
                            <app-button variant="primary" size="sm" (onClick)="onCopyCode()">
                                <i class="fa-regular fa-copy mr-2"></i>{{ 'USER.MY_REFERRAL.COPY_CODE' | translate }}
                            </app-button>
                        </div>
                    </div>

                    <div class="flex flex-col rounded-xl bg-slate-50 p-5">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {{ 'USER.MY_REFERRAL.LINK_LABEL' | translate }}
                        </p>
                        <p class="mt-2 break-all text-sm font-semibold text-slate-700">{{ shareLink }}</p>
                        <p class="mt-2 flex-1 text-xs text-slate-500">{{ 'USER.MY_REFERRAL.LINK_HINT' | translate }}</p>
                        <div class="mt-4">
                            <app-button variant="primary" size="sm" (onClick)="onCopyLink()">
                                <i class="fa-solid fa-link mr-2"></i>{{ 'USER.MY_REFERRAL.COPY_LINK' | translate }}
                            </app-button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <h2 class="text-lg font-semibold text-slate-800">{{ 'USER.MY_REFERRAL.USED_TITLE' | translate }}</h2>
                <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_REFERRAL.USED_DESCRIPTION' | translate }}</p>

                <ul class="mt-4 space-y-3 text-sm text-slate-600">
                    <li *ngFor="let key of usedFlows" class="flex gap-3">
                        <i class="fa-solid fa-circle-check mt-0.5 text-primary"></i>
                        <span>{{ key | translate }}</span>
                    </li>
                </ul>
            </section>
        </div>
    `,
})
export class MyReferralPageComponent implements OnInit {
    referralCode: string | null = null;
    shareLink = '';
    isLoading = true;

    /** Các luồng ghi nhận mã chia sẻ (cột ReferralCode ở các bảng nghiệp vụ) */
    readonly usedFlows: string[] = [
        'USER.MY_REFERRAL.USED_GROUP_BUYING_CREATE',
        'USER.MY_REFERRAL.USED_GROUP_BUYING_JOIN',
        'USER.MY_REFERRAL.USED_PURCHASE_REQUEST',
        'USER.MY_REFERRAL.USED_OFFER_REQUEST',
        'USER.MY_REFERRAL.USED_GROUP_POST'
    ];

    constructor(private readonly _appService: AppService) { }

    ngOnInit(): void {
        this._appService.collaboratorService.getMyReferralCode().subscribe({
            next: (code) => {
                this.referralCode = code;
                this.shareLink = buildReferralShareUrl(code);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    onCopyCode(): void {
        this.copy(this.referralCode, 'USER.MY_REFERRAL.COPY_CODE_SUCCESS');
    }

    onCopyLink(): void {
        this.copy(this.shareLink, 'USER.MY_REFERRAL.COPY_LINK_SUCCESS');
    }

    private copy(value: string | null, successKey: string): void {
        if (!value) return;

        copyToClipboard(value).then(() => this._appService.showSuccess(this._appService.trans(successKey)));
    }
}
