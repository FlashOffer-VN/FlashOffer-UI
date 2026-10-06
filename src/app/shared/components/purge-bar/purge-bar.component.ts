import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { TrashEntity, TRASH_PERMISSION } from '@core/models/trash.model';

import { ButtonComponent } from '@shared/components/button/button.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

/** Khoảng ngày nhận từ bộ chọn ngày dùng chung (`{ from, to }`, rỗng = không giới hạn). */
interface PurgeDateRange {
    from: string | null;
    to: string | null;
}

/**
 * Thanh xoá VĨNH VIỄN dùng chung cho màn "Đã xoá" của các nghiệp vụ.
 *
 * Chỉ hiện khi người dùng có quyền xoá vĩnh viễn của nghiệp vụ đó. Hai cách xoá:
 * - Theo KHOẢNG NGÀY xoá mềm (dùng bộ chọn ngày chung của app).
 * - Theo LỰA CHỌN: các dòng được tick ở màn cha truyền vào qua <c>selectedIds</c>.
 *
 * Luôn xác nhận trước khi xoá (không hoàn tác được) và phát <c>purged</c> để màn cha nạp lại danh sách.
 */
@Component({
    selector: 'app-purge-bar',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, ButtonComponent, NgxFilterDaterangeComponent],
    template: `
        <div class="purge" *ngIf="canPurge()">
            <div class="purge__note">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>{{ 'COMMON.PURGE.WARNING' | translate }}</span>
            </div>

            <div class="purge__actions">
                <ngx-filter-daterange [from]="fromDate" [to]="toDate" (rangeChange)="onRangeChange($event)">
                </ngx-filter-daterange>

                <app-button variant="danger" [loading]="isPurging" [disabled]="!hasRange()" (click)="purgeByRange()">
                    <i class="fa-solid fa-trash-can mr-1"></i>{{ 'COMMON.PURGE.BY_RANGE' | translate }}
                </app-button>

                <app-button *ngIf="showSelection" variant="danger" [loading]="isPurging"
                    [disabled]="selectedIds.length === 0" (click)="purgeSelected()">
                    <i class="fa-solid fa-trash-can mr-1"></i>
                    {{ 'COMMON.PURGE.SELECTED' | translate: { count: selectedIds.length } }}
                </app-button>
            </div>
        </div>
    `,
    styles: [`
        .purge {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;
            padding: 12px 14px;
            border: 1px solid var(--danger-border);
            border-radius: 0.5rem;
            background: var(--danger-bg-soft);
        }

        .purge__note {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8125rem;
            color: var(--danger-deep);
        }

        .purge__actions {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-end;
            gap: 12px;
        }

        @media (max-width: 640px) {
            .purge__actions {
                flex-direction: column;
                align-items: stretch;
            }
        }
    `]
})
export class PurgeBarComponent {
    /** Nghiệp vụ đang xem (khớp route /api/v1/admin/trash/{entity}). */
    @Input() entity!: TrashEntity;

    /** Các dòng đang được tick ở màn cha (rỗng = chưa chọn dòng nào). */
    @Input() selectedIds: string[] = [];

    /** Nhãn nghiệp vụ để hiện trong câu hỏi xác nhận (bỏ trống thì dùng tên nghiệp vụ). */
    @Input() entityLabel = '';

    /** Màn cha có tick chọn dòng không (chưa có cột chọn thì ẩn nút xoá theo lựa chọn). */
    @Input() showSelection = false;

    @Output() purged = new EventEmitter<number>();

    fromDate: string | null = null;
    toDate: string | null = null;
    isPurging = false;

    constructor(private readonly _appService: AppService) { }

    /** Chỉ hiện thanh xoá khi có quyền xoá vĩnh viễn của nghiệp vụ này. */
    canPurge(): boolean {
        return this._appService.permissionService.has(TRASH_PERMISSION[this.entity]);
    }

    hasRange(): boolean {
        return !!this.fromDate || !!this.toDate;
    }

    onRangeChange(range: PurgeDateRange): void {
        this.fromDate = range?.from ?? null;
        this.toDate = range?.to ?? null;
    }

    /** Xoá vĩnh viễn mọi bản ghi ĐÃ XOÁ MỀM trong khoảng ngày đang chọn. */
    purgeByRange(): void {
        if (!this.hasRange()) {
            return;
        }

        const range = `${this.fromDate ?? '(không giới hạn)'} → ${this.toDate ?? '(không giới hạn)'}`;
        this.confirmAndPurge(
            { fromDate: this.fromDate, toDate: this.toDate },
            this._appService.trans('COMMON.PURGE.CONFIRM_RANGE', { range: range }));
    }

    /** Xoá vĩnh viễn các dòng đang được tick. */
    purgeSelected(): void {
        if (this.selectedIds.length === 0) {
            return;
        }

        this.confirmAndPurge(
            { ids: [...this.selectedIds] },
            this._appService.trans('COMMON.PURGE.CONFIRM_SELECTED', { count: this.selectedIds.length }));
    }

    private confirmAndPurge(body: { ids?: string[]; fromDate?: string | null; toDate?: string | null }, message: string): void {
        this._appService.modal.confirm({
            title: this._appService.trans('COMMON.PURGE.CONFIRM_TITLE'),
            message: message,
            confirmText: this._appService.trans('COMMON.PURGE.CONFIRM_BUTTON'),
            cancelText: this._appService.trans('COMMON.BUTTON.CANCEL')
        }).then(confirmed => {
            if (!confirmed) {
                return;
            }

            this.isPurging = true;

            this._appService.trashService.purge(this.entity, body).subscribe({
                next: response => {
                    this.isPurging = false;
                    this.fromDate = null;
                    this.toDate = null;
                    this._appService.showSuccess(this._appService.trans('COMMON.PURGE.SUCCESS', { count: response.data?.deletedCount ?? 0 }));
                    this.purged.emit(response.data?.deletedCount ?? 0);
                },
                error: error => {
                    this.isPurging = false;
                    // Lỗi nghiệp vụ (thiếu điều kiện, còn dữ liệu liên kết...) do API trả về, hiện nguyên văn.
                    this._appService.showError(error?.error?.message || this._appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }
}
