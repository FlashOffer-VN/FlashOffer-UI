import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { SystemSettingService } from '@core/services/system-setting.service';
import { SaveSystemSettingRequest, SystemSetting } from '@core/models/system-setting.model';
import { Permission } from '@core/models/permission.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import {
    CURRENCY_OPTIONS,
    DATE_FORMAT_OPTIONS,
    SelectOption,
    WORKING_HOURS_OPTIONS,
    timeZoneOptions,
    withCurrentOption
} from '@core/constants/format-options';
import { openExternalLink } from '@core/utils/link';
import { copyToClipboard } from '@core/utils/share-link';

/** Kiểu điều khiển của một trường cài đặt. */
type SettingFieldType = 'text' | 'number' | 'email' | 'phone' | 'url' | 'bool' | 'language' | 'select';

interface SettingField {
    /** Tên trường trong cài đặt chung. */
    key: keyof SystemSetting & string;
    /** Khoá i18n của nhãn. */
    label: string;
    /** Khoá i18n của chú thích (nếu có). */
    hint?: string;
    type: SettingFieldType;
    placeholder?: string;
    /** Tuỳ chọn cho trường dạng chọn (mặc định lấy theo trường). */
    options?: SelectOption[];
}

interface SettingSection {
    title: string;
    description: string;
    fields: SettingField[];
}

/**
 * Cài đặt chung của hệ thống: mỗi trường hiển thị giá trị đang lưu, ô nhập giá trị mới và các nút
 * tiện ích ở góc phải (chép giá trị, mở liên kết / gọi điện / gửi thư, khôi phục mặc định của trường).
 */
@Component({
    selector: 'app-admin-general-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        AppDatePipe,
        NgSelectWrapperComponent
    ],
    template: `
        <div class="space-y-4">
            @if (!canView) {
                <div class="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600">
                    {{ 'ADMIN.SETTINGS.NO_PERMISSION' | translate }}
                </div>
            } @else if (isLoading) {
                <div class="bg-white rounded-xl border border-gray-200 p-10"><app-loading></app-loading></div>
            } @else {
                @if (current?.updatedAt) {
                    <p class="text-sm text-gray-500">
                        {{ 'ADMIN.SETTINGS.UPDATED_AT' | translate }}: {{ current?.updatedAt | appDate:'datetime' }}
                        @if (current?.updatedBy) { · {{ current?.updatedBy }} }
                    </p>
                }

                <!-- Chọn nhóm cài đặt: mỗi lần mở một nhóm để trang không phải cuộn dài -->
                <div class="bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                        {{ 'ADMIN.SETTINGS.SECTION_SELECT' | translate }}
                    </label>
                    <app-ng-select-wrapper [(ngModel)]="openSection" [items]="sectionOptions"
                        [id]="'setting_section'" [searchable]="false" [clearable]="false">
                    </app-ng-select-wrapper>
                </div>

                <form [formGroup]="form" (ngSubmit)="save()" class="space-y-4">
                    @for (section of sections; track section.title) {
                        @if (section.title === openSection) {
                        <section class="bg-white rounded-xl border border-gray-200">
                            <div class="px-5 py-4 border-b border-gray-200">
                                <h2 class="text-base font-semibold text-gray-900">{{ section.title | translate }}</h2>
                                <p class="text-sm text-gray-500 mt-0.5">{{ section.description | translate }}</p>
                            </div>

                            <div class="overflow-x-auto">
                                <table class="w-full text-sm table-fixed">
                                    <thead class="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">{{ 'ADMIN.SETTINGS.COL_FIELD' | translate }}</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[28%]">{{ 'ADMIN.SETTINGS.COL_CURRENT' | translate }}</th>
                                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[28%]">{{ 'ADMIN.SETTINGS.COL_NEW' | translate }}</th>
                                            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[22%]">{{ 'ADMIN.SETTINGS.COL_UTILITY' | translate }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100">
                                        @for (field of section.fields; track field.key) {
                                            <tr [class.bg-amber-50]="isChanged(field.key)">
                                                <td class="px-4 py-3 align-top break-words">
                                                    <div class="font-medium text-gray-800">{{ field.label | translate }}</div>
                                                    @if (field.hint) {
                                                        <div class="text-xs text-gray-500 mt-0.5">{{ field.hint | translate }}</div>
                                                    }
                                                    @if (isChanged(field.key)) {
                                                        <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                            {{ 'ADMIN.SETTINGS.CHANGED' | translate }}
                                                        </span>
                                                    }
                                                </td>

                                                <td class="px-4 py-3 align-top text-gray-700 break-words whitespace-normal">
                                                    @if (displayCurrent(field) === '') {
                                                        <span class="text-gray-400">{{ 'ADMIN.SETTINGS.CURRENT_EMPTY' | translate }}</span>
                                                    } @else if (field.type === 'url') {
                                                        <a [href]="displayCurrent(field)" target="_blank" rel="noopener"
                                                            class="text-teal-700 hover:underline break-all">{{ displayCurrent(field) }}</a>
                                                    } @else if (field.type === 'email') {
                                                        <a [href]="'mailto:' + displayCurrent(field)"
                                                            class="text-teal-700 hover:underline break-all">{{ displayCurrent(field) }}</a>
                                                    } @else if (field.type === 'phone') {
                                                        <a [href]="'tel:' + displayCurrent(field)"
                                                            class="text-teal-700 hover:underline">{{ displayCurrent(field) }}</a>
                                                    } @else {
                                                        <span class="break-words whitespace-normal">{{ displayCurrent(field) }}</span>
                                                    }
                                                </td>

                                                <td class="px-4 py-3 align-top">
                                                    @switch (field.type) {
                                                        @case ('bool') {
                                                            <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                                                                <input type="checkbox" [formControlName]="field.key"
                                                                    class="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500">
                                                                <span>{{ (form.get(field.key)?.value ? 'ADMIN.SETTINGS.YES' : 'ADMIN.SETTINGS.NO') | translate }}</span>
                                                            </label>
                                                        }
                                                        @case ('language') {
                                                            <div class="flex items-center gap-4">
                                                                <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                                                                    <input type="radio" value="vi" [formControlName]="field.key"
                                                                        class="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500">
                                                                    <span>Tiếng Việt</span>
                                                                </label>
                                                                <label class="inline-flex items-center gap-2 text-sm text-gray-700">
                                                                    <input type="radio" value="en" [formControlName]="field.key"
                                                                        class="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500">
                                                                    <span>English</span>
                                                                </label>
                                                            </div>
                                                        }
                                                        @case ('select') {
                                                            <app-ng-select-wrapper [formControlName]="field.key"
                                                                [items]="optionsOf(field)"
                                                                [id]="'setting_' + field.key"
                                                                [searchable]="true" [clearable]="true"
                                                                [placeholder]="field.placeholder ? (field.placeholder | translate) : ''"
                                                                [isInvalid]="isInvalid(field.key)"
                                                                [errorMessage]="errorOf(field.key)">
                                                            </app-ng-select-wrapper>
                                                        }
                                                        @default {
                                                            <app-input [formControlName]="field.key"
                                                                [type]="field.type === 'number' ? 'number' : 'text'"
                                                                [id]="'setting_' + field.key"
                                                                [placeholder]="field.placeholder ? (field.placeholder | translate) : ''"
                                                                [isInvalid]="isInvalid(field.key)"
                                                                [errorMessage]="errorOf(field.key)">
                                                            </app-input>
                                                        }
                                                    }
                                                </td>

                                                <td class="px-4 py-3 align-top">
                                                    <div class="flex flex-wrap items-center justify-end gap-1">
                                                        <app-button size="sm" variant="outline" [disabled]="!displayCurrent(field)"
                                                            [title]="'ADMIN.SETTINGS.UTILITY_COPY' | translate" (click)="copyValue(field)">
                                                            <i class="fa-regular fa-copy"></i>
                                                        </app-button>

                                                        @if (field.type === 'url' && displayCurrent(field)) {
                                                            <app-button size="sm" variant="outline"
                                                                [title]="'ADMIN.SETTINGS.UTILITY_OPEN' | translate"
                                                                (click)="openLink(displayCurrent(field))">
                                                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                                            </app-button>
                                                        }
                                                        @if (field.type === 'phone' && displayCurrent(field)) {
                                                            <app-button size="sm" variant="outline"
                                                                [title]="'ADMIN.SETTINGS.UTILITY_CALL' | translate"
                                                                (click)="openLink('tel:' + displayCurrent(field))">
                                                                <i class="fa-solid fa-phone"></i>
                                                            </app-button>
                                                        }
                                                        @if (field.type === 'email' && displayCurrent(field)) {
                                                            <app-button size="sm" variant="outline"
                                                                [title]="'ADMIN.SETTINGS.UTILITY_EMAIL' | translate"
                                                                (click)="openLink('mailto:' + displayCurrent(field))">
                                                                <i class="fa-regular fa-envelope"></i>
                                                            </app-button>
                                                        }

                                                        <app-button size="sm" variant="outline"
                                                            [title]="'ADMIN.SETTINGS.UTILITY_DEFAULT' | translate" (click)="useDefault(field)">
                                                            <i class="fa-solid fa-rotate-left"></i>
                                                        </app-button>
                                                    </div>
                                                </td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </section>
                        }
                    }

                    <!-- Thanh lưu -->
                    <div class="sticky bottom-0 flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                        @if (changedCount > 0) {
                            <span class="text-sm text-amber-700">
                                <i class="fa-solid fa-circle-info mr-1"></i>
                                {{ 'ADMIN.SETTINGS.CHANGED_COUNT' | translate }}: <strong>{{ changedCount }}</strong>
                            </span>
                        }

                        <div class="ml-auto flex flex-wrap items-center gap-3">
                            <app-button type="button" variant="outline" [loading]="isResetting" [disabled]="isResetting || isSaving"
                                (click)="resetAll()">
                                <i class="fa-solid fa-rotate-left mr-1"></i>{{ 'ADMIN.SETTINGS.RESET_ALL' | translate }}
                            </app-button>
                            @if (canSave) {
                                <app-button type="submit" variant="primary" [loading]="isSaving" [disabled]="isSaving || isResetting">
                                    <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'ADMIN.SETTINGS.SAVE' | translate }}
                                </app-button>
                            }
                        </div>
                    </div>
                </form>
            }
        </div>
    `
})
export class AdminGeneralSettingsComponent implements OnInit {
    /** Các nhóm cài đặt, khai báo một chỗ để màn hình và bảng hiển thị luôn khớp nhau. */
    readonly sections: SettingSection[] = [
        {
            title: 'ADMIN.SETTINGS.SECTION_PLATFORM',
            description: 'ADMIN.SETTINGS.SECTION_PLATFORM_DESC',
            fields: [
                { key: 'systemName', label: 'ADMIN.SETTINGS.FIELD_SYSTEM_NAME', type: 'text',
                  placeholder: 'Kindi - Nền tảng kết nối doanh nghiệp SME' },
                { key: 'supportPhone', label: 'ADMIN.SETTINGS.FIELD_SUPPORT_PHONE', type: 'phone',
                  placeholder: '1900 1234' },
                { key: 'supportEmail', label: 'ADMIN.SETTINGS.FIELD_SUPPORT_EMAIL', type: 'email',
                  placeholder: 'hotro@kindi.vn' },
                { key: 'address', label: 'ADMIN.SETTINGS.FIELD_ADDRESS', type: 'text',
                  placeholder: 'Số 1 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' },
                { key: 'workingHours', label: 'ADMIN.SETTINGS.FIELD_WORKING_HOURS', type: 'select',
                  placeholder: 'Chọn khung giờ làm việc' },
                { key: 'copyrightText', label: 'ADMIN.SETTINGS.FIELD_COPYRIGHT', type: 'text',
                  placeholder: '© 2026 Kindi. All rights reserved.' }
            ]
        },
        {
            title: 'ADMIN.SETTINGS.SECTION_SOCIAL',
            description: 'ADMIN.SETTINGS.SECTION_SOCIAL_DESC',
            fields: [
                { key: 'facebookUrl', label: 'ADMIN.SETTINGS.FIELD_FACEBOOK', type: 'url',
                  placeholder: 'https://facebook.com/ten-trang' },
                { key: 'youtubeUrl', label: 'ADMIN.SETTINGS.FIELD_YOUTUBE', type: 'url',
                  placeholder: 'https://youtube.com/@ten-kenh' },
                { key: 'tiktokUrl', label: 'ADMIN.SETTINGS.FIELD_TIKTOK', type: 'url',
                  placeholder: 'https://tiktok.com/@ten-tai-khoan' },
                { key: 'zaloUrl', label: 'ADMIN.SETTINGS.FIELD_ZALO', type: 'url',
                  placeholder: 'https://zalo.me/0900000000' },
                { key: 'instagramUrl', label: 'ADMIN.SETTINGS.FIELD_INSTAGRAM', type: 'url',
                  placeholder: 'https://instagram.com/ten-tai-khoan' },
                { key: 'xUrl', label: 'ADMIN.SETTINGS.FIELD_X', type: 'url',
                  placeholder: 'https://x.com/ten-tai-khoan' },
                { key: 'threadsUrl', label: 'ADMIN.SETTINGS.FIELD_THREADS', type: 'url',
                  placeholder: 'https://threads.net/@ten-tai-khoan' },
                { key: 'linkedinUrl', label: 'ADMIN.SETTINGS.FIELD_LINKEDIN', type: 'url',
                  placeholder: 'https://linkedin.com/company/ten-cong-ty' }
            ]
        },
        {
            title: 'ADMIN.SETTINGS.SECTION_FORMAT',
            description: 'ADMIN.SETTINGS.SECTION_FORMAT_DESC',
            fields: [
                { key: 'defaultLanguage', label: 'ADMIN.SETTINGS.FIELD_DEFAULT_LANGUAGE', type: 'language' },
                { key: 'timeZone', label: 'ADMIN.SETTINGS.FIELD_TIME_ZONE', type: 'select',
                  placeholder: 'Chọn múi giờ' },
                { key: 'currencySymbol', label: 'ADMIN.SETTINGS.FIELD_CURRENCY_SYMBOL', type: 'select',
                  placeholder: 'Chọn ký hiệu tiền' },
                { key: 'dateFormat', label: 'ADMIN.SETTINGS.FIELD_DATE_FORMAT', type: 'select',
                  placeholder: 'Chọn định dạng ngày', hint: 'ADMIN.SETTINGS.FIELD_DATE_FORMAT_HINT' }
            ]
        },
        {
            title: 'ADMIN.SETTINGS.SECTION_ACCOUNT',
            description: 'ADMIN.SETTINGS.SECTION_ACCOUNT_DESC',
            fields: [
                { key: 'allowRegistration', label: 'ADMIN.SETTINGS.FIELD_ALLOW_REGISTRATION', type: 'bool' },
                { key: 'requireEmailVerification', label: 'ADMIN.SETTINGS.FIELD_REQUIRE_EMAIL_VERIFICATION', type: 'bool' },
                { key: 'minPasswordLength', label: 'ADMIN.SETTINGS.FIELD_MIN_PASSWORD_LENGTH', type: 'number',
                  placeholder: '8', hint: 'ADMIN.SETTINGS.FIELD_MIN_PASSWORD_LENGTH_HINT' },
                { key: 'accessTokenMinutes', label: 'ADMIN.SETTINGS.FIELD_ACCESS_TOKEN_MINUTES', type: 'number',
                  placeholder: '120', hint: 'ADMIN.SETTINGS.FIELD_ACCESS_TOKEN_MINUTES_HINT' },
                { key: 'refreshTokenDays', label: 'ADMIN.SETTINGS.FIELD_REFRESH_TOKEN_DAYS', type: 'number',
                  placeholder: '30' },
                { key: 'maxFailedLoginAttempts', label: 'ADMIN.SETTINGS.FIELD_MAX_FAILED_LOGIN_ATTEMPTS', type: 'number',
                  placeholder: '5' },
                { key: 'lockoutMinutes', label: 'ADMIN.SETTINGS.FIELD_LOCKOUT_MINUTES', type: 'number',
                  placeholder: '15', hint: 'ADMIN.SETTINGS.FIELD_LOCKOUT_MINUTES_HINT' },
                { key: 'referralCodePrefix', label: 'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_PREFIX', type: 'text',
                  placeholder: 'CTV-', hint: 'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_PREFIX_HINT' },
                { key: 'referralCodeLength', label: 'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_LENGTH', type: 'number',
                  placeholder: '6', hint: 'ADMIN.SETTINGS.FIELD_REFERRAL_CODE_LENGTH_HINT' },
                { key: 'commissionAttributionDays', label: 'ADMIN.SETTINGS.FIELD_ATTRIBUTION_DAYS', type: 'number',
                  placeholder: '30', hint: 'ADMIN.SETTINGS.FIELD_ATTRIBUTION_DAYS_HINT' }
            ]
        },
        {
            title: 'ADMIN.SETTINGS.SECTION_CONTENT',
            description: 'ADMIN.SETTINGS.SECTION_CONTENT_DESC',
            fields: [
                { key: 'maxUploadSizeMb', label: 'ADMIN.SETTINGS.FIELD_MAX_UPLOAD_SIZE', type: 'number',
                  placeholder: '10', hint: 'ADMIN.SETTINGS.FIELD_MAX_UPLOAD_SIZE_HINT' },
                { key: 'allowedImageExtensions', label: 'ADMIN.SETTINGS.FIELD_IMAGE_EXTENSIONS', type: 'text',
                  placeholder: 'jpg,jpeg,png,webp', hint: 'ADMIN.SETTINGS.FIELD_EXTENSIONS_HINT' },
                { key: 'allowedDocumentExtensions', label: 'ADMIN.SETTINGS.FIELD_DOCUMENT_EXTENSIONS', type: 'text',
                  placeholder: 'pdf,doc,docx,xlsx', hint: 'ADMIN.SETTINGS.FIELD_EXTENSIONS_HINT' },
                { key: 'maxImagesPerPost', label: 'ADMIN.SETTINGS.FIELD_MAX_IMAGES_PER_POST', type: 'number',
                  placeholder: '10' },
                { key: 'requirePostApproval', label: 'ADMIN.SETTINGS.FIELD_REQUIRE_POST_APPROVAL', type: 'bool' },
                { key: 'requireGroupApproval', label: 'ADMIN.SETTINGS.FIELD_REQUIRE_GROUP_APPROVAL', type: 'bool' },
                { key: 'auditLogRetentionDays', label: 'ADMIN.SETTINGS.FIELD_AUDIT_RETENTION', type: 'number',
                  placeholder: '365', hint: 'ADMIN.SETTINGS.FIELD_AUDIT_RETENTION_HINT' },
                { key: 'enableEmailNotification', label: 'ADMIN.SETTINGS.FIELD_ENABLE_EMAIL_NOTIFICATION', type: 'bool' },
                { key: 'notificationSenderName', label: 'ADMIN.SETTINGS.FIELD_NOTIFICATION_SENDER_NAME', type: 'text',
                  placeholder: 'Kindi' },
                { key: 'notificationReplyTo', label: 'ADMIN.SETTINGS.FIELD_NOTIFICATION_REPLY_TO', type: 'email',
                  placeholder: 'no-reply@kindi.vn' },
                { key: 'note', label: 'ADMIN.SETTINGS.FIELD_NOTE', type: 'text',
                  placeholder: 'Ghi chú nội bộ cho quản trị viên' }
            ]
        }
    ];

    /** Nhóm cài đặt đang mở — chọn ở ô chọn phía trên để không phải cuộn cả trang. */
    openSection: string = this.sections[0].title;

    /** Múi giờ lấy từ trình duyệt (kèm chênh lệch UTC), tính một lần cho cả màn hình. */
    private readonly _timeZones: SelectOption[] = timeZoneOptions();

    readonly form: FormGroup;

    /** Giá trị đang lưu trên hệ thống (cột "Giá trị hiện tại"). */
    current: SystemSetting | null = null;
    /** Giá trị mặc định (nút khôi phục mặc định của từng trường). */
    defaults: SystemSetting | null = null;

    /** Danh sách nhóm cài đặt cho ô chọn (kèm số trường của từng nhóm). */
    get sectionOptions(): SelectOption[] {
        return this.sections.map(section => ({
            value: section.title,
            label: `${this._appService.trans(section.title)} (${section.fields.length})`
        }));
    }

    /** Tuỳ chọn của ô chọn; giá trị đang lưu luôn được thêm vào để ô chọn không hiện trống. */
    optionsOf(field: SettingField): SelectOption[] {
        if (field.key === 'timeZone') return withCurrentOption(this._timeZones, this.current?.timeZone);
        if (field.key === 'currencySymbol') return withCurrentOption(CURRENCY_OPTIONS, this.current?.currencySymbol);
        if (field.key === 'workingHours') return withCurrentOption(WORKING_HOURS_OPTIONS, this.current?.workingHours);
        if (field.key === 'dateFormat') return withCurrentOption(DATE_FORMAT_OPTIONS, this.current?.dateFormat);

        return field.options ?? [];
    }

    isLoading = false;
    isSaving = false;
    isResetting = false;

    constructor(
        private readonly _appService: AppService,
        private readonly _settingService: SystemSettingService,
        private readonly _fb: FormBuilder
    ) {
        this.form = this._fb.group({
            systemName: ['', [Validators.required, Validators.maxLength(200)]],
            supportPhone: ['', [Validators.maxLength(50)]],
            supportEmail: ['', [Validators.email]],
            address: ['', [Validators.maxLength(300)]],
            workingHours: ['', [Validators.maxLength(200)]],
            copyrightText: ['', [Validators.maxLength(300)]],
            facebookUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            youtubeUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            tiktokUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            zaloUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            instagramUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            xUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            threadsUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            linkedinUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            defaultLanguage: ['vi', [Validators.required]],
            timeZone: ['', [Validators.required]],
            currencySymbol: ['', [Validators.required]],
            dateFormat: ['', [Validators.required]],
            allowRegistration: [true],
            requireEmailVerification: [false],
            minPasswordLength: [8, AdminGeneralSettingsComponent._range(6, 64)],
            accessTokenMinutes: [120, AdminGeneralSettingsComponent._range(5, 1440)],
            refreshTokenDays: [30, AdminGeneralSettingsComponent._range(1, 365)],
            maxFailedLoginAttempts: [5, AdminGeneralSettingsComponent._range(1, 20)],
            lockoutMinutes: [15, AdminGeneralSettingsComponent._range(1, 1440)],
            referralCodePrefix: ['', [Validators.required, Validators.maxLength(20)]],
            referralCodeLength: [6, AdminGeneralSettingsComponent._range(4, 12)],
            commissionAttributionDays: [30, AdminGeneralSettingsComponent._range(0, 365)],
            maxUploadSizeMb: [10, AdminGeneralSettingsComponent._range(1, 200)],
            allowedImageExtensions: ['', [Validators.maxLength(300)]],
            allowedDocumentExtensions: ['', [Validators.maxLength(300)]],
            maxImagesPerPost: [10, AdminGeneralSettingsComponent._range(0, 50)],
            requirePostApproval: [false],
            requireGroupApproval: [false],
            auditLogRetentionDays: [365, AdminGeneralSettingsComponent._range(0, 3650)],
            enableEmailNotification: [true],
            notificationSenderName: ['', [Validators.maxLength(200)]],
            notificationReplyTo: ['', [Validators.email]],
            note: ['', [Validators.maxLength(500)]]
        });
    }

    ngOnInit(): void {
        this.load();
    }

    /** Quyền xem cài đặt chung. */
    get canView(): boolean {
        return this._appService.permissionService.has(Permission.ViewSystemSettings);
    }

    /** Quyền sửa cài đặt chung. */
    get canSave(): boolean {
        return this._appService.permissionService.has(Permission.UpdateSystemSettings);
    }

    /** Số trường đang khác giá trị đã lưu. */
    get changedCount(): number {
        return this.sections
            .flatMap(section => section.fields)
            .filter(field => this.isChanged(field.key))
            .length;
    }

    load(): void {
        this.isLoading = true;

        this._settingService.get().subscribe({
            next: response => {
                this.current = response.data ?? null;
                this.form.patchValue(this.current ?? {});
                this.isLoading = false;
            },
            error: error => {
                this.isLoading = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });

        // Giá trị mặc định chỉ dùng để điền lại từng trường, lỗi ở đây không chặn màn hình.
        this._settingService.getDefaults().subscribe({
            next: response => this.defaults = response.data ?? null,
            error: () => this.defaults = null
        });
    }

    save(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this._appService.showError(this._appService.trans('ADMIN.SETTINGS.ERROR_FORM_INVALID'));
            return;
        }

        const request = this._normalize(this.form.getRawValue());
        this.isSaving = true;

        this._settingService.save(request).subscribe({
            next: response => {
                this.isSaving = false;
                this.current = response.data ?? this.current;
                this.form.patchValue(this.current ?? {});
                this._appService.showSuccess(this._appService.trans('ADMIN.SETTINGS.SAVED'));
            },
            error: error => {
                this.isSaving = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    /** Khôi phục toàn bộ cài đặt chung về mặc định. */
    resetAll(): void {
        this._appService.confirm({
            title: this._appService.trans('ADMIN.SETTINGS.RESET_ALL_CONFIRM_TITLE'),
            message: this._appService.trans('ADMIN.SETTINGS.RESET_ALL_CONFIRM_MESSAGE'),
            confirmText: this._appService.trans('ADMIN.SETTINGS.RESET_ALL'),
            confirmVariant: 'danger'
        }).then(confirmed => {
            if (!confirmed) return;

            this.isResetting = true;
            this._settingService.reset().subscribe({
                next: response => {
                    this.isResetting = false;
                    this.current = response.data ?? null;
                    this.form.patchValue(this.current ?? {});
                    this._appService.showSuccess(this._appService.trans('ADMIN.SETTINGS.RESET_DONE'));
                },
                error: error => {
                    this.isResetting = false;
                    this._appService.showError(this._appService.extractErrorMessage(error));
                }
            });
        });
    }

    /** Điền giá trị mặc định của trường vào ô nhập. */
    useDefault(field: SettingField): void {
        const value = this.defaults ? (this.defaults as unknown as Record<string, unknown>)[field.key] : undefined;
        if (value === undefined || value === null) {
            this._appService.showError(this._appService.trans('ADMIN.SETTINGS.UTILITY_DEFAULT_MISSING'));
            return;
        }

        this.form.get(field.key)?.patchValue(value);
        this.form.get(field.key)?.markAsDirty();
    }

    /** Chép giá trị đang lưu của trường vào bộ nhớ tạm. */
    copyValue(field: SettingField): void {
        const value = this.displayCurrent(field);
        if (!value) return;

        copyToClipboard(value).then(() => this._appService.showSuccess(this._appService.trans('ADMIN.SETTINGS.UTILITY_COPIED')));
    }

    /** Mở liên kết (hoặc số điện thoại, email) của trường ở tab mới. */
    openLink(target: string): void {
        openExternalLink(target);
    }

    /** Giá trị đang lưu, đã đổi sang chuỗi hiển thị. */
    displayCurrent(field: SettingField): string {
        const value = this.current ? (this.current as unknown as Record<string, unknown>)[field.key] : null;
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') {
            return this._appService.trans(value ? 'ADMIN.SETTINGS.YES' : 'ADMIN.SETTINGS.NO');
        }
        return String(value).trim();
    }

    /** Trường đã bị đổi so với giá trị đang lưu. */
    isChanged(key: string): boolean {
        if (!this.current) return false;

        const saved = (this.current as unknown as Record<string, unknown>)[key];
        const entered = this.form.get(key)?.value;

        if (typeof saved === 'boolean' || typeof entered === 'boolean') return !!saved !== !!entered;
        if (saved === null || saved === undefined) return String(entered ?? '').trim() !== '';
        return String(entered ?? '').trim() !== String(saved).trim();
    }

    isInvalid(key: string): boolean {
        const control = this.form.get(key);
        return !!control && control.invalid && (control.touched || control.dirty);
    }

    errorOf(key: string): string {
        const control = this.form.get(key);
        if (!control?.errors) return '';
        if (control.errors['required']) return this._appService.trans('ADMIN.SETTINGS.ERROR_REQUIRED');
        if (control.errors['email']) return this._appService.trans('ADMIN.SETTINGS.ERROR_EMAIL');
        if (control.errors['pattern']) return this._appService.trans('ADMIN.SETTINGS.ERROR_URL');
        if (control.errors['min'] || control.errors['max']) return this._appService.trans('ADMIN.SETTINGS.ERROR_RANGE');
        return this._appService.trans('ADMIN.SETTINGS.ERROR_REQUIRED');
    }

    /** Chuỗi rỗng chuyển thành null để không lưu khoảng trắng vào cấu hình. */
    private _normalize(values: Record<string, unknown>): SaveSystemSettingRequest {
        const result: Record<string, unknown> = {};

        Object.entries(values).forEach(([key, value]) => {
            if (typeof value === 'boolean' || typeof value === 'number') {
                result[key] = value;
                return;
            }

            const text = String(value ?? '').trim();
            result[key] = text.length > 0 ? text : null;
        });

        return result as unknown as SaveSystemSettingRequest;
    }

    /** Bắt buộc là số trong khoảng cho phép (ô nhập số trả về chuỗi khi gõ). */
    private static _range(min: number, max: number) {
        return [Validators.required, Validators.min(min), Validators.max(max)];
    }
}
