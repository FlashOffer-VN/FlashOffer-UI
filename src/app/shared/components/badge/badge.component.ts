import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeRounded = 'none' | 'sm' | 'md' | 'lg' | 'full';

@Component({
    selector: 'app-badge',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './badge.component.html',
    styleUrls: ['./badge.component.css']
})
export class BadgeComponent implements OnInit {
    @Input() status = '';
    @Input() variant: BadgeVariant = 'secondary';
    @Input() label = '';
    @Input() size: BadgeSize = 'md';
    @Input() rounded: BadgeRounded = 'full';
    @Input() showDot = true;

    private _variantMap: Record<string, BadgeVariant> = {
        'pending': 'warning',
        'approved': 'success',
        'active': 'success',
        'rejected': 'danger',
        'inactive': 'secondary',
        'completed': 'info',
        'cancelled': 'danger'
    };

    ngOnInit(): void {
        // Auto detect variant from status
        const statusLower = this.status.toLowerCase();
        if (statusLower in this._variantMap) {
            this.variant = this._variantMap[statusLower];
        }
    }

    getClasses(): string {
        const base = 'inline-flex items-center gap-1.5 font-medium transition-colors';
        const variant = this.getVariantClasses();
        const size = this.getSizeClasses();
        const rounded = this.getRoundedClasses();

        return `${base} ${variant} ${size} ${rounded}`;
    }

    getVariantClasses(): string {
        const variants: Record<BadgeVariant, string> = {
            'success': 'bg-green-100 text-green-800',
            'danger': 'bg-red-100 text-red-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'info': 'bg-blue-100 text-blue-800',
            'primary': 'bg-primary/10 text-primary',
            'secondary': 'bg-gray-100 text-gray-800'
        };
        return variants[this.variant] || variants['secondary'];
    }

    getDotClasses(): string {
        const variants: Record<BadgeVariant, string> = {
            'success': 'bg-green-600',
            'danger': 'bg-red-600',
            'warning': 'bg-yellow-600',
            'info': 'bg-blue-600',
            'primary': 'bg-primary',
            'secondary': 'bg-gray-600'
        };
        return `w-2 h-2 ${variants[this.variant] || variants['secondary']}`;
    }

    getSizeClasses(): string {
        const sizes: Record<BadgeSize, string> = {
            'sm': 'px-2 py-0.5 text-xs',
            'md': 'px-2.5 py-1 text-sm',
            'lg': 'px-3 py-1.5 text-base'
        };
        return sizes[this.size] || sizes['md'];
    }

    getRoundedClasses(): string {
        const rounded: Record<BadgeRounded, string> = {
            'none': 'rounded-none',
            'sm': 'rounded-sm',
            'md': 'rounded-md',
            'lg': 'rounded-lg',
            'full': 'rounded-full'
        };
        return rounded[this.rounded] || rounded['full'];
    }

    getLabel(): string {
        if (this.label) {
            return this.label;
        }
        // Auto translate from status
        const statusKey = this.status.toUpperCase();
        return `COMMON.STATUS.${statusKey}`;
    }
}