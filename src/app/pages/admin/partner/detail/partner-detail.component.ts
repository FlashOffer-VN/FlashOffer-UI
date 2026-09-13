import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import {
    Partner,
    PartnerProduct,
    PartnerStatus,
    BusinessType,
    CompanySize,
    CommissionType,
    UpdatePartnerRequest,
    CreatePartnerProductRequest,
    UpdatePartnerProductRequest,
    getBusinessTypeLabel,
    getCompanySizeLabel,
    getCommissionTypeLabel
} from '@core/models/partner.model';
import { BusinessInfo, toBusinessInfo } from '@core/models/business-info.model';
import { ApiResponse } from '@core/models/paged-response.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { BusinessInfoComponent } from '@shared/components/business-info/business-info.component';
import { ProductListComponent } from '@shared/components/product-list/product-list.component';
import { PartnerEditFormComponent } from '../edit/partner-edit-form.component';
import { PartnerProductFormComponent } from '../edit/partner-product-form.component';

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
        ModalComponent,
        BusinessInfoComponent,
        ProductListComponent,
        PartnerEditFormComponent,
        PartnerProductFormComponent
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
    showEditModal = false;
    showProductModal = false;

    /** Bản sao của partner truyền vào form sửa — đổi reference mỗi lần mở để form dựng lại. */
    editPartner: Partner | null = null;

    /** Sản phẩm đang sửa. null = modal đang ở chế độ THÊM MỚI. */
    editingProduct: PartnerProduct | null = null;

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

    getBusinessInfo(): BusinessInfo | null {
        if (!this.partner) return null;
        return toBusinessInfo(this.partner.businessInfo ?? this.partner);
    }

    /**
     * Tên lĩnh vực hoạt động — ưu tiên field phẳng ở root (`businessFieldName`),
     * fallback sang `businessInfo.businessField` khi backend chỉ trả dạng lồng.
     */
    getBusinessFieldName(): string {
        return this.partner?.businessFieldName
            || this.partner?.businessInfo?.businessField
            || '--';
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

    // ==============================
    // EDIT
    // ==============================

    openEdit(): void {
        if (!this.partner) return;
        // Copy sang object mới để form luôn dựng lại từ dữ liệu hiện tại
        this.editPartner = { ...this.partner };
        this.showEditModal = true;
    }

    onEditSubmit(payload: UpdatePartnerRequest): void {
        if (!this.partner) return;

        // Payload luôn đủ field; form đã chặn submit khi không có thay đổi.
        this.isActionLoading = true;
        this._appService.partnerService.update(this.partner.id, payload).subscribe({
            next: () => {
                this.isActionLoading = false;
                this.showEditModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.UPDATED_SUCCESS'));
                this.loadData();
            },
            error: (err) => {
                this.isActionLoading = false;
                this._appService.showError(err?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    // ==============================
    // SẢN PHẨM (API riêng: /partners/{id}/products)
    // ==============================

    /** Mở modal THÊM sản phẩm. */
    openAddProduct(): void {
        this.editingProduct = null;
        this.showProductModal = true;
    }

    /** Mở modal SỬA sản phẩm. */
    openEditProduct(product: PartnerProduct): void {
        this.editingProduct = { ...product };
        this.showProductModal = true;
    }

    onProductCreate(payload: CreatePartnerProductRequest): void {
        if (!this.partner) return;

        this.isActionLoading = true;
        this._appService.partnerService.addProduct(this.partner.id, payload).subscribe({
            next: () => {
                this.isActionLoading = false;
                this.showProductModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.PRODUCT_ADDED_SUCCESS'));
                this.loadData();
            },
            error: (err) => {
                this.isActionLoading = false;
                this._appService.showError(err?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    onProductUpdate(payload: UpdatePartnerProductRequest): void {
        if (!this.partner || !this.editingProduct) return;

        // Payload luôn đủ field; form đã chặn submit khi không có thay đổi.
        this.isActionLoading = true;
        this._appService.partnerService
            .updateProduct(this.partner.id, this.editingProduct.id, payload)
            .subscribe({
                next: () => {
                    this.isActionLoading = false;
                    this.showProductModal = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.PRODUCT_UPDATED_SUCCESS'));
                    this.loadData();
                },
                error: (err) => {
                    this.isActionLoading = false;
                    this._appService.showError(err?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
    }

    onDeleteProduct(product: PartnerProduct): void {
        if (!this.partner) return;

        this._appService.confirmDelete(
            this._appService.trans('ADMIN.PARTNER.PRODUCT_DELETE_CONFIRM', { name: product.name })
        ).then(confirmed => {
            if (!confirmed || !this.partner) return;

            this.isActionLoading = true;
            this._appService.partnerService.deleteProduct(this.partner.id, product.id).subscribe({
                next: () => {
                    this.isActionLoading = false;
                    this._appService.showSuccess(this._appService.trans('ADMIN.PARTNER.PRODUCT_DELETED_SUCCESS'));
                    this.loadData();
                },
                error: (err) => {
                    this.isActionLoading = false;
                    this._appService.showError(err?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }
}