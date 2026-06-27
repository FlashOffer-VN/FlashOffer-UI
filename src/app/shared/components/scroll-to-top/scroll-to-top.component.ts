import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-scroll-to-top',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './scroll-to-top.component.html',
    styleUrls: ['./scroll-to-top.component.css']
})
export class ScrollToTopComponent {
    isVisible = false;

    constructor(@Inject(PLATFORM_ID) private platformId: any) { }

    @HostListener('window:scroll')
    onScroll() {
        if (isPlatformBrowser(this.platformId)) {
            const scrollY = window.scrollY || window.pageYOffset || 0;
            this.isVisible = scrollY > 300;
        }
    }

    scrollToTop() {
        if (isPlatformBrowser(this.platformId)) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }
}