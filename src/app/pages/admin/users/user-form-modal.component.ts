import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { AdminUserDetail, CreateAdminUserRequest, UpdateUserInfoRequest } from '@core/models/user.model';

import { ModalComponent } from '@shared/components/modal/modal.component';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';

/**
 * Form tài khoản ở màn quản lý người dùng, dùng cho 2 việc:
 * - Tạo tài khoản quản trị (mật khẩu do quản trị đặt, >= 8 ký tự).
 * - Sửa thông tin một tài khoản (họ tên / SĐT / email / Zalo / trạng thái) và xem hồ sơ CTV, đối tác
 *   đang liên kết (hồ sơ vẫn sửa ở màn riêng của nó).
 */
@Component({
    selector: 'app-admin-user-form',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, ModalComponent, InputComponent, ButtonComponent],
    template: `
        <app-modal [(visible)]="visible" [title]="(userId ? 'ADMIN.USERS.EDIT_TITLE' : 'ADMIN.USERS.CREATE_ADMIN_TITLE') | translate"
            size="lg" [customWidth]="'720px'" [loading]="isSaving" [confirmText]="'COMMON.BUTTON.SAVE' | translate"
            (confirm)="save()" (cancel)="close()" (closed)="close()">

            <div class="uf">
                <div class="uf__grid">
                    <div class="uf__field">
                        <app-input [(ngModel)]="form.username" [id]="'uf_username'" [required]="true"
                            [label]="'ADMIN.USERS.USERNAME' | translate" [isDisabled]="!!userId"
                            [hint]="userId ? ('ADMIN.USERS.USERNAME_LOCKED' | translate) : ''">
                        </app-input>
                    </div>

                    <div class="uf__field">
                        <app-input [(ngModel)]="form.fullName" [id]="'uf_fullname'" [required]="true"
                            [label]="'ADMIN.USERS.FULL_NAME' | translate">
                        </app-input>
                    </div>

                    <div class="uf__field">
                        <app-input [(ngModel)]="form.email" [id]="'uf_email'" [required]="true" type="email"
                            [label]="'ADMIN.USERS.EMAIL' | translate">
                        </app-input>
                    </div>

                    <div class="uf__field">
                        <app-input [(ngModel)]="form.phone" [id]="'uf_phone'" [label]="'ADMIN.USERS.PHONE' | translate">
                        </app-input>
                    </div>

                    @if (!userId) {
                        <div class="uf__field">
                            <app-input [(ngModel)]="form.password" [id]="'uf_password'" [required]="true" type="password"
                                [label]="'ADMIN.USERS.PASSWORD' | translate"
                                [hint]="'ADMIN.USERS.PASSWORD_HINT' | translate">
                            </app-input>
                        </div>
                    } @else {
                        <div class="uf__field">
                            <app-input [(ngModel)]="form.zalo" [id]="'uf_zalo'" [label]="'ADMIN.USERS.ZALO' | translate">
                            </app-input>
                        </div>

                        <label class="uf__check">
                            <input type="checkbox" [(ngModel)]="form.isActive">
                            <span>{{ 'ADMIN.USERS.IS_ACTIVE' | translate }}</span>
                        </label>
                    }
                </div>

                @if (userId) {
                    <div class="uf__linked">
                        <p class="uf__section">{{ 'ADMIN.USERS.LINKED_PROFILES' | translate }}</p>

                        @if (isLoading) {
                            <p class="uf__empty">{{ 'COMMON.LOADING' | translate }}</p>
                        } @else if (!detail?.collaborator && !detail?.partner) {
                            <p class="uf__empty">{{ 'ADMIN.USERS.NO_LINKED_PROFILE' | translate }}</p>
                        } @else {
                            <div class="uf__grid">
                                @if (detail?.collaborator) {
                                    <div class="uf__card">
                                        <p class="uf__card-title">{{ 'ADMIN.USERS.COLLABORATOR_PROFILE' | translate }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.CODE' | translate }}: <strong>{{ detail!.collaborator!.collaboratorCode || '—' }}</strong></p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.REFERRAL_CODE' | translate }}: {{ detail!.collaborator!.referralCode || '—' }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.POSITION' | translate }}: {{ detail!.collaborator!.position || '—' }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.BUSINESS' | translate }}: {{ detail!.collaborator!.businessName || '—' }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.STATUS' | translate }}:
                                            @if (detail!.collaborator!.isApproved) {
                                                <span class="uf__badge uf__badge--ok">{{ 'ADMIN.USERS.APPROVED' | translate }}</span>
                                            } @else {
                                                <span class="uf__badge">{{ 'ADMIN.USERS.PENDING' | translate }}</span>
                                            }
                                        </p>
                                    </div>
                                }

                                @if (detail?.partner) {
                                    <div class="uf__card">
                                        <p class="uf__card-title">{{ 'ADMIN.USERS.PARTNER_PROFILE' | translate }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.CODE' | translate }}: <strong>{{ detail!.partner!.partnerCode }}</strong></p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.COMPANY' | translate }}: {{ detail!.partner!.companyName || '—' }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.POSITION' | translate }}: {{ detail!.partner!.position || '—' }}</p>
                                        <p class="uf__row">{{ 'ADMIN.USERS.STATUS' | translate }}: {{ detail!.partner!.status }}</p>
                                    </div>
                                }
                            </div>

                            <p class="uf__note">{{ 'ADMIN.USERS.LINKED_PROFILE_HINT' | translate }}</p>
                        }
                    </div>
                }
            </div>
        </app-modal>
    `,
    styles: [`
        .uf__grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .uf__field {
            min-width: 0;
        }

        .uf__check {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.875rem;
            color: var(--text-secondary);
            cursor: pointer;
        }

        .uf__linked {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px dashed var(--border);
        }

        .uf__section {
            font-size: 0.6875rem;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 8px;
        }

        .uf__card {
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            background: var(--surface-soft);
        }

        .uf__card-title {
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--text-strong);
            margin-bottom: 6px;
        }

        .uf__row {
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin: 2px 0;
        }

        .uf__badge {
            display: inline-block;
            padding: 1px 8px;
            border-radius: 9999px;
            font-size: 0.6875rem;
            background: var(--warning-soft);
            color: var(--warning-deep);
        }

        .uf__badge--ok {
            background: var(--success-bg-soft);
            color: var(--success-strong);
        }

        .uf__empty,
        .uf__note {
            font-size: 0.8125rem;
            color: var(--text-muted);
        }

        .uf__note {
            margin-top: 8px;
        }

        @media (max-width: 640px) {
            .uf__grid {
                grid-template-columns: minmax(0, 1fr);
            }
        }
    `]
})
export class AdminUserFormComponent implements OnInit {
    /** Id tài khoản cần sửa; bỏ trống = tạo tài khoản quản trị mới. */
    @Input() userId: string | null = null;

    @Input() visible = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saved = new EventEmitter<void>();

    form: { username: string; fullName: string; email: string; phone: string; password: string; zalo: string; isActive: boolean } = {
        username: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        zalo: '',
        isActive: true
    };

    detail: AdminUserDetail | null = null;
    isLoading = false;
    isSaving = false;

    /** Mật khẩu tối thiểu — khớp MinPasswordLength của API. */
    private readonly _minPasswordLength = 8;

    constructor(private readonly _appService: AppService) { }

    /** Cha chỉ tạo component khi mở form (kèm userId) nên nạp chi tiết ngay tại đây. */
    ngOnInit(): void {
        if (this.userId) {
            this.loadDetail(this.userId);
        }
    }

    loadDetail(userId: string): void {
        this.isLoading = true;
        this._appService.userService.getDetail(userId).subscribe({
            next: response => {
                this.detail = response.data;
                this.isLoading = false;

                const user = response.data?.user;
                if (user) {
                    this.form = {
                        username: user.username,
                        fullName: user.fullName ?? '',
                        email: user.email ?? '',
                        phone: user.phone ?? '',
                        password: '',
                        zalo: user.zalo ?? '',
                        isActive: user.isActive
                    };
                }
            },
            error: () => {
                this.isLoading = false;
                this._appService.showError(this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    save(): void {
        this.userId ? this.saveEdit(this.userId) : this.saveCreate();
    }

    close(): void {
        this.visible = false;
        this.visibleChange.emit(false);
        this.reset();
    }

    private saveCreate(): void {
        if (!this.form.username.trim() || !this.form.fullName.trim() || !this.form.email.trim()) {
            this._appService.showError(this._appService.trans('ADMIN.USERS.REQUIRED_FIELDS'));
            return;
        }
        if (this.form.password.trim().length < this._minPasswordLength) {
            this._appService.showError(this._appService.trans('ADMIN.USERS.PASSWORD_TOO_SHORT', { length: this._minPasswordLength }));
            return;
        }

        const body: CreateAdminUserRequest = {
            username: this.form.username.trim(),
            fullName: this.form.fullName.trim(),
            email: this.form.email.trim(),
            phone: this.form.phone.trim() || null,
            password: this.form.password.trim()
        };

        this.isSaving = true;
        this._appService.userService.createAdmin(body).subscribe({
            next: () => {
                this.isSaving = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.USERS.CREATE_ADMIN_SUCCESS'));
                this.saved.emit();
                this.close();
            },
            error: error => this.onSaveError(error)
        });
    }

    private saveEdit(userId: string): void {
        if (!this.form.fullName.trim()) {
            this._appService.showError(this._appService.trans('ADMIN.USERS.REQUIRED_FIELDS'));
            return;
        }

        const body: UpdateUserInfoRequest = {
            fullName: this.form.fullName.trim(),
            phone: this.form.phone.trim() || null,
            email: this.form.email.trim() || null,
            zalo: this.form.zalo.trim() || null,
            isActive: this.form.isActive
        };

        this.isSaving = true;
        this._appService.userService.updateInfo(userId, body).subscribe({
            next: () => {
                this.isSaving = false;
                this._appService.showSuccess(this._appService.trans('ADMIN.USERS.UPDATE_SUCCESS'));
                this.saved.emit();
                this.close();
            },
            error: error => this.onSaveError(error)
        });
    }

    private onSaveError(error: { error?: { message?: string } }): void {
        this.isSaving = false;
        this._appService.showError(error?.error?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
    }

    private reset(): void {
        this.detail = null;
        this.form = { username: '', fullName: '', email: '', phone: '', password: '', zalo: '', isActive: true };
    }
}
