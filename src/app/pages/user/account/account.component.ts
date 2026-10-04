import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { User } from '@core/models/auth.model';
import { Permission } from '@core/models/permission.model';

import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { UserRoleLabelPipe } from '@shared/pipes/user-role-label.pipe';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ChangeCredentialsFormComponent } from '@shared/components/change-credentials-form/change-credentials-form.component';

/** Họ tên bắt buộc; SĐT điền thì phải đúng dạng số Việt Nam; email điền thì phải có dạng email. */
@Component({
    selector: 'app-account-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        TranslateModule,
        AppDatePipe,
        UserRoleLabelPipe,
        InputComponent,
        ButtonComponent,
        LoadingComponent,
        ChangeCredentialsFormComponent
    ],
    template: `
        <div class="space-y-5">
            <header>
                <h1 class="text-xl font-semibold text-gray-900">{{ 'USER.ACCOUNT.TITLE' | translate }}</h1>
                <p class="mt-1 text-sm text-gray-500">{{ 'USER.ACCOUNT.SUBTITLE' | translate }}</p>
            </header>

            @if (user?.mustChangeCredentials) {
                <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <i class="fa-solid fa-triangle-exclamation mr-1"></i>{{ 'USER.ACCOUNT.MUST_CHANGE' | translate }}
                </div>
            }

            <div class="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <!-- Thông tin cá nhân -->
                <section class="panel">
                    <h2 class="panel__title">{{ 'USER.ACCOUNT.INFO_TITLE' | translate }}</h2>
                    <p class="panel__desc">{{ 'USER.ACCOUNT.INFO_DESC' | translate }}</p>

                    @if (isLoading) {
                        <app-loading></app-loading>
                    } @else {
                        <form [formGroup]="profileForm" (ngSubmit)="save()" class="grid gap-4 sm:grid-cols-2">
                            <app-input formControlName="fullName" [id]="'account_full_name'"
                                [label]="'USER.ACCOUNT.FULL_NAME' | translate"
                                [placeholder]="'USER.ACCOUNT.FULL_NAME_PLACEHOLDER' | translate"></app-input>

                            <app-input formControlName="phone" [id]="'account_phone'" [type]="'tel'"
                                [label]="'USER.ACCOUNT.PHONE' | translate"
                                [hint]="'USER.ACCOUNT.PHONE_HINT' | translate"
                                [placeholder]="'USER.ACCOUNT.PHONE_PLACEHOLDER' | translate"></app-input>

                            <app-input formControlName="email" [id]="'account_email'" [type]="'email'"
                                [label]="'USER.ACCOUNT.EMAIL' | translate"
                                [placeholder]="'USER.ACCOUNT.EMAIL_PLACEHOLDER' | translate"></app-input>

                            <app-input formControlName="zalo" [id]="'account_zalo'"
                                [label]="'USER.ACCOUNT.ZALO' | translate"
                                [hint]="'USER.ACCOUNT.ZALO_HINT' | translate"
                                [placeholder]="'USER.ACCOUNT.ZALO_PLACEHOLDER' | translate"></app-input>
                        </form>

                        <div class="mt-4 flex justify-end">
                            <app-button variant="primary" [loading]="isSaving" (click)="save()">
                                <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'COMMON.BUTTON.SAVE' | translate }}
                            </app-button>
                        </div>
                    }
                </section>

                <!-- Thông tin tài khoản -->
                <aside class="panel">
                    <h2 class="panel__title">{{ 'USER.ACCOUNT.ACCOUNT_TITLE' | translate }}</h2>
                    <dl class="info">
                        <div>
                            <dt>{{ 'USER.ACCOUNT.USERNAME' | translate }}</dt>
                            <dd>{{ user?.username || '--' }}</dd>
                        </div>
                        @if (user?.userCode) {
                            <div>
                                <dt>{{ 'USER.ACCOUNT.USER_CODE' | translate }}</dt>
                                <dd>{{ user?.userCode }}</dd>
                            </div>
                        }
                        <div>
                            <dt>{{ 'USER.ACCOUNT.ROLE' | translate }}</dt>
                            <dd>{{ user?.role | userRoleLabel }}</dd>
                        </div>
                        @if (membershipTierName) {
                            <div>
                                <dt>{{ 'USER.MEMBERSHIP.CURRENT_TIER' | translate }}</dt>
                                <dd>{{ membershipTierName }}</dd>
                            </div>
                        }
                        @if (user?.lastLoginAt) {
                            <div>
                                <dt>{{ 'USER.ACCOUNT.LAST_LOGIN' | translate }}</dt>
                                <dd>{{ user?.lastLoginAt | appDate:'datetime' }}</dd>
                            </div>
                        }
                    </dl>

                    <a routerLink="/user/my-membership" class="panel__link">
                        <i class="fa-solid fa-crown"></i>{{ 'USER.MEMBERSHIP.TITLE' | translate }}
                        <i class="fa-solid fa-chevron-right"></i>
                    </a>
                </aside>
            </div>

            <!-- Đổi tên đăng nhập + mật khẩu -->
            <section class="panel">
                <h2 class="panel__title">{{ 'USER.ACCOUNT.SECURITY_TITLE' | translate }}</h2>
                <p class="panel__desc">{{ 'USER.ACCOUNT.SECURITY_DESC' | translate }}</p>
                <app-change-credentials-form (changed)="onCredentialsChanged()"></app-change-credentials-form>
            </section>
        </div>
    `,
    styles: [`
        :host { display: block; }

        .panel { padding: 1.25rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--white); box-shadow: 0 1px 2px rgba(15, 23, 42, .04); }
        .panel__title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text-heading); }
        .panel__desc { margin: .35rem 0 1rem; font-size: .8125rem; color: var(--text-muted); }

        .info { display: flex; flex-direction: column; gap: .75rem; margin: 1rem 0 0; }
        .info dt { font-size: .75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .04em; }
        .info dd { margin: .125rem 0 0; font-size: .9375rem; font-weight: 600; color: var(--text-heading); word-break: break-word; }

        .panel__link {
            display: flex; align-items: center; gap: .5rem; margin-top: 1.25rem; padding: .625rem .75rem;
            border: 1px solid var(--accent-border); border-radius: .75rem; background: var(--accent-bg);
            color: var(--primary-dark); font-size: .875rem; font-weight: 600; text-decoration: none;
        }
        .panel__link i:last-child { margin-left: auto; font-size: .75rem; }
    `]
})
export class AccountPageComponent implements OnInit {
    user: User | null = null;
    membershipTierName = '';
    isLoading = false;
    isSaving = false;

    /** Thông tin cá nhân người dùng tự sửa; SĐT và email điền thì phải đúng dạng. */
    profileForm: FormGroup;

    constructor(
        private readonly _appService: AppService,
        private readonly _formBuilder: FormBuilder
    ) {
        this.profileForm = this._formBuilder.group({
            fullName: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.pattern(/^0\d{9,10}$/)]],
            email: ['', [Validators.email]],
            zalo: ['']
        });
    }

    ngOnInit(): void {
        this.user = this._appService.auth.getCurrentUser();
        this.resetForm(this.user);
        this.loadProfile();

        // Hạng thành viên nằm sau quyền xem hoa hồng nên chỉ gọi khi tài khoản có quyền.
        if (this._appService.permissionService.has(Permission.ViewMyCommission)) {
            this.loadMembershipTier();
        }
    }

    save(): void {
        if (this.isSaving) return;

        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            this._appService.showError(this._appService.trans('USER.ACCOUNT.ERROR_INVALID'));
            return;
        }

        const value = this.profileForm.getRawValue();
        this.isSaving = true;
        this._appService.auth.updateMe({
            fullName: (value.fullName ?? '').trim(),
            phone: (value.phone ?? '').trim(),
            email: (value.email ?? '').trim(),
            zalo: (value.zalo ?? '').trim()
        }).subscribe({
            next: response => {
                this.isSaving = false;
                this.user = response.data ?? this.user;
                this.resetForm(this.user);
                this._appService.showSuccess(this._appService.trans('USER.ACCOUNT.SAVE_SUCCESS'));
            },
            error: error => {
                this.isSaving = false;
                this._appService.showError(
                    this._appService.auth.extractErrorMessage(error) || this._appService.trans('USER.ACCOUNT.SAVE_FAILED'));
            }
        });
    }

    onCredentialsChanged(): void {
        this.user = this._appService.auth.getCurrentUser();
    }

    /** Nạp thông tin đầy đủ từ API (SĐT/Zalo/mã tài khoản không có trong dữ liệu đăng nhập). */
    private loadProfile(): void {
        this.isLoading = true;
        this._appService.auth.getMe().subscribe({
            next: response => {
                this.user = response.data ?? this.user;
                this.resetForm(this.user);
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.resetForm(this.user);
            }
        });
    }

    private loadMembershipTier(): void {
        this._appService.membershipService.getMine().subscribe({
            next: response => this.membershipTierName = response.data?.tier?.name ?? '',
            error: () => this.membershipTierName = ''
        });
    }

    private resetForm(user: User | null): void {
        this.profileForm.reset({
            fullName: user?.fullName ?? '',
            phone: user?.phone ?? '',
            email: user?.email ?? '',
            zalo: user?.zalo ?? ''
        });
    }
}
