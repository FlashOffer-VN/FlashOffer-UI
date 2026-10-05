// shared/components/toast/toast.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isBrowser } from '@core/utils/platform';

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
  styleUrls: ['./toast.component.css', './toast.component.mobile.css']
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
      this.startTimer?.();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startTimer() {
    // Chỉ chạy ở trình duyệt: hẹn giờ trên server khiến prerender không bao giờ ổn định (build treo)
    if (!isBrowser()) return;

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