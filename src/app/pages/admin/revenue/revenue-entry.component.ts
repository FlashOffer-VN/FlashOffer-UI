// pages/admin/revenue/revenue-entry.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { RevenueService } from '@core/services/revenue.service';
import {
    CommissionBeneficiary,
    RevenueRecordStatus,
    RevenueTransactionType,
    SaveTransactionRevenueRequest,
    TransactionRevenue
} from '@core/models/revenue.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';

/**
 * Khối khai doanh thu nhúng trong màn chi tiết giao dịch (yêu cầu mua hàng, yêu cầu mua chung).
 *
 * Quản trị viên nhập doanh thu gộp, tỷ lệ thuế (mặc định lấy theo Cài đặt chung, ghi đè được cho từng
 * giao dịch) và tỷ lệ hoa hồng từng bên; số tách ra bên dưới là bản xem trước tính giống hệt phép tính
 * ở máy chủ, còn số chính thức luôn do máy chủ tính lại khi lưu. Chốt xong thì khoá, không nhập được nữa.
 */
@Component({
    selector: 'app-revenue-entry',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        StatusTabsComponent,
        AppDatePipe,
        AppPricePipe
    ],
    templateUrl: './revenue-entry.component.html'
})
export class RevenueEntryComponent implements OnInit {
    /** Giao dịch đang được khai. */
    @Input({ required: true }) type!: RevenueTransactionType;
    /** Id giao dịch. */
    @Input({ required: true }) referenceId!: string;
    /** Mã giao dịch hiển thị. */
    @Input({ required: true }) referenceCode!: string;

    isLoading = true;
    isSaving = false;
    revenue: TransactionRevenue | null = null;
    form!: FormGroup;

    /** Hai lựa chọn cho biết số doanh thu nhập vào đã gồm thuế hay chưa. */
    taxIncludedTabs: StatusTabItem[] = [];

    constructor(
        private _formBuilder: FormBuilder,
        private _revenueService: RevenueService,
        private _appService: AppService
    ) { }

    ngOnInit(): void {
        this.taxIncludedTabs = [
            { key: 'excluded', label: this._appService.trans('ADMIN.REVENUE.TAX_EXCLUDED') },
            { key: 'included', label: this._appService.trans('ADMIN.REVENUE.TAX_INCLUDED') }
        ];

        this.form = this._formBuilder.group({
            grossRevenue: ['', [Validators.required]],
            taxIncluded: [false],
            taxPercent: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
            referrerRatePercent: ['', [Validators.min(0), Validators.max(100)]],
            partnerRatePercent: ['', [Validators.min(0), Validators.max(100)]],
            extraCost: [''],
            extraCostNote: ['']
        });

        this.load();
    }

    /** Ô nhập đã chạm vào và đang sai, dùng để tô đỏ. */
    isInvalid(field: string): boolean {
        const control = this.form?.get(field);
        return !!control && control.invalid && control.touched;
    }

    /** Bản khai đã chốt thì khoá form. */
    get isLocked(): boolean {
        return this.revenue?.status === RevenueRecordStatus.Confirmed;
    }

    /** Khoá đang chọn cho cờ "số nhập đã gồm thuế". */
    get taxIncludedKey(): string {
        return this.form?.value.taxIncluded ? 'included' : 'excluded';
    }

    /**
     * Số tách ra để xem trước, tính đúng như máy chủ: gộp → thuế → sau thuế → hoa hồng trên phần sau
     * thuế → chi phí → thực nhận, mỗi bước làm tròn tới đồng.
     */
    get preview(): { taxAmount: number; netRevenue: number; commissions: TransactionCommissionLine[]; totalCommission: number; actualRevenue: number } {
        const gross = ReadNumber(this.form?.value.grossRevenue);
        const taxPercent = Clamp(ReadNumber(this.form?.value.taxPercent), 0, 100);
        const included = !!this.form?.value.taxIncluded;

        const taxAmount = Math.round(included ? (gross * taxPercent) / (100 + taxPercent) : (gross * taxPercent) / 100);
        const netRevenue = gross - taxAmount;

        const commissions: TransactionCommissionLine[] = [
            { beneficiary: CommissionBeneficiary.Referrer, label: 'ADMIN.REVENUE.COMMISSION_REFERRER', amount: Math.round((netRevenue * Clamp(ReadNumber(this.form?.value.referrerRatePercent), 0, 100)) / 100) },
            { beneficiary: CommissionBeneficiary.Partner, label: 'ADMIN.REVENUE.COMMISSION_PARTNER', amount: Math.round((netRevenue * Clamp(ReadNumber(this.form?.value.partnerRatePercent), 0, 100)) / 100) }
        ];

        const totalCommission = commissions.reduce((sum, item) => sum + item.amount, 0);
        const extraCost = Math.round(ReadNumber(this.form?.value.extraCost));

        return { taxAmount, netRevenue, commissions, totalCommission, actualRevenue: netRevenue - totalCommission - extraCost };
    }

    /** Bản khai hiện có của giao dịch; chưa khai thì màn hình mở form trắng. */
    load(): void {
        this.isLoading = true;
        this._revenueService.getByReference(this.type, this.referenceId).subscribe({
            next: response => {
                this.revenue = response.data ?? null;
                this.fillForm();
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    /** Đổi cờ "số nhập đã gồm thuế". */
    onTaxIncludedChange(key: string): void {
        this.form.patchValue({ taxIncluded: key === 'included' });
    }

    /** Lưu bản khai với số liệu đang nhập. */
    save(confirmAfterSave = false): void {
        if (this.isLocked) return;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const value = this.form.value;
        const request: SaveTransactionRevenueRequest = {
            type: this.type,
            referenceId: this.referenceId,
            referenceCode: this.referenceCode,
            grossRevenue: ReadNumber(value.grossRevenue),
            taxIncluded: !!value.taxIncluded,
            taxPercent: ReadNumber(value.taxPercent),
            extraCost: ReadNumber(value.extraCost),
            extraCostNote: value.extraCostNote || null,
            commissions: [
                { beneficiary: CommissionBeneficiary.Referrer, ratePercent: ReadNumber(value.referrerRatePercent) },
                { beneficiary: CommissionBeneficiary.Partner, ratePercent: ReadNumber(value.partnerRatePercent) }
            ]
        };

        this.isSaving = true;
        this._revenueService.save(request).subscribe({
            next: response => {
                this.revenue = response.data ?? this.revenue;
                this.fillForm();
                this.isSaving = false;

                if (confirmAfterSave && this.revenue) {
                    this.confirm(this.revenue.id);
                    return;
                }

                this._appService.toast.success(response.message);
            },
            error: error => {
                this.isSaving = false;
                this._appService.toast.error(error?.error?.message || 'COMMON.MESSAGE.ERROR');
            }
        });
    }

    /** Chốt số liệu và khoá bản khai. */
    confirm(id: string): void {
        this.isSaving = true;
        this._revenueService.confirm(id).subscribe({
            next: response => {
                this.revenue = response.data ?? this.revenue;
                this.fillForm();
                this.isSaving = false;
                this._appService.toast.success(response.message);
            },
            error: error => {
                this.isSaving = false;
                this._appService.toast.error(error?.error?.message || 'COMMON.MESSAGE.ERROR');
            }
        });
    }

    private fillForm(): void {
        const revenue = this.revenue;
        this.form.patchValue({
            grossRevenue: revenue ? String(revenue.grossRevenue) : '',
            taxIncluded: revenue?.taxIncluded ?? false,
            taxPercent: revenue ? String(revenue.taxPercent) : '',
            referrerRatePercent: String(revenue?.commissions.find(item => item.beneficiary === CommissionBeneficiary.Referrer)?.ratePercent ?? ''),
            partnerRatePercent: String(revenue?.commissions.find(item => item.beneficiary === CommissionBeneficiary.Partner)?.ratePercent ?? ''),
            extraCost: revenue ? String(revenue.extraCost) : '',
            extraCostNote: revenue?.extraCostNote ?? ''
        });
    }
}

/** Một dòng hoa hồng trong bản xem trước. */
interface TransactionCommissionLine {
    beneficiary: CommissionBeneficiary;
    label: string;
    amount: number;
}

/** Ô nhập tiền trả về chuỗi còn dấu phân cách, đọc ra số bằng cách bỏ hết ký tự không phải chữ số. */
function ReadNumber(value: unknown): number {
    const digits = String(value ?? '').replace(/[^0-9]/g, '');
    return digits ? Number(digits) : 0;
}

function Clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
