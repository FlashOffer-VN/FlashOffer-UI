// src/app/pages/profile/profile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { ChangeCredentialsFormComponent } from '@shared/components/change-credentials-form/change-credentials-form.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, TranslateModule, ChangeCredentialsFormComponent],
    template: `
        <div class="space-y-6">
            <section class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div class="bg-gradient-to-r from-secondary to-primary px-6 py-8 text-white sm:px-10">
                    <div class="flex items-center gap-4">
                        <div class="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
                            {{ user?.fullName?.charAt(0) || user?.username?.charAt(0) || '?' | uppercase }}
                        </div>
                        <div class="min-w-0">
                            <h1 class="text-2xl font-bold">{{ 'USER.WELCOME_TITLE' | translate }}</h1>
                            <p class="mt-1 break-words text-sm text-cyan-50">{{ 'USER.WELCOME_DESCRIPTION' | translate }}</p>
                        </div>
                    </div>
                </div>

                <div class="grid gap-4 p-6 sm:grid-cols-2">
                    <div class="rounded-xl bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.USERNAME' | translate }}</p>
                        <p class="mt-1 font-semibold text-slate-800">{{ user?.username || '--' }}</p>
                    </div>
                    <div class="rounded-xl bg-slate-50 p-4">
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ 'USER.EMAIL' | translate }}</p>
                        <p class="mt-1 break-words font-semibold text-slate-800">{{ user?.email || '--' }}</p>
                    </div>
                </div>
            </section>

            <!-- Đổi tên đăng nhập + mật khẩu -->
            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div class="mb-5">
                    <h2 class="text-lg font-semibold text-slate-800">
                        {{ 'CHANGE_CREDENTIALS.SECTION_TITLE' | translate }}
                    </h2>
                    <p class="mt-1 text-sm text-slate-500">
                        {{ 'CHANGE_CREDENTIALS.SECTION_DESCRIPTION' | translate }}
                    </p>
                </div>

                <app-change-credentials-form (changed)="onCredentialsChanged()"></app-change-credentials-form>
            </section>

            <div class="rounded-2xl border border-dashed border-cyan-200 bg-cyan-50 p-5 text-center text-cyan-900">
                <i class="fas fa-rocket mb-3 text-2xl text-primary"></i>
                <p class="font-medium">{{ 'USER.COMING_SOON' | translate }}</p>
            </div>
        </div>
    `,
})
export class ProfileComponent {
    user: ReturnType<AppService['getCurrentUser']>;

    constructor(private readonly appService: AppService) {
        this.user = this.appService.getCurrentUser();
    }

    onCredentialsChanged(): void {
        // Tên đăng nhập hiển thị lại lấy từ user đã cập nhật sau khi đổi
        this.user = this.appService.getCurrentUser();
    }
}
