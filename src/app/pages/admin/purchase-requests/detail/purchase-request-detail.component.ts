import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { PurchaseRequest, PurchaseRequestStatus } from '@core/models/purchase-request.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
    selector: 'app-admin-purchase-request-detail',
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
    templateUrl: './purchase-request-detail.component.html',
    styleUrls: ['./purchase-request-detail.component.css']
})
export class AdminPurchaseRequestDetailComponent implements OnInit {
    request: PurchaseRequest | null = null;
    isLoading = true;
    isActionLoading = false;

    // Modal
    showContactedModal = false;
    showCompletedModal = false;

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
            this._router.navigate(['/admin/purchase-requests']);
            return;
        }

        this.isLoading = true;
        this._appService.purchaseRequest.getById(id).subscribe({
            next: (response) => {
                if (!response.data) {
                    this._appService.showError(this._appService.trans('COMMON.ERROR.NOT_FOUND'));
                    this._router.navigate(['/admin/purchase-requests']);
                    return;
                }
                this.request = response.data;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                this._router.navigate(['/admin/purchase-requests']);
            }
        });
    }

    getStatusVariant(status: PurchaseRequestStatus): BadgeVariant {
        const variants: Record<PurchaseRequestStatus, BadgeVariant> = {
            [PurchaseRequestStatus.PENDING]: 'warning',
            [PurchaseRequestStatus.CONTACTED]: 'info',
            [PurchaseRequestStatus.COMPLETED]: 'success'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: PurchaseRequestStatus): string {
        const keys: Record<PurchaseRequestStatus, string> = {
            [PurchaseRequestStatus.PENDING]: 'pending',
            [PurchaseRequestStatus.CONTACTED]: 'contacted',
            [PurchaseRequestStatus.COMPLETED]: 'completed'
        };
        return keys[status] || 'pending';
    }

    formatId(id: string): string {
        return id.substring(0, 8).toUpperCase();
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

    formatPrice(value?: number | null): string {
        if (value === undefined || value === null) return '--';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);
    }

    canMarkContacted(): boolean {
        return this.request?.status === PurchaseRequestStatus.PENDING;
    }

    canComplete(): boolean {
        return this.request?.status === PurchaseRequestStatus.PENDING
            || this.request?.status === PurchaseRequestStatus.CONTACTED;
    }

    onMarkContacted(): void {
        this.showContactedModal = true;
    }

    onComplete(): void {
        this.showCompletedModal = true;
    }

    confirmContacted(): void {
        this.updateStatus(PurchaseRequestStatus.CONTACTED, 'ADMIN.PURCHASE_REQUESTS.CONTACTED_SUCCESS', () => this.showContactedModal = false);
    }

    confirmCompleted(): void {
        this.updateStatus(PurchaseRequestStatus.COMPLETED, 'ADMIN.PURCHASE_REQUESTS.COMPLETED_SUCCESS', () => this.showCompletedModal = false);
    }

    private updateStatus(status: PurchaseRequestStatus, successKey: string, closeModal: () => void): void {
        if (!this.request) return;

        this.isActionLoading = true;
        this._appService.purchaseRequest.updateStatus(this.request.id, status).subscribe({
            next: () => {
                this.isActionLoading = false;
                closeModal();
                this._appService.showSuccess(this._appService.trans(successKey));
                this.loadData();
            },
            error: () => {
                this.isActionLoading = false;
                closeModal();
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    goBack(): void {
        this._router.navigate(['/admin/purchase-requests']);
    }
}