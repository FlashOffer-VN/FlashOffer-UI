import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { CtvRegistration, CTVRegistrationStatus } from '@core/models/ctv.model';
import { ApiResponse } from '@core/models/paged-response.model';

// Shared Components
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { BadgeComponent, BadgeVariant } from '@shared/components/badge/badge.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

@Component({
    selector: 'app-admin-collaborator-detail',
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
    templateUrl: './collaborator-detail.component.html',
    styleUrls: ['./collaborator-detail.component.css']
})
export class AdminCollaboratorDetailComponent implements OnInit {
    collaborator: CtvRegistration | null = null;
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
            this._appService.showError(this._appService.trans('COMMON.ERROR.INVALID_ID'));
            this._router.navigate(['/admin/collaborator']);
            return;
        }

        this.isLoading = true;
        this._appService.ctvService.getDetail(id).subscribe({
            next: (response: ApiResponse<CtvRegistration>) => {
                if (!response.data) {
                    this._appService.showError(this._appService.trans('COMMON.ERROR.NOT_FOUND'));
                    this._router.navigate(['/admin/collaborator']);
                    return;
                }
                this.collaborator = response.data;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
                this._router.navigate(['/admin/collaborator']);
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
        return this.collaborator?.status === CTVRegistrationStatus.Pending;
    }

    canReject(): boolean {
        return this.collaborator?.status === CTVRegistrationStatus.Pending;
    }

    onApprove(): void {
        this.showApproveModal = true;
    }

    confirmApprove(): void {
        if (!this.collaborator) return;
        this.isActionLoading = true;
        this._appService.ctvService.approve(this.collaborator.id).subscribe({
            next: (response: ApiResponse<CtvRegistration>) => {
                this.collaborator = response.data;
                this.isActionLoading = false;
                this.showApproveModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.CTV.APPROVED_SUCCESS'));
                this.loadData();
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
        if (!this.collaborator) return;
        this.isActionLoading = true;
        this._appService.ctvService.reject(this.collaborator.id).subscribe({
            next: (response: ApiResponse<CtvRegistration>) => {
                this.collaborator = response.data;
                this.isActionLoading = false;
                this.showRejectModal = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.CTV.REJECTED_SUCCESS'));
                this.loadData();
            },
            error: () => {
                this.isActionLoading = false;
                this.showRejectModal = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    goBack(): void {
        this._router.navigate(['/admin/collaborator']);
    }
}