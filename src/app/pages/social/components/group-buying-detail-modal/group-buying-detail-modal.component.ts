// components/group-buying-detail-modal/group-buying-detail-modal.component.ts
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import { AppService } from '@core/services/app.service';
import { buildGroupBuyingShareUrl, copyToClipboard, resolveReferralCode } from '@core/utils/share-link';
import { GroupBuyingDetail, GroupBuyingStatus, JoinGroupBuyingResult } from '@core/models/group-buying-request.model';
import { AccountCreatedNoticeComponent } from '@shared/components/account-created-notice/account-created-notice.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { acquireModalLevel, releaseModalLevel } from '@core/utils/z-index';
import { TextareaComponent } from '@shared/components/textarea/textarea.component';
import { InputComponent } from '@shared/components/input/input.component';

@Component({
    selector: 'app-group-buying-detail-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, LoadingComponent, AccountCreatedNoticeComponent,
        TextareaComponent,
        InputComponent
    ],
    templateUrl: './group-buying-detail-modal.component.html',
    styleUrls: ['./group-buying-detail-modal.component.css']
})
export class GroupBuyingDetailModalComponent implements OnInit, OnChanges, OnDestroy {
    /** Tầng xếp lớp: modal mở sau luôn nằm trên modal mở trước (xem core/utils/z-index.ts) */
    modalLevel = 0;
    private _level: number | null = null;

    /** Mở/đóng modal */
    @Input() visible = false;
    /** Id yêu cầu mua chung cần xem chi tiết */
    @Input() requestId: string | null = null;
    /** Mã đơn mua chung — dùng khi mở từ link chia sẻ thay cho requestId */
    @Input() requestCode: string | null = null;
    /** Nhúng vào trang (bỏ lớp phủ, nút đóng) thay vì hiện dạng modal */
    @Input() embedded = false;
    /** Mã chia sẻ trên URL (?ref=) — trang công khai truyền vào khi khách mở link được chia sẻ */
    @Input() referralCodeFromUrl: string | null = null;

    /** Đóng modal */
    @Output() closed = new EventEmitter<void>();
    /** Đã tham gia thành công → trang gọi reload lại danh sách */
    @Output() joined = new EventEmitter<void>();

    detail: GroupBuyingDetail | null = null;
    isLoading = false;
    isSubmitting = false;
    loadError = '';

    /** Kết quả sau khi đăng ký thành công (chứa tài khoản vừa tạo cho khách) */
    joinResult: JoinGroupBuyingResult | null = null;

    /** Mã chia sẻ riêng của tài khoản đang đăng nhập — gắn vào link chia sẻ */
    myReferralCode: string | null = null;
    /** Mã chia sẻ có trên URL khi người dùng mở link do người khác chia sẻ */
    incomingReferralCode: string | null = null;

    joinForm: FormGroup;

    constructor(
        private _fb: FormBuilder,
        private _appService: AppService,
        private _router: Router
    ) {
        this.joinForm = this._fb.group({
            fullName: [''],
            phone: [''],
            zalo: [''],
            email: [''],
            note: ['']
        });
    }

    get isAuthenticated(): boolean {
        return this._appService.isAuthenticated();
    }

    get f() {
        return this.joinForm.controls;
    }

    ngOnInit(): void {
        // Trang công khai nhúng modal với [visible] = true (giá trị không đổi) nên đọc mã
        // chia sẻ ngay khi tạo component, không chỉ dựa vào ngOnChanges của `visible`.
        this.resolveReferralCodes();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']) {
            if (this.visible) {
                this._acquireLevel();
                this.resetState();
                this.applyGuestValidators();
                this.resolveReferralCodes();
                this.loadDetail();
            } else {
                this._releaseLevel();
                this.resetState();
            }
        }
    }

    ngOnDestroy(): void {
        this._releaseLevel();
    }

    /** Cấp/trả tầng xếp lớp để modal mở sau luôn nằm trên modal mở trước */
    private _acquireLevel(): void {
        if (this._level === null) {
            this._level = acquireModalLevel();
            this.modalLevel = this._level;
        }
    }

    private _releaseLevel(): void {
        if (this._level !== null) {
            releaseModalLevel(this._level);
            this._level = null;
        }
    }

    /**
     * Mã chia sẻ: lấy mã của tài khoản đang đăng nhập (để gắn vào link chia sẻ)
     * và mã có trên URL khi người dùng mở link do người khác chia sẻ.
     */
    private resolveReferralCodes(): void {
        this.incomingReferralCode = (this.referralCodeFromUrl ?? '').trim()
            || resolveReferralCode();

        if (!this.isAuthenticated) {
            this.myReferralCode = null;
            return;
        }

        this._appService.collaboratorService.getMyReferralCode()
            .subscribe((code) => this.myReferralCode = code);
    }

    loadDetail(): void {
        if (!this.requestId && !this.requestCode) return;

        this.isLoading = true;
        this.loadError = '';
        const detail$ = this.requestCode
            ? this._appService.groupBuyingRequest.getPublicDetailByCode(this.requestCode)
            : this._appService.groupBuyingRequest.getPublicDetail(this.requestId!);

        detail$
            .pipe(finalize(() => this.isLoading = false))
            .subscribe({
                next: (response) => {
                    this.detail = response?.data ?? null;
                    if (!this.detail) this.loadError = this._appService.trans('COMMON.ERROR.NOT_FOUND');
                },
                error: (error) => {
                    this.loadError = error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED');
                }
            });
    }

    /** Khách chưa đăng nhập bắt buộc nhập họ tên + SĐT (để tạo tài khoản và liên hệ) */
    private applyGuestValidators(): void {
        const guest = !this.isAuthenticated;
        const fullName = this.joinForm.get('fullName');
        const phone = this.joinForm.get('phone');
        const email = this.joinForm.get('email');

        fullName?.setValidators(guest ? [Validators.required, Validators.minLength(2)] : []);
        phone?.setValidators(guest ? [Validators.required, Validators.pattern(/^0[0-9]{9,10}$/)] : []);
        email?.setValidators(guest ? [Validators.email] : [Validators.email]);

        fullName?.updateValueAndValidity();
        phone?.updateValueAndValidity();
        email?.updateValueAndValidity();
    }

    private resetState(): void {
        this.detail = null;
        this.joinResult = null;
        this.loadError = '';
        this.isSubmitting = false;
        this.joinForm.reset();
    }

    onJoin(): void {
        if (!this.detail) return;

        if (this.joinForm.invalid) {
            this.joinForm.markAllAsTouched();
            this._appService.toast.error(this._appService.trans('GROUP_BUYING.ERROR.FORM_INVALID'));
            return;
        }

        const value = this.joinForm.value;
        // Mã chia sẻ trên link người dùng mở: ghi nhận cho người đã chia sẻ link này.
        // Đọc lại ngay lúc gửi để không phụ thuộc thời điểm modal được tạo.
        const recordReferrerCode = this.incomingReferralCode
            ?? resolveReferralCode()
            ?? undefined;
        const payload = this.isAuthenticated
            ? { note: value.note?.trim() || undefined, recordReferrerCode }
            : {
                fullName: value.fullName?.trim(),
                phone: value.phone?.trim(),
                zalo: value.zalo?.trim() || undefined,
                email: value.email?.trim() || undefined,
                note: value.note?.trim() || undefined,
                recordReferrerCode
            };

        this.isSubmitting = true;
        this._appService.groupBuyingRequest.join(this.detail.id, payload)
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe({
                next: (response) => {
                    this.joinResult = response?.data ?? null;

                    if (!response?.success || !this.joinResult) {
                        this._appService.showError(response?.errors?.[0]
                            || response?.message
                            || this._appService.trans('GROUP_BUYING.ERROR.SUBMIT_FAILED'));
                        return;
                    }

                    this._appService.showSuccess(this.joinResult.message
                        || this._appService.trans('GROUP_BUYING.SUCCESS.JOINED'));

                    this.joinForm.reset();
                    this.joined.emit();
                    this.loadDetail();
                },
                error: (error) => {
                    this._appService.showError(error?.errors?.[0]
                        || error?.message
                        || this._appService.trans('GROUP_BUYING.ERROR.SUBMIT_FAILED'));
                }
            });
    }

    /** Admin và người mở nhóm xem được liên hệ đầy đủ; người dùng khác chỉ thấy dạng che */
    get canSeeContacts(): boolean {
        return this._appService.isAdmin() || this.detail?.isMine === true;
    }

    /** Link công khai của đơn mua chung — gắn mã chia sẻ riêng của người đang đăng nhập */
    get shareUrl(): string {
        return buildGroupBuyingShareUrl(this.detail?.groupBuyingRequestCode, this.myReferralCode);
    }

    /** Chỉ chia sẻ được khi đã đăng nhập (link luôn ghi nhận mã của người chia sẻ) */
    get canShareLink(): boolean {
        return this.isAuthenticated && !!this.shareUrl;
    }

    /**
     * Người dùng mở link do người khác chia sẻ (URL có ?ref khác mã của chính họ):
     * link chia sẻ lại sẽ thay bằng mã của họ → phải xác nhận trước khi copy.
     */
    get needsReferralConfirm(): boolean {
        const incoming = (this.attributionReferralCode ?? '').toUpperCase();
        const mine = (this.myReferralCode ?? '').toUpperCase();
        return !!incoming && !!mine && incoming !== mine;
    }

    /** Mã chia sẻ đang gắn với đơn: mã trên URL, hoặc mã đã ghi nhận sẵn trên đơn */
    get attributionReferralCode(): string | null {
        return this.incomingReferralCode ?? this.detail?.recordReferrerCode ?? null;
    }

    copyShareLink(): void {
        const url = this.shareUrl;
        if (!url) return;

        if (this.needsReferralConfirm) {
            const params = { old: this.attributionReferralCode ?? '', mine: this.myReferralCode ?? '' };

            this._appService.confirm({
                title: this._appService.trans('GROUP_BUYING.DETAIL.SHARE_REF_CONFIRM_TITLE'),
                message: this._appService.trans('GROUP_BUYING.DETAIL.SHARE_REF_CONFIRM_MESSAGE', params),
                confirmText: this._appService.trans('GROUP_BUYING.DETAIL.SHARE_REF_CONFIRM_OK')
            }).then((confirmed) => {
                if (confirmed) this.writeShareLink(url);
            });
            return;
        }

        this.writeShareLink(url);
    }

    /** Copy link vào clipboard (có phương án dự phòng khi trình duyệt chặn Clipboard API) */
    private writeShareLink(url: string): void {
        const successMessage = this._appService.trans('GROUP_BUYING.DETAIL.COPY_LINK_SUCCESS');

        copyToClipboard(url).then(() => this._appService.showSuccess(successMessage));
    }

    goToLogin(): void {
        this.close();
        this._router.navigate(['/login']);
    }

    close(): void {
        this.closed.emit();
    }

    stopPropagation(event: MouseEvent): void {
        event.stopPropagation();
    }

    percent(): number {
        if (!this.detail?.targetPeopleCount) return 0;
        const value = (this.detail.currentPeopleCount / this.detail.targetPeopleCount) * 100;
        return Math.max(0, Math.min(100, Math.round(value)));
    }

    statusKey(status: GroupBuyingStatus | undefined): string {
        switch (status) {
            case GroupBuyingStatus.PENDING: return 'GROUP_BUYING.STATUS.PENDING';
            case GroupBuyingStatus.ACTIVE: return 'GROUP_BUYING.STATUS.ACTIVE';
            case GroupBuyingStatus.COMPLETED: return 'GROUP_BUYING.STATUS.COMPLETED';
            case GroupBuyingStatus.CANCELLED: return 'GROUP_BUYING.STATUS.CANCELLED';
            default: return '';
        }
    }

    statusClass(status: GroupBuyingStatus | undefined): string {
        switch (status) {
            case GroupBuyingStatus.PENDING: return 'pending';
            case GroupBuyingStatus.ACTIVE: return 'active';
            case GroupBuyingStatus.COMPLETED: return 'completed';
            default: return 'cancelled';
        }
    }
}
