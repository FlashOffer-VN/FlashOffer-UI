// shared/animations/animations.ts
import {
    trigger,
    transition,
    style,
    animate,
    query,
    stagger,
    keyframes,
    state
} from '@angular/animations';

// ✅ Animation cho route transition
export const routeAnimation = trigger('routeAnimation', [
    transition('* <=> *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true }),
        query(':leave', [
            style({ opacity: 1, transform: 'translateY(0)' }),
            animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
        ], { optional: true })
    ])
]);

// ✅ Fade In/Out
export const fadeInOut = trigger('fadeInOut', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
    ]),
    transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
    ])
]);

// ✅ Slide In (từ dưới lên)
export const slideInUp = trigger('slideInUp', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
    ])
]);

// ✅ Slide In (từ trái sang)
export const slideInLeft = trigger('slideInLeft', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
]);

// ✅ Slide In (từ phải sang)
export const slideInRight = trigger('slideInRight', [
    transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
]);

// ✅ Scale In
export const scaleIn = trigger('scaleIn', [
    transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
    ])
]);

// ✅ Stagger List (xuất hiện lần lượt)
export const staggerList = trigger('staggerList', [
    transition('* => *', [
        query(':enter', [
            style({ opacity: 0, transform: 'translateY(20px)' }),
            stagger('80ms', [
                animate('400ms ease-out',
                    style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ], { optional: true })
    ])
]);

// ✅ Card Hover
export const cardHover = trigger('cardHover', [
    state('default', style({
        transform: 'scale(1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    })),
    state('hover', style({
        transform: 'scale(1.02)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)'
    })),
    transition('default <=> hover', animate('200ms ease-in-out'))
]);

// ✅ Pulse (nhấp nháy)
export const pulse = trigger('pulse', [
    transition('* => *', [
        animate('1s ease-in-out', keyframes([
            style({ opacity: 1, transform: 'scale(1)' }),
            style({ opacity: 0.7, transform: 'scale(0.95)' }),
            style({ opacity: 1, transform: 'scale(1)' })
        ]))
    ])
]);

// ✅ Shake (lắc)
export const shake = trigger('shake', [
    transition('* => *', [
        animate('0.5s ease-in-out', keyframes([
            style({ transform: 'translateX(0)' }),
            style({ transform: 'translateX(-10px)' }),
            style({ transform: 'translateX(10px)' }),
            style({ transform: 'translateX(-6px)' }),
            style({ transform: 'translateX(6px)' }),
            style({ transform: 'translateX(0)' })
        ]))
    ])
]);

// ✅ Skeleton Loading
export const skeletonLoading = trigger('skeletonLoading', [
    transition('* => *', [
        animate('1.5s ease-in-out', keyframes([
            style({ opacity: 0.4 }),
            style({ opacity: 0.8 }),
            style({ opacity: 0.4 })
        ]))
    ])
]);