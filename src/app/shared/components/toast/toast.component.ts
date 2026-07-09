// shared/components/toast/toast.component.ts
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
      class="toast-container"
      [class.removing]="isRemoving"
      (mouseenter)="pauseTimer()"
      (mouseleave)="resumeTimer()">
      <div class="toast-item" [class]="type">
        <!-- Content -->
        <div class="toast-content-wrapper">
          <!-- Icon -->
          <div class="toast-icon">
            <i [class]="getIconClass()"></i>
          </div>

          <!-- Content -->
          <div class="toast-content">
            <h4 *ngIf="title" class="toast-title">{{ title }}</h4>
            <p class="toast-message">{{ message }}</p>
          </div>

          <!-- Close -->
          <button
            (click)="close()"
            class="toast-close"
            aria-label="Close notification">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="toast-progress">
          <div class="toast-progress-bar" [style.width.%]="progress"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Container ===== */
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    }

    .toast-container.removing .toast-item {
      animation: slideOut 0.3s ease forwards;
    }

    /* ===== Toast Item ===== */
    .toast-item {
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      border: 1px solid #e8edf3;
      pointer-events: auto;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      overflow: hidden;
      position: relative;
    }

    .toast-item.success {
      border-left: 4px solid #10B981;
    }

    .toast-item.error {
      border-left: 4px solid #EF4444;
    }

    .toast-item.warning {
      border-left: 4px solid #F59E0B;
    }

    .toast-item.info {
      border-left: 4px solid #3B82F6;
    }

    /* ===== Content ===== */
    .toast-content-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      margin-top: 2px;
    }

    .toast-item.success .toast-icon {
      background: #d1fae5;
      color: #10B981;
    }

    .toast-item.error .toast-icon {
      background: #fee2e2;
      color: #EF4444;
    }

    .toast-item.warning .toast-icon {
      background: #fef3c7;
      color: #F59E0B;
    }

    .toast-item.info .toast-icon {
      background: #dbeafe;
      color: #3B82F6;
    }

    .toast-icon i {
      font-size: 16px;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a2a3a;
      margin: 0 0 2px;
    }

    .toast-message {
      font-size: 13px;
      color: #4a5b6e;
      margin: 0;
      word-wrap: break-word;
      line-height: 1.5;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      font-size: 20px;
      transition: color 0.2s ease;
      margin-top: -2px;
      margin-right: -4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-close:hover {
      color: #4b5563;
    }

    /* ===== Progress Bar ===== */
    .toast-progress {
      height: 3px;
      background: rgba(0, 0, 0, 0.04);
      width: 100%;
    }

    .toast-progress-bar {
      height: 100%;
      border-radius: 0 0 0 3px;
      transition: width 0.1s linear;
    }

    .toast-item.success .toast-progress-bar {
      background: #10B981;
    }

    .toast-item.error .toast-progress-bar {
      background: #EF4444;
    }

    .toast-item.warning .toast-progress-bar {
      background: #F59E0B;
    }

    .toast-item.info .toast-progress-bar {
      background: #3B82F6;
    }

    /* ===== Animations ===== */
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: translateX(calc(100% + 30px)) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes slideOut {
      0% {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateX(calc(100% + 30px)) scale(0.95);
      }
    }

    /* ===== Responsive ===== */
    @media (max-width: 640px) {
      .toast-container {
        top: 12px;
        right: 12px;
        left: 12px;
        max-width: none;
      }

      .toast-content-wrapper {
        padding: 14px 16px;
        gap: 10px;
      }

      .toast-message {
        font-size: 13px;
      }

      .toast-title {
        font-size: 13px;
      }

      .toast-icon {
        width: 24px;
        height: 24px;
        font-size: 12px;
      }

      .toast-icon i {
        font-size: 14px;
      }
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
  isRemoving = false;
  progress = 100;
  private timer: any;
  private progressInterval: any;
  private isPaused = false;

  ngOnInit() {
    if (this.duration > 0) {
      this.startTimer();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startTimer() {
    const interval = 30;
    const totalSteps = this.duration / interval;

    this.progress = 100;

    this.progressInterval = setInterval(() => {
      if (!this.isPaused) {
        this.progress = Math.max(0, this.progress - (100 / totalSteps));
        if (this.progress <= 0) {
          this.close();
        }
      }
    }, interval);

    this.timer = setTimeout(() => this.close(), this.duration);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  getIconClass(): string {
    const icons = {
      success: 'fa-regular fa-circle-check',
      error: 'fa-regular fa-circle-xmark',
      warning: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info'
    };
    return icons[this.type] || icons.info;
  }

  close() {
    if (this.isRemoving) return;

    this.isRemoving = true;
    this.clearTimer();

    setTimeout(() => {
      this.visible = false;
      this.closed.emit();
    }, 300);
  }

  pauseTimer() {
    this.isPaused = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  resumeTimer() {
    this.isPaused = false;
    if (!this.timer && this.visible && this.progress > 0) {
      const remaining = (this.progress / 100) * this.duration;
      this.timer = setTimeout(() => this.close(), remaining);
    }
  }
}