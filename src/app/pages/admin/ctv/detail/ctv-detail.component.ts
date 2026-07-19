import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { CtvRegistration, CTVRegistrationStatus, getCTVStatusLabel, getSalesChannelLabel } from '@core/models/ctv.model';
import { ApiResponse } from '@core/models/paged-response.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
    selector: 'app-admin-ctv-detail',
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
    templateUrl: './ctv-detail.component.html',
    styleUrls: ['./ctv-detail.component.css']
})
export class AdminCtvDetailComponent implements OnInit {
    ctv: CtvRegistration | null = null;
    isLoading = true;
    isActionLoading = false;

    // Modal
    showApproveModal = false;
    showRejectModal = false;

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
            this._appService.showError('COMMON.ERROR.INVALID_ID');
            this._router.navigate(['/admin/ctv']);
            return;
        }

        this.isLoading = true;
        this._appService.ctvService.getMockDetail(id).subscribe({
            next: (data: CtvRegistration | null) => {
                if (!data) {
                    this._appService.showError('COMMON.ERROR.NOT_FOUND');
                    this._router.navigate(['/admin/ctv']);
                    return;
                }
                this.ctv = data;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._appService.showError('COMMON.ERROR.LOAD_FAILED');
                this._router.navigate(['/admin/ctv']);
            }
        });
    }

    getStatusVariant(status: CTVRegistrationStatus): BadgeVariant {
        const variants: Record<CTVRegistrationStatus, BadgeVariant> = {
            [CTVRegistrationStatus.Pending]: 'warning',
            [CTVRegistrationStatus.Approved]: 'success',
            [CTVRegistrationStatus.Rejected]: 'danger'
        };
        return variants[status] || 'secondary';
    }

    getStatusKey(status: CTVRegistrationStatus): string {
        const keys: Record<CTVRegistrationStatus, string> = {
            [CTVRegistrationStatus.Pending]: 'pending',
            [CTVRegistrationStatus.Approved]: 'approved',
            [CTVRegistrationStatus.Rejected]: 'rejected'
        };
        return keys[status] || 'pending';
    }

    getSalesChannelLabel(channel: number | undefined): string {
        if (channel === undefined) return '--';
        return getSalesChannelLabel(channel);
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
        return this.ctv?.status === CTVRegistrationStatus.Pending;
    }

    canReject(): boolean {
        return this.ctv?.status === CTVRegistrationStatus.Pending;
    }

    onApprove(): void {
        this.showApproveModal = true;
    }

    confirmApprove(): void {
        if (!this.ctv) return;
        this.isActionLoading = true;
        this._appService.ctvService.approve(this.ctv.id).subscribe({
            next: (response: ApiResponse<CtvRegistration>) => {
                this.ctv = response.data;
                this.isActionLoading = false;
                this.showApproveModal = false;
                this._appService.showSuccess('ADMIN.CTV.APPROVED_SUCCESS');
            },
            error: () => {
                this.isActionLoading = false;
                this.showApproveModal = false;
                this._appService.showError('COMMON.ERROR.UPDATE_FAILED');
            }
        });
    }

    onReject(): void {
        this.showRejectModal = true;
    }

    confirmReject(): void {
        if (!this.ctv) return;
        this.isActionLoading = true;
        this._appService.ctvService.reject(this.ctv.id).subscribe({
            next: (response: ApiResponse<CtvRegistration>) => {
                this.ctv = response.data;
                this.isActionLoading = false;
                this.showRejectModal = false;
                this._appService.showSuccess('ADMIN.CTV.REJECTED_SUCCESS');
            },
            error: () => {
                this.isActionLoading = false;
                this.showRejectModal = false;
                this._appService.showError('COMMON.ERROR.UPDATE_FAILED');
            }
        });
    }

    goBack(): void {
        this._router.navigate(['/admin/ctv']);
    }
}