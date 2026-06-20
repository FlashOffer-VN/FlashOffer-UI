import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'offer' | 'premium' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick.emit($event)"
      [class]="getButtonClasses()"
    >
      <span *ngIf="loading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
      <ng-content></ng-content>
    </button>
  `,
    styles: [`
    :host {
      display: inline-block;
    }
    button {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ButtonComponent {
    @Input() variant: ButtonVariant = 'primary';
    @Input() size: ButtonSize = 'md';
    @Input() type: 'button' | 'submit' | 'reset' = 'button';
    @Input() disabled = false;
    @Input() loading = false;
    @Input() fullWidth = false;
    @Output() onClick = new EventEmitter<MouseEvent>();

    private sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    private variantClasses = {
        primary: 'bg-primary hover:bg-primary-dark text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-secondary',
        success: 'bg-success hover:bg-success-dark text-white',
        danger: 'bg-danger hover:bg-danger-dark text-white',
        warning: 'bg-warning hover:bg-warning-dark text-white',
        offer: 'bg-offer hover:bg-offer-dark text-white',
        premium: 'bg-premium hover:bg-premium-dark text-secondary',
        ghost: 'text-secondary hover:bg-gray-100',
        outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
    };

    getButtonClasses(): string {
        const base = 'rounded-lg font-medium transition duration-200 inline-flex items-center justify-center';
        const size = this.sizeClasses[this.size];
        const variant = this.variantClasses[this.variant];
        const width = this.fullWidth ? 'w-full' : '';
        return `${base} ${size} ${variant} ${width}`.trim();
    }
}