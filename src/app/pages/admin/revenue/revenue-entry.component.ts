// pages/admin/revenue/revenue-entry.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { RevenueService } from '@core/services/revenue.service';
import { RevenueExpenseTypeService } from '@core/services/revenue-expense-type.service';
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
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import { StatusTabsComponent, StatusTabItem } from '@shared/components/status-tabs/status-tabs.component';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { AppPricePipe } from '@shared/pipes/app-price.pipe';

/**
 * Khối khai doanh thu nhúng trong màn chi tiết giao dịch (yêu cầu mua hàng, yêu cầu mua chung).
 *
 * Quản trị viên nhập doanh thu gộp, tỷ lệ thuế (mặc định lấy theo Cài đặt chung, ghi đè được cho từng
 * giao dịch) và tỷ lệ hoa hồng từng bên; chi phí phát sinh khai theo từng dòng — chọn từ danh mục loại
 * chi phí của loại giao dịch hoặc tự nhập tên khác. Số tách ra bên dưới là bản xem trước tính giống hệt
 * phép tính ở máy chủ, còn số chính thức luôn do máy chủ tính lại khi lưu. Chốt xong thì khoá, không nhập được nữa.
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
        NgSelectWrapperComponent,
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

    /** Loại chi phí máy chủ trả về cho loại giao dịch đang khai, dùng khi thêm dòng chi phí. */
    expenseTypeOptions: { label: string; value: string }[] = [];
    /** Ô chọn loại chi phí trước khi thêm vào danh sách dòng. */
    expenseForm!: FormGroup;
    /** Bật thì hiện khu vực chọn loại chi phí để thêm dòng. */
    isAddingExpense = false;

    constructor(
        private _formBuilder: FormBuilder,
        private _revenueService: RevenueService,
        private _expenseTypeService: RevenueExpenseTypeService,
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
            expenses: this._formBuilder.array([])
        });

        this.expenseForm = this._formBuilder.group({
            expenseTypeId: [null],
            customName: ['']
        });

        this.loadExpenseTypes();
        this.load();
    }

    /** Danh sách dòng chi phí của bản khai. */
    get expenses(): FormArray {
        return this.form.get('expenses') as FormArray;
    }

    /** Tổng các dòng chi phí, dùng cho bản xem trước và gửi kèm khi lưu. */
    get totalExpense(): number {
        return this.expenses.controls.reduce((sum, control) => sum + ReadNumber(control.value.amount), 0);
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
    get preview(): { taxAmount: number; netRevenue: number; commissions: TransactionCommissionLine[]; totalCommission: number; totalExpense: number; actualRevenue: number } {
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
        const totalExpense = this.totalExpense;

        return { taxAmount, netRevenue, commissions, totalCommission, totalExpense, actualRevenue: netRevenue - totalCommission - totalExpense };
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

    /** Tải danh mục loại chi phí đang áp dụng cho loại giao dịch đang khai. */
    loadExpenseTypes(): void {
        this._expenseTypeService.resolve(this.type).subscribe({
            next: response => {
                this.expenseTypeOptions = (response.data ?? []).map(item => ({ label: item.name, value: item.id }));
            },
            error: () => {
                this.expenseTypeOptions = [];
            }
        });
    }

    /** Đổi cờ "số nhập đã gồm thuế". */
    onTaxIncludedChange(key: string): void {
        this.form.patchValue({ taxIncluded: key === 'included' });
    }

    /** Bật khu vực chọn loại chi phí để thêm dòng. */
    openAddExpense(): void {
        if (this.isLocked) return;
        this.expenseForm.reset({ expenseTypeId: null, customName: '' });
        this.isAddingExpense = true;
    }

    /** Thêm một dòng chi phí: ưu tiên tên tự nhập, không có thì lấy loại chi phí đã chọn. */
    addExpenseLine(): void {
        const customName = String(this.expenseForm.value.customName ?? '').trim();
        const typeId = this.expenseForm.value.expenseTypeId;
        const picked = this.expenseTypeOptions.find(option => option.value === typeId);
        const name = customName || picked?.label || '';

        if (!name) {
            this._appService.showError(this._appService.trans('ADMIN.REVENUE.EXPENSE_REQUIRED_NAME'));
            return;
        }

        this.expenses.push(this._formBuilder.group({ name: [name], amount: [''] }));
        this.expenseForm.reset({ expenseTypeId: null, customName: '' });
        this.isAddingExpense = false;
    }

    /** Bỏ một dòng chi phí. */
    removeExpenseLine(index: number): void {
        if (this.isLocked) return;
        this.expenses.removeAt(index);
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
            // Gửi kèm tổng chi phí để tương thích; máy chủ tự tính lại từ danh sách expenses.
            extraCost: this.totalExpense,
            extraCostNote: null,
            expenses: this.expenses.controls
                .map(control => ({ name: String(control.value.name ?? '').trim(), amount: ReadNumber(control.value.amount) }))
                .filter(line => !!line.name),
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
            partnerRatePercent: String(revenue?.commissions.find(item => item.beneficiary === CommissionBeneficiary.Partner)?.ratePercent ?? '')
        });

        this.expenses.clear();
        (revenue?.expenses ?? []).forEach(line => {
            this.expenses.push(this._formBuilder.group({ name: [line.name], amount: [String(line.amount)] }));
        });
        this.isAddingExpense = false;
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
