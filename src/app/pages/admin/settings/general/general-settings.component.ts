import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { SystemSettingService } from '@core/services/system-setting.service';
import { Permission } from '@core/models/permission.model';
import { SaveSystemSettingRequest, SystemSetting } from '@core/models/system-setting.model';

import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

/**
 * Cài đặt chung của hệ thống: thông tin nền tảng, ngôn ngữ — định dạng, chính sách đăng ký — tài khoản,
 * giới hạn tệp — nội dung và thiết lập thông báo. Chỉ tài khoản có quyền sửa cài đặt mới lưu được.
 */
@Component({
    selector: 'app-admin-general-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, InputComponent, ButtonComponent, LoadingComponent],
    template: `
        @if (isLoading) {
            <div class="py-10"><app-loading></app-loading></div>
        } @else {
            <form [formGroup]="form" (ngSubmit)="save()" class="space-y-5">
                <!-- Thông tin nền tảng -->
                <div class="card">
                    <h2>{{ 'ADMIN.SETTINGS.SECTION_PLATFORM' | translate }}</h2>
                    <p class="card-desc">{{ 'ADMIN.SETTINGS.SECTION_PLATFORM_DESC' | translate }}</p>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <app-input formControlName="systemName" type="text" icon="fas fa-shop"
                            [label]="'ADMIN.SETTINGS.FIELD_SYSTEM_NAME' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_SYSTEM_NAME_PLACEHOLDER' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('systemName')" [errorMessage]="errorOf('systemName')">
                        </app-input>

                        <app-input formControlName="supportPhone" type="text" icon="fas fa-phone"
                            [label]="'ADMIN.SETTINGS.FIELD_SUPPORT_PHONE' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_SUPPORT_PHONE_PLACEHOLDER' | translate">
                        </app-input>

                        <app-input formControlName="supportEmail" type="text" icon="fas fa-envelope"
                            [label]="'ADMIN.SETTINGS.FIELD_SUPPORT_EMAIL' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_SUPPORT_EMAIL_PLACEHOLDER' | translate"
                            [isInvalid]="isInvalid('supportEmail')" [errorMessage]="errorOf('supportEmail')">
                        </app-input>

                        <app-input formControlName="workingHours" type="text" icon="fas fa-clock"
                            [label]="'ADMIN.SETTINGS.FIELD_WORKING_HOURS' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_WORKING_HOURS_PLACEHOLDER' | translate">
                        </app-input>

                        <app-input formControlName="address" type="text" icon="fas fa-location-dot"
                            [label]="'ADMIN.SETTINGS.FIELD_ADDRESS' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_ADDRESS_PLACEHOLDER' | translate">
                        </app-input>

                        <app-input formControlName="copyrightText" type="text" icon="fas fa-copyright"
                            [label]="'ADMIN.SETTINGS.FIELD_COPYRIGHT' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_COPYRIGHT_PLACEHOLDER' | translate">
                        </app-input>

                        <app-input formControlName="facebookUrl" type="text" icon="fab fa-facebook"
                            [label]="'ADMIN.SETTINGS.FIELD_FACEBOOK' | translate"
                            [isInvalid]="isInvalid('facebookUrl')" [errorMessage]="errorOf('facebookUrl')">
                        </app-input>

                        <app-input formControlName="youtubeUrl" type="text" icon="fab fa-youtube"
                            [label]="'ADMIN.SETTINGS.FIELD_YOUTUBE' | translate"
                            [isInvalid]="isInvalid('youtubeUrl')" [errorMessage]="errorOf('youtubeUrl')">
                        </app-input>

                        <app-input formControlName="zaloUrl" type="text" icon="fas fa-comment-dots"
                            [label]="'ADMIN.SETTINGS.FIELD_ZALO' | translate"
                            [isInvalid]="isInvalid('zaloUrl')" [errorMessage]="errorOf('zaloUrl')">
                        </app-input>
                    </div>
                </div>

                <!-- Ngôn ngữ & định dạng -->
                <div class="card">
                    <h2>{{ 'ADMIN.SETTINGS.SECTION_FORMAT' | translate }}</h2>
                    <p class="card-desc">{{ 'ADMIN.SETTINGS.SECTION_FORMAT_DESC' | translate }}</p>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <div>
                            <span class="field-label">{{ 'ADMIN.SETTINGS.FIELD_DEFAULT_LANGUAGE' | translate }}</span>
                            <div class="flex gap-5 mt-2">
                                @for (option of languages; track option.value) {
                                    <label class="flex items-center gap-2 text-sm text-gray-700">
                                        <input type="radio" formControlName="defaultLanguage" [value]="option.value"
                                            class="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500">
                                        <span>{{ option.label }}</span>
                                    </label>
                                }
                            </div>
                        </div>

                        <app-input formControlName="timeZone" type="text" icon="fas fa-globe"
                            [label]="'ADMIN.SETTINGS.FIELD_TIME_ZONE' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_TIME_ZONE_PLACEHOLDER' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('timeZone')" [errorMessage]="errorOf('timeZone')">
                        </app-input>

                        <app-input formControlName="currencySymbol" type="text" icon="fas fa-dollar-sign"
                            [label]="'ADMIN.SETTINGS.FIELD_CURRENCY_SYMBOL' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_CURRENCY_SYMBOL_PLACEHOLDER' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('currencySymbol')" [errorMessage]="errorOf('currencySymbol')">
                        </app-input>

                        <app-input formControlName="dateFormat" type="text" icon="fas fa-calendar-day"
                            [label]="'ADMIN.SETTINGS.FIELD_DATE_FORMAT' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_DATE_FORMAT_PLACEHOLDER' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_DATE_FORMAT_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('dateFormat')" [errorMessage]="errorOf('dateFormat')">
                        </app-input>
                    </div>
                </div>

                <!-- Đăng ký & tài khoản -->
                <div class="card">
                    <h2>{{ 'ADMIN.SETTINGS.SECTION_ACCOUNT' | translate }}</h2>
                    <p class="card-desc">{{ 'ADMIN.SETTINGS.SECTION_ACCOUNT_DESC' | translate }}</p>

                    <div class="space-y-3 mb-4">
                        <label class="flex items-center gap-3 text-sm text-gray-700">
                            <input type="checkbox" formControlName="allowRegistration"
                                class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                            <span>{{ 'ADMIN.SETTINGS.FIELD_ALLOW_REGISTRATION' | translate }}</span>
                        </label>

                        <label class="flex items-center gap-3 text-sm text-gray-700">
                            <input type="checkbox" formControlName="requireEmailVerification"
                                class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                            <span>{{ 'ADMIN.SETTINGS.FIELD_REQUIRE_EMAIL_VERIFICATION' | translate }}</span>
                        </label>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <app-input formControlName="minPasswordLength" type="number" icon="fas fa-key"
                            [label]="'ADMIN.SETTINGS.FIELD_MIN_PASSWORD_LENGTH' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_MIN_PASSWORD_LENGTH_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('minPasswordLength')" [errorMessage]="errorOf('minPasswordLength')">
                        </app-input>

                        <app-input formControlName="maxFailedLoginAttempts" type="number" icon="fas fa-triangle-exclamation"
                            [label]="'ADMIN.SETTINGS.FIELD_MAX_FAILED_LOGIN_ATTEMPTS' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('maxFailedLoginAttempts')" [errorMessage]="errorOf('maxFailedLoginAttempts')">
                        </app-input>

                        <app-input formControlName="accessTokenMinutes" type="number" icon="fas fa-hourglass-half"
                            [label]="'ADMIN.SETTINGS.FIELD_ACCESS_TOKEN_MINUTES' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_ACCESS_TOKEN_MINUTES_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('accessTokenMinutes')" [errorMessage]="errorOf('accessTokenMinutes')">
                        </app-input>

                        <app-input formControlName="refreshTokenDays" type="number" icon="fas fa-rotate"
                            [label]="'ADMIN.SETTINGS.FIELD_REFRESH_TOKEN_DAYS' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('refreshTokenDays')" [errorMessage]="errorOf('refreshTokenDays')">
                        </app-input>

                        <app-input formControlName="lockoutMinutes" type="number" icon="fas fa-lock"
                            [label]="'ADMIN.SETTINGS.FIELD_LOCKOUT_MINUTES' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_LOCKOUT_MINUTES_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('lockoutMinutes')" [errorMessage]="errorOf('lockoutMinutes')">
                        </app-input>

                        <app-input formControlName="referralCodePrefix" type="text" icon="fas fa-tag"
                            [label]="'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_PREFIX' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_PREFIX_PLACEHOLDER' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('referralCodePrefix')" [errorMessage]="errorOf('referralCodePrefix')">
                        </app-input>

                        <app-input formControlName="referralCodeLength" type="number" icon="fas fa-hashtag"
                            [label]="'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_LENGTH' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_LENGTH_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('referralCodeLength')" [errorMessage]="errorOf('referralCodeLength')">
                        </app-input>

                        <app-input formControlName="commissionAttributionDays" type="number" icon="fas fa-handshake"
                            [label]="'ADMIN.SETTINGS.FIELD_ATTRIBUTION_DAYS' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_ATTRIBUTION_DAYS_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('commissionAttributionDays')" [errorMessage]="errorOf('commissionAttributionDays')">
                        </app-input>
                    </div>
                </div>

                <!-- Tệp, nội dung & thông báo -->
                <div class="card">
                    <h2>{{ 'ADMIN.SETTINGS.SECTION_CONTENT' | translate }}</h2>
                    <p class="card-desc">{{ 'ADMIN.SETTINGS.SECTION_CONTENT_DESC' | translate }}</p>

                    <div class="space-y-3 mb-4">
                        <label class="flex items-center gap-3 text-sm text-gray-700">
                            <input type="checkbox" formControlName="requirePostApproval"
                                class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                            <span>{{ 'ADMIN.SETTINGS.FIELD_REQUIRE_POST_APPROVAL' | translate }}</span>
                        </label>

                        <label class="flex items-center gap-3 text-sm text-gray-700">
                            <input type="checkbox" formControlName="requireGroupApproval"
                                class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                            <span>{{ 'ADMIN.SETTINGS.FIELD_REQUIRE_GROUP_APPROVAL' | translate }}</span>
                        </label>

                        <label class="flex items-center gap-3 text-sm text-gray-700">
                            <input type="checkbox" formControlName="enableEmailNotification"
                                class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                            <span>{{ 'ADMIN.SETTINGS.FIELD_ENABLE_EMAIL_NOTIFICATION' | translate }}</span>
                        </label>
                    </div>

                    <div class="grid gap-4 sm:grid-cols-2">
                        <app-input formControlName="maxUploadSizeMb" type="number" icon="fas fa-upload"
                            [label]="'ADMIN.SETTINGS.FIELD_MAX_UPLOAD_SIZE' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_MAX_UPLOAD_SIZE_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('maxUploadSizeMb')" [errorMessage]="errorOf('maxUploadSizeMb')">
                        </app-input>

                        <app-input formControlName="maxImagesPerPost" type="number" icon="fas fa-images"
                            [label]="'ADMIN.SETTINGS.FIELD_MAX_IMAGES_PER_POST' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('maxImagesPerPost')" [errorMessage]="errorOf('maxImagesPerPost')">
                        </app-input>

                        <app-input formControlName="allowedImageExtensions" type="text" icon="fas fa-file-image"
                            [label]="'ADMIN.SETTINGS.FIELD_IMAGE_EXTENSIONS' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_IMAGE_EXTENSIONS_PLACEHOLDER' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_EXTENSIONS_HINT' | translate">
                        </app-input>

                        <app-input formControlName="allowedDocumentExtensions" type="text" icon="fas fa-file-pdf"
                            [label]="'ADMIN.SETTINGS.FIELD_DOCUMENT_EXTENSIONS' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_DOCUMENT_EXTENSIONS_PLACEHOLDER' | translate">
                        </app-input>

                        <app-input formControlName="auditLogRetentionDays" type="number" icon="fas fa-clipboard-list"
                            [label]="'ADMIN.SETTINGS.FIELD_AUDIT_RETENTION' | translate"
                            [hint]="'ADMIN.SETTINGS.FIELD_AUDIT_RETENTION_HINT' | translate"
                            [required]="true"
                            [isInvalid]="isInvalid('auditLogRetentionDays')" [errorMessage]="errorOf('auditLogRetentionDays')">
                        </app-input>

                        <app-input formControlName="notificationSenderName" type="text" icon="fas fa-paper-plane"
                            [label]="'ADMIN.SETTINGS.FIELD_NOTIFICATION_SENDER_NAME' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_NOTIFICATION_SENDER_NAME_PLACEHOLDER' | translate">
                        </app-input>

                        <app-input formControlName="notificationReplyTo" type="text" icon="fas fa-reply"
                            [label]="'ADMIN.SETTINGS.FIELD_NOTIFICATION_REPLY_TO' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_NOTIFICATION_REPLY_TO_PLACEHOLDER' | translate"
                            [isInvalid]="isInvalid('notificationReplyTo')" [errorMessage]="errorOf('notificationReplyTo')">
                        </app-input>

                        <app-input formControlName="note" type="text" icon="fas fa-note-sticky"
                            [label]="'ADMIN.SETTINGS.FIELD_NOTE' | translate"
                            [placeholder]="'ADMIN.SETTINGS.FIELD_NOTE_PLACEHOLDER' | translate">
                        </app-input>
                    </div>
                </div>

                <!-- Lưu -->
                <div class="flex flex-wrap items-center justify-between gap-3">
                    <span class="text-xs text-gray-500">
                        @if (updatedAt) {
                            {{ 'ADMIN.SETTINGS.UPDATED_AT' | translate }}: {{ updatedAt | date:'dd/MM/yyyy HH:mm' }}
                            @if (updatedBy) { · {{ updatedBy }} }
                        } @else {
                            {{ 'ADMIN.SETTINGS.NEVER_UPDATED' | translate }}
                        }
                    </span>

                    @if (canUpdate) {
                        <app-button type="submit" variant="primary" [loading]="isSaving" [disabled]="isSaving">
                            <i class="fas fa-floppy-disk mr-2"></i>{{ 'ADMIN.SETTINGS.SAVE' | translate }}
                        </app-button>
                    }
                </div>
            </form>
        }
    `,
    styles: [`
        :host { display: block; }

        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.25rem; }
        .card + .card { margin-top: 1.25rem; }
        .card h2 { margin: 0; font-size: 1rem; font-weight: 600; color: #111827; }
        .card-desc { margin: 0.25rem 0 1rem; font-size: 0.875rem; color: #6b7280; }
        .field-label { font-size: 0.875rem; font-weight: 500; color: #374151; }
    `]
})
export class AdminGeneralSettingsComponent implements OnInit {
    readonly form: FormGroup;
    isLoading = false;
    isSaving = false;
    updatedAt: string | null = null;
    updatedBy: string | null = null;

    readonly languages = [
        { value: 'vi', label: 'Tiếng Việt' },
        { value: 'en', label: 'English' }
    ];

    /** Số nguyên dương (bắt buộc) cho các ô cấu hình dạng số. */
    private static readonly _positiveNumber = (min: number, max: number) => [
        Validators.required, Validators.min(min), Validators.max(max)
    ];

    constructor(
        private readonly _appService: AppService,
        private readonly _systemSettingService: SystemSettingService,
        private readonly _fb: FormBuilder
    ) {
        this.form = this._fb.group({
            systemName: ['', [Validators.required, Validators.maxLength(200)]],
            supportEmail: ['', [Validators.email]],
            supportPhone: ['', [Validators.maxLength(50)]],
            address: ['', [Validators.maxLength(300)]],
            workingHours: ['', [Validators.maxLength(200)]],
            facebookUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            youtubeUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            zaloUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            copyrightText: ['', [Validators.maxLength(300)]],

            defaultLanguage: ['vi', [Validators.required]],
            timeZone: ['', [Validators.required]],
            currencySymbol: ['', [Validators.required]],
            dateFormat: ['', [Validators.required]],

            allowRegistration: [true],
            requireEmailVerification: [false],
            minPasswordLength: [8, AdminGeneralSettingsComponent._positiveNumber(6, 64)],
            accessTokenMinutes: [120, AdminGeneralSettingsComponent._positiveNumber(5, 1440)],
            refreshTokenDays: [30, AdminGeneralSettingsComponent._positiveNumber(1, 365)],
            maxFailedLoginAttempts: [5, AdminGeneralSettingsComponent._positiveNumber(1, 20)],
            lockoutMinutes: [15, AdminGeneralSettingsComponent._positiveNumber(1, 1440)],
            referralCodePrefix: ['', [Validators.required, Validators.maxLength(20)]],
            referralCodeLength: [6, AdminGeneralSettingsComponent._positiveNumber(4, 12)],
            commissionAttributionDays: [30, AdminGeneralSettingsComponent._positiveNumber(0, 365)],

            maxUploadSizeMb: [10, AdminGeneralSettingsComponent._positiveNumber(1, 200)],
            allowedImageExtensions: ['', [Validators.maxLength(300)]],
            allowedDocumentExtensions: ['', [Validators.maxLength(300)]],
            maxImagesPerPost: [10, AdminGeneralSettingsComponent._positiveNumber(0, 50)],
            requirePostApproval: [false],
            requireGroupApproval: [false],
            auditLogRetentionDays: [365, AdminGeneralSettingsComponent._positiveNumber(0, 3650)],
            enableEmailNotification: [true],
            notificationSenderName: ['', [Validators.maxLength(200)]],
            notificationReplyTo: ['', [Validators.email]],
            note: ['', [Validators.maxLength(500)]]
        });
    }

    ngOnInit(): void {
        this.load();
    }

    /** Có quyền sửa cài đặt chung hay không. */
    get canUpdate(): boolean {
        return this._appService.permissionService.has(Permission.UpdateSystemSettings);
    }

    /** Ô nhập đang lỗi và người dùng đã chạm vào. */
    isInvalid(field: string): boolean {
        const control = this.form.get(field);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    /** Thông báo lỗi của ô nhập (đã dịch). */
    errorOf(field: string): string {
        const control = this.form.get(field);
        if (!control || !control.errors) return '';
        if (control.errors['required']) return this._appService.trans('ADMIN.SETTINGS.ERROR_REQUIRED');
        if (control.errors['email']) return this._appService.trans('ADMIN.SETTINGS.ERROR_EMAIL');
        if (control.errors['pattern']) return this._appService.trans('ADMIN.SETTINGS.ERROR_URL');
        return this._appService.trans('ADMIN.SETTINGS.ERROR_RANGE');
    }

    /** Nạp cài đặt chung hiện tại. */
    load(): void {
        this.isLoading = true;
        this._systemSettingService.get().subscribe({
            next: response => {
                const data = response.data;
                if (data) {
                    this.form.patchValue(data);
                    this.updatedAt = data.updatedAt ?? null;
                    this.updatedBy = data.updatedBy ?? null;
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Lưu cài đặt chung. */
    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this._appService.showWarning(this._appService.trans('ADMIN.SETTINGS.ERROR_REQUIRED'));
            return;
        }

        this.isSaving = true;
        const request = this.toRequest();

        this._systemSettingService.save(request).subscribe({
            next: response => {
                this.isSaving = false;
                const data = response.data;
                if (data) {
                    this.updatedAt = data.updatedAt ?? null;
                    this.updatedBy = data.updatedBy ?? null;
                }
                this._appService.showSuccess(this._appService.trans('ADMIN.SETTINGS.SAVED'));
            },
            error: error => {
                this.isSaving = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Dữ liệu gửi lên: các ô số được chuyển về number, ô trống trả về null. */
    private toRequest(): SaveSystemSettingRequest {
        const value = this.form.getRawValue();
        const text = (input: unknown): string | null => {
            const trimmed = `${input ?? ''}`.trim();
            return trimmed.length > 0 ? trimmed : null;
        };
        const number = (input: unknown): number => Number(input ?? 0);

        return {
            systemName: `${value.systemName}`.trim(),
            supportEmail: text(value.supportEmail),
            supportPhone: text(value.supportPhone),
            address: text(value.address),
            workingHours: text(value.workingHours),
            facebookUrl: text(value.facebookUrl),
            youtubeUrl: text(value.youtubeUrl),
            zaloUrl: text(value.zaloUrl),
            copyrightText: text(value.copyrightText),

            defaultLanguage: value.defaultLanguage,
            timeZone: `${value.timeZone}`.trim(),
            currencySymbol: `${value.currencySymbol}`.trim(),
            dateFormat: `${value.dateFormat}`.trim(),

            allowRegistration: !!value.allowRegistration,
            requireEmailVerification: !!value.requireEmailVerification,
            minPasswordLength: number(value.minPasswordLength),
            accessTokenMinutes: number(value.accessTokenMinutes),
            refreshTokenDays: number(value.refreshTokenDays),
            maxFailedLoginAttempts: number(value.maxFailedLoginAttempts),
            lockoutMinutes: number(value.lockoutMinutes),
            referralCodePrefix: `${value.referralCodePrefix}`.trim(),
            referralCodeLength: number(value.referralCodeLength),
            commissionAttributionDays: number(value.commissionAttributionDays),

            maxUploadSizeMb: number(value.maxUploadSizeMb),
            allowedImageExtensions: text(value.allowedImageExtensions),
            allowedDocumentExtensions: text(value.allowedDocumentExtensions),
            maxImagesPerPost: number(value.maxImagesPerPost),
            requirePostApproval: !!value.requirePostApproval,
            requireGroupApproval: !!value.requireGroupApproval,
            auditLogRetentionDays: number(value.auditLogRetentionDays),
            enableEmailNotification: !!value.enableEmailNotification,
            notificationSenderName: text(value.notificationSenderName),
            notificationReplyTo: text(value.notificationReplyTo),
            note: text(value.note)
        };
    }
}
