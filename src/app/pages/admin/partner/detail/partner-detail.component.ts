import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import {
    Partner,
    PartnerStatus,
    BusinessType,
    CompanySize,
    CommissionType,
    ProductCategory,
    getBusinessTypeLabel,
    getCompanySizeLabel,
    getCommissionTypeLabel,
    getProductCategoryLabel
} from '@core/models/partner.model';
import { ApiResponse } from '@core/models/paged-response.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
    selector: 'app-admin-partner-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        TranslateModule,
        ButtonComponent,
        LoadingComponent,
        BadgeComponent,
        ModalComponent
    ],
    templateUrl: './partner-detail.component.html',
    styleUrls: ['./partner-detail.component.css']
})
export class AdminPartnerDetailComponent implements OnInit {
    partner: Partner | null = null;
    isLoading = true;
    isActionLoading = false;

    // Modal
    showApproveModal = false;
    showRejectModal = false;
    showActivateModal = false;

    constructor(
        private _appService: AppService,
        private _route: ActivatedRoute,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        const id = this._route.snapshot.paramMap.get('id');
        if (!id) {
            this._appService.showError(this._appService.trans('COMMON.ERROR.INVALID_ID'));
            this._router.navigate(['/admin/partner']);
            return;
        }

        this.isLoading = true;
        this._appService.partnerService.getDetail(id).subscribe({
            next: (response: ApiResponse<Partner>) => {
                if (!response) {
                    this._appService.showError(this._appService.trans('COMMON.ERROR.NOT_FOUND'));
                    this._router.navigate(['/admin/partner']);
                    return;
                }
                this.partner = response.data;
                this.isLoading = false;
            },
            error: (err) => {
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                this._router.navigate(['/admin/partner']);
            }
        });
    }

    getStatusVariant(status: PartnerStatus): BadgeVariant {
        const variants: Record<PartnerStatus, BadgeVariant> = {
            [PartnerStatus.Pending]: 'warning',
            [PartnerStatus.Approved]: 'success',
            [PartnerStatus.Rejected]: 'danger',
            [PartnerStatus.Active]: 'success'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: PartnerStatus): string {
        const keys: Record<PartnerStatus, string> = {
            [PartnerStatus.Pending]: 'pending',
            [PartnerStatus.Approved]: 'approved',
            [PartnerStatus.Rejected]: 'rejected',
            [PartnerStatus.Active]: 'active'
        };
        return keys[status] || 'pending';
    }

    getBusinessTypeLabel(type: BusinessType): string {
        return getBusinessTypeLabel(type);
    }

    getCompanySizeLabel(size: CompanySize): string {
        return getCompanySizeLabel(size);
    }

    getCommissionTypeLabel(type: CommissionType): string {
        return getCommissionTypeLabel(type);
    }

    getProductCategoryLabel(category: ProductCategory): string {
        return getProductCategoryLabel(category);
    }

    formatNumber(value: number): string {
        return new Intl.NumberFormat('vi-VN').format(value);
    }

    formatDate(dateString?: string): string {
        if (!dateString) return '--';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    canApprove(): boolean {
        return this.partner?.status === PartnerStatus.Pending;
    }

    canReject(): boolean {
        return this.partner?.status === PartnerStatus.Pending;
    }

    canActivate(): boolean {
        return this.partner?.status === PartnerStatus.Approved;
    }

    onApprove(): void {
        this.showApproveModal = true;
    }

    confirmApprove(): void {
        if (!this.partner) return;
        this.isActionLoading = true;
        this._appService.partnerService.approve(this.partner.id).subscribe({
            next: (response: ApiResponse<Partner>) => {
                this.partner = response.data;
                this.isActionLoading = false;
                this.showApproveModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.APPROVED_SUCCESS'));
            },
            error: () => {
                this.isActionLoading = false;
                this.showApproveModal = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    onReject(): void {
        this.showRejectModal = true;
    }

    confirmReject(): void {
        if (!this.partner) return;
        this.isActionLoading = true;
        this._appService.partnerService.reject(this.partner.id).subscribe({
            next: (response: ApiResponse<Partner>) => {
                this.partner = response.data;
                this.isActionLoading = false;
                this.showRejectModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.REJECTED_SUCCESS'));
            },
            error: () => {
                this.isActionLoading = false;
                this.showRejectModal = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    onActivate(): void {
        this.showActivateModal = true;
    }

    confirmActivate(): void {
        if (!this.partner) return;
        this.isActionLoading = true;
        this._appService.partnerService.activate(this.partner.id).subscribe({
            next: (response: ApiResponse<Partner>) => {
                this.partner = response.data;
                this.isActionLoading = false;
                this.showActivateModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.ACTIVATED_SUCCESS'));
            },
            error: () => {
                this.isActionLoading = false;
                this.showActivateModal = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    goBack(): void {
        this._router.navigate(['/admin/partner']);
    }
}