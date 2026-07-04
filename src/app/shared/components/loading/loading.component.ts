import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingType = 'dots' | 'spinner' | 'skeleton' | 'pulse' | 'logo' | 'community';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Fullscreen với Community Icon -->
    <div *ngIf="fullScreen" class="fixed inset-0 bg-white/70 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div class="text-center space-y-6 p-8 bg-white/90 rounded-2xl shadow-xl max-w-sm w-full mx-4">
        <!-- Community Icon -->
        <div class="community-icon inline-block">
          <svg viewBox="0 0 100 100" class="w-24 h-24 md:w-32 md:h-32 mx-auto">
            <!-- Vòng tròn kết nối -->
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="8 4" class="text-primary/30"/>
            
            <!-- Người 1 -->
            <circle cx="30" cy="35" r="9" fill="currentColor" class="text-primary/70"/>
            <path d="M18 62 Q30 45 42 62" fill="currentColor" class="text-primary/70"/>
            
            <!-- Người 2 (trung tâm - nổi bật) -->
            <circle cx="50" cy="28" r="11" fill="currentColor" class="text-primary"/>
            <path d="M35 58 Q50 38 65 58" fill="currentColor" class="text-primary"/>
            
            <!-- Người 3 -->
            <circle cx="70" cy="35" r="9" fill="currentColor" class="text-primary/70"/>
            <path d="M58 62 Q70 45 82 62" fill="currentColor" class="text-primary/70"/>
            
            <!-- Tia chớp nhỏ ở trung tâm -->
            <path d="M48 16 L40 34 L50 34 L44 48 L58 30 L48 30 Z" fill="currentColor" class="text-accent"/>
          </svg>
        </div>
        
        <!-- Text -->
        <h1 class="text-2xl md:text-3xl font-bold text-secondary">
          Kindi
        </h1>
        <p class="text-gray-500 text-sm">{{ text || 'Đang kết nối cộng đồng...' }}</p>
        
        <!-- Loading dots -->
        <div class="flex justify-center gap-2">
          <span class="dot-loading" style="animation-delay: 0s"></span>
          <span class="dot-loading" style="animation-delay: 0.2s"></span>
          <span class="dot-loading" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    </div>

    <!-- Normal loading -->
    <ng-container *ngIf="!fullScreen">
      <!-- Dots -->
      <div *ngIf="type === 'dots'" class="flex items-center justify-center">
        <div class="flex gap-2">
          <div *ngFor="let dot of [0,1,2,3,4,5]" class="dot" [style.animation-delay]="dot * 0.1 + 's'" [class]="getDotClasses()"></div>
        </div>
        <span *ngIf="text" class="ml-3 text-gray-500 text-sm">{{ text }}</span>
      </div>

      <!-- Spinner -->
      <div *ngIf="type === 'spinner'" class="flex items-center justify-center">
        <div class="spinner" [class]="getSpinnerClasses()"></div>
        <span *ngIf="text" class="ml-3 text-gray-500 text-sm">{{ text }}</span>
      </div>

      <!-- Skeleton -->
      <div *ngIf="type === 'skeleton'" class="w-full space-y-3">
        <div class="skeleton-line" style="width: 100%; height: 20px;"></div>
        <div class="skeleton-line" style="width: 80%; height: 20px;"></div>
        <div class="skeleton-line" style="width: 60%; height: 20px;"></div>
      </div>

      <!-- Pulse -->
      <div *ngIf="type === 'pulse'" class="flex items-center justify-center">
        <div class="pulse-dot" [class]="getPulseClasses()"></div>
        <span *ngIf="text" class="ml-3 text-gray-500 text-sm">{{ text }}</span>
      </div>

      <!-- Logo -->
      <div *ngIf="type === 'logo'" class="flex items-center justify-center flex-col gap-3">
        <div class="logo-icon">
          <i class="fa-solid fa-bolt text-5xl" [class]="getColorText()"></i>
        </div>
        <span *ngIf="text" class="text-gray-500 text-sm">{{ text }}</span>
      </div>

      <!-- Community (small version) -->
      <div *ngIf="type === 'community' && !fullScreen" class="flex items-center justify-center flex-col gap-3">
        <div class="community-icon-sm">
          <svg viewBox="0 0 100 100" class="w-14 h-14">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="8 4" class="text-primary/30"/>
            <circle cx="30" cy="35" r="9" fill="currentColor" class="text-primary/70"/>
            <path d="M18 62 Q30 45 42 62" fill="currentColor" class="text-primary/70"/>
            <circle cx="50" cy="28" r="11" fill="currentColor" class="text-primary"/>
            <path d="M35 58 Q50 38 65 58" fill="currentColor" class="text-primary"/>
            <circle cx="70" cy="35" r="9" fill="currentColor" class="text-primary/70"/>
            <path d="M58 62 Q70 45 82 62" fill="currentColor" class="text-primary/70"/>
            <path d="M48 16 L40 34 L50 34 L44 48 L58 30 L48 30 Z" fill="currentColor" class="text-accent"/>
          </svg>
        </div>
        <span *ngIf="text" class="text-gray-500 text-sm">{{ text }}</span>
      </div>
    </ng-container>
  `,
  styles: [`
    /* ===== DOTS ===== */
    .dot {
      border-radius: 50%;
      animation: flow 1.2s ease-in-out infinite;
      transform: translateY(0);
    }
    @keyframes flow {
      0%, 100% { transform: translateY(0); opacity: 0.3; }
      50% { transform: translateY(-12px); opacity: 1; }
    }

    /* ===== SPINNER ===== */
    .spinner {
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      border-style: solid;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinner-sm { width: 20px; height: 20px; border-width: 3px; }
    .spinner-md { width: 32px; height: 32px; border-width: 4px; }
    .spinner-lg { width: 48px; height: 48px; border-width: 5px; }

    /* ===== SKELETON ===== */
    .skeleton-line {
      border-radius: 6px;
      animation: shimmer 1.5s ease-in-out infinite;
      background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%);
      background-size: 200% 100%;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* ===== PULSE ===== */
    .pulse-dot {
      border-radius: 50%;
      animation: pulse-ring 1.5s ease-out infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.7; }
      50% { transform: scale(1.2); opacity: 0.3; }
      100% { transform: scale(0.8); opacity: 0.7; }
    }
    .pulse-sm { width: 16px; height: 16px; }
    .pulse-md { width: 24px; height: 24px; }
    .pulse-lg { width: 36px; height: 36px; }

    /* ===== LOGO ===== */
    .logo-icon {
      animation: logoPulse 1.5s ease-in-out infinite;
    }
    @keyframes logoPulse {
      0%, 100% { transform: scale(1) rotate(0deg); }
      25% { transform: scale(1.1) rotate(-8deg); }
      50% { transform: scale(1) rotate(0deg); }
      75% { transform: scale(1.1) rotate(8deg); }
    }

    /* ===== COMMUNITY ===== */
    .community-icon {
      animation: communityFloat 2.5s ease-in-out infinite;
    }
    .community-icon-sm {
      animation: communityFloat 1.5s ease-in-out infinite;
    }
    @keyframes communityFloat {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-6px) scale(1.02); }
    }

    .dot-loading {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #7C3AED;
      animation: dotBounce 1.2s ease-in-out infinite;
    }
    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class LoadingComponent {
  @Input() type: LoadingType = 'community';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: string = 'primary';
  @Input() text: string = '';
  @Input() fullScreen = false;

  private sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  private spinnerSizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg'
  };

  private pulseSizeClasses = {
    sm: 'pulse-sm',
    md: 'pulse-md',
    lg: 'pulse-lg'
  };

  private colorClasses = {
    primary: 'bg-primary border-primary text-primary',
    white: 'bg-white border-white text-white',
    secondary: 'bg-secondary border-secondary text-secondary',
    accent: 'bg-accent border-accent text-accent',
    success: 'bg-success border-success text-success',
    danger: 'bg-danger border-danger text-danger',
    warning: 'bg-warning border-warning text-warning',
    info: 'bg-info border-info text-info',
    offer: 'bg-offer border-offer text-offer',
    premium: 'bg-premium border-premium text-premium'
  };

  getDotClasses(): string {
    const size = this.sizeClasses[this.size];
    const color = this.colorClasses[this.color as keyof typeof this.colorClasses]?.split(' ')[0] || this.colorClasses.primary.split(' ')[0];
    return `${size} ${color}`;
  }

  getSpinnerClasses(): string {
    const size = this.spinnerSizeClasses[this.size];
    const color = this.colorClasses[this.color as keyof typeof this.colorClasses]?.split(' ')[1] || this.colorClasses.primary.split(' ')[1];
    return `${size} border-t-transparent ${color}`;
  }

  getPulseClasses(): string {
    const size = this.pulseSizeClasses[this.size];
    const color = this.colorClasses[this.color as keyof typeof this.colorClasses]?.split(' ')[0] || this.colorClasses.primary.split(' ')[0];
    return `${size} ${color}`;
  }

  getColorText(): string {
    return this.colorClasses[this.color as keyof typeof this.colorClasses]?.split(' ')[2] || this.colorClasses.primary.split(' ')[2];
  }
}