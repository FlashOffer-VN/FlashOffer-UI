import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="fixed top-4 right-4 z-50 max-w-sm w-full animate-slideIn">
      <div class="bg-white rounded-xl shadow-xl overflow-hidden">
        <!-- Viền trái màu status -->
        <div class="flex items-start gap-3 p-4 border-l-4"
             [class]="getBorderClass()">
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5">
            <i [class]="getIconClass()"></i>
          </div>

          <!-- Content -->
          <div class="flex-1">
            <h4 *ngIf="title" class="font-semibold text-sm text-gray-800">
              {{ title }}
            </h4>
            <p class="text-sm text-gray-600">{{ message }}</p>
          </div>

          <!-- Close -->
          <button
            (click)="close()"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition">
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(80px) scale(0.95); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }
    .animate-slideIn {
      animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() type: ToastType = 'success';
  @Input() message = '';
  @Input() title = '';
  @Input() duration = 3000;
  @Output() closed = new EventEmitter<void>();

  visible = true;
  private timer: any;

  private typeConfig = {
    success: {
      border: 'border-success',
      icon: 'fa-regular fa-circle-check text-success text-xl'
    },
    error: {
      border: 'border-danger',
      icon: 'fa-regular fa-circle-xmark text-danger text-xl'
    },
    warning: {
      border: 'border-warning',
      icon: 'fa-solid fa-triangle-exclamation text-warning text-xl'
    },
    info: {
      border: 'border-info',
      icon: 'fa-solid fa-circle-info text-info text-xl'
    }
  };

  ngOnInit() {
    if (this.duration > 0) {
      this.timer = setTimeout(() => this.close(), this.duration);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  getBorderClass() {
    return this.typeConfig[this.type].border;
  }

  getIconClass() {
    return this.typeConfig[this.type].icon;
  }

  close() {
    this.visible = false;
    this.closed.emit();
  }
}