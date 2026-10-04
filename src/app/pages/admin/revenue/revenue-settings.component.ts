// pages/admin/revenue/revenue-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { SystemSettingService } from '@core/services/system-setting.service';
import { SaveSystemSettingRequest, SystemSetting } from '@core/models/system-setting.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';

/**
 * Cấu hình doanh thu dùng chung cho mọi giao dịch: tỷ lệ thuế và cách hiểu số doanh thu nhập vào.
 * Từng bản khai vẫn có thể ghi đè tỷ lệ riêng khi cần.
 */
@Component({
    selector: 'app-admin-revenue-settings',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, InputComponent, LoadingComponent],
    template: `
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-semibold text-gray-900">{{ 'ADMIN.SETTINGS.REVENUE_PAGE_TITLE' | translate }}</h1>
                <p class="mt-1 text-sm text-gray-500">{{ 'ADMIN.SETTINGS.SECTION_REVENUE_DESC' | translate }}</p>
            </div>

            @if (isLoading) {
            <app-loading></app-loading>
            } @else {
            <form [formGroup]="form" (ngSubmit)="save()" class="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                <app-input formControlName="revenueTaxPercent" type="number" placeholder="0"
                    [label]="'ADMIN.SETTINGS.FIELD_REVENUE_TAX_PERCENT' | translate"
                    [hint]="'ADMIN.SETTINGS.FIELD_REVENUE_TAX_PERCENT_HINT' | translate"></app-input>

                <label class="flex items-start gap-2 text-sm text-gray-700">
                    <input type="checkbox" formControlName="revenueTaxIncluded" class="mt-1 h-4 w-4 rounded border-gray-300">
                    <span>
                        {{ 'ADMIN.SETTINGS.FIELD_REVENUE_TAX_INCLUDED' | translate }}
                        <span class="block text-xs text-gray-500">{{ 'ADMIN.SETTINGS.FIELD_REVENUE_TAX_INCLUDED_HINT' | translate }}</span>
                    </span>
                </label>

                <div class="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <app-button type="submit" variant="primary" [loading]="isSaving" [disabled]="isSaving || isLoading">
                        <i class="fa-solid fa-floppy-disk mr-1"></i>{{ 'COMMON.BUTTON.SAVE' | translate }}
                    </app-button>
                    <app-button type="button" variant="outline" (click)="load()" [disabled]="isSaving || isLoading">
                        <i class="fa-solid fa-rotate-right mr-1"></i>{{ 'COMMON.BUTTON.RESTORE' | translate }}
                    </app-button>
                </div>
            </form>
            }
        </div>
    `
})
export class AdminRevenueSettingsComponent implements OnInit {
    form!: FormGroup;
    isLoading = false;
    isSaving = false;

    /** Cấu hình đang lưu, giữ lại để gửi kèm các trường không sửa ở màn này. */
    private current: SystemSetting | null = null;

    constructor(
        private _formBuilder: FormBuilder,
        private _settingService: SystemSettingService,
        private _appService: AppService
    ) { }

    ngOnInit(): void {
        this.form = this._formBuilder.group({
            revenueTaxPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
            revenueTaxIncluded: [false]
        });

        this.load();
    }

    load(): void {
        this.isLoading = true;

        this._settingService.get().subscribe({
            next: response => {
                this.current = response.data ?? null;
                this.form.patchValue({
                    revenueTaxPercent: this.current?.revenueTaxPercent ?? 0,
                    revenueTaxIncluded: this.current?.revenueTaxIncluded ?? false
                });
                this.isLoading = false;
            },
            error: error => {
                this.isLoading = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }

    save(): void {
        if (!this.current) {
            return;
        }

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this._appService.showError(this._appService.trans('ADMIN.SETTINGS.ERROR_FORM_INVALID'));
            return;
        }

        const value = this.form.getRawValue();
        const rest = { ...this.current } as Partial<SystemSetting>;
        delete rest.updatedAt;
        delete rest.updatedBy;

        const request = {
            ...rest,
            revenueTaxPercent: Number(value.revenueTaxPercent) || 0,
            revenueTaxIncluded: !!value.revenueTaxIncluded
        } as SaveSystemSettingRequest;

        this.isSaving = true;

        this._settingService.save(request).subscribe({
            next: response => {
                this.isSaving = false;
                this.current = response.data ?? this.current;
                this._appService.showSuccess(this._appService.trans('ADMIN.SETTINGS.SAVED'));
            },
            error: error => {
                this.isSaving = false;
                this._appService.showError(this._appService.extractErrorMessage(error));
            }
        });
    }
}
