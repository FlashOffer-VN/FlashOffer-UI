// shared/components/modal/modal.component.ts
import { Component, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { acquireModalLevel, releaseModalLevel } from '@core/utils/z-index';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent],
  template: `
    <div
      *ngIf="visible"
      class="modal-layer fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      [style.--modal-level]="modalLevel"
      (click)="onBackdropClick($event)">
      <div
        class="bg-white w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 animate-slideUp"
        [class]="getSizeClass()"
        [style.max-width]="customWidth || 'auto'"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div *ngIf="showHeader" class="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <ng-content select="[modalIcon]"></ng-content>
            <h3 class="text-base sm:text-lg font-semibold text-secondary truncate">{{ title }}</h3>
          </div>
          <button
            *ngIf="showCloseButton"
            type="button"
            (click)="close()"
            [attr.aria-label]="'COMMON.BUTTON.CLOSE' | translate"
            class="shrink-0 -mr-2 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-secondary hover:bg-gray-100 transition">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Content -->
        <div data-modal-body class="flex-1 overflow-y-auto px-5 py-5 sm:px-6 modal-scroll">
          <p *ngIf="message" class="text-gray-700 text-base">{{ message }}</p>
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div *ngIf="showFooter"
          class="shrink-0 flex flex-wrap justify-end gap-3 px-5 py-4 sm:px-6 border-t border-gray-100 bg-gray-50/70">
          <app-button *ngIf="showCancel" variant="secondary" [disabled]="loading" (onClick)="onCancel()">
            {{ cancelText }}
          </app-button>
          <app-button [variant]="confirmVariant" [loading]="loading" [disabled]="loading" (onClick)="onConfirm()">
            {{ confirmText }}
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Xếp lớp dialog: dialog mở sau (tầng cao hơn) luôn nằm trên dialog mở trước */
    .modal-layer {
      z-index: calc(var(--z-modal) + var(--modal-level, 0) * var(--z-modal-step));
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    /* KHÔNG dùng transform ở animation mở modal: trong lúc animation chạy, vùng click
       nằm lệch theo transform -> click xuyên qua modal rơi xuống nội dung phía sau
       (bấm nút/ô trong popup "không ăn", bị nhảy trang). Chỉ dùng opacity. */
    @keyframes slideUp {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideUp {
      animation: slideUp 0.25s ease-out;
    }
    .modal-scroll {
      overscroll-behavior: contain;
    }
    .modal-scroll::-webkit-scrollbar {
      width: 8px;
    }
    .modal-scroll::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 999px;
    }
    .modal-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--border-strong);
    }
  `]
})
export class ModalComponent implements OnDestroy {
  /**
   * Hiện/ẩn dialog. Dùng getter/setter (không phải field thuần) vì ModalService gán
   * `instance.visible = true` trực tiếp — phải bắt mọi lần đổi trạng thái để cấp/trả "tầng"
   * xếp lớp (xem core/utils/z-index.ts), giữ quy tắc dialog mở sau luôn nằm trên dialog mở trước.
   */
  @Input()
  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    const next = value === true;
    if (next === this._visible) {
      return;
    }
    this._visible = next;
    if (next) {
      this._acquireLevel();
    } else {
      this._releaseLevel();
    }
  }

  /** Tầng z-index của dialog — truyền cho overlay qua biến CSS --modal-level */
  modalLevel = 0;

  private _visible = false;
  private _level: number | null = null;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Xác nhận';
  @Input() cancelText = 'Hủy bỏ';
  @Input() confirmVariant: 'primary' | 'danger' | 'success' | 'warning' = 'primary';
  @Input() showFooter = true;
  @Input() showCancel = true;
  @Input() loading = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() customWidth: string = '';
  @Input() showHeader: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() visibleChange = new EventEmitter<boolean>();

  private sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  getSizeClass(): string {
    return this.sizeClasses[this.size];
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closed.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.visible) {
      this.close();
    }
  }
  ngOnDestroy() {
    this._releaseLevel();
  }

  /** Cấp "tầng" cho dialog đang mở — dialog mở sau nhận tầng cao hơn */
  private _acquireLevel() {
    if (this._level === null) {
      this._level = acquireModalLevel();
      this.modalLevel = this._level;
    }
  }

  /** Trả "tầng" khi dialog đóng để dialog sau tái dùng tầng thấp nhất trống */
  private _releaseLevel() {
    if (this._level !== null) {
      releaseModalLevel(this._level);
      this._level = null;
    }
  }

}