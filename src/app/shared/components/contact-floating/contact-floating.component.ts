import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-contact-floating',
    standalone: true,
    templateUrl: './contact-floating.component.html',
    styleUrls: ['./contact-floating.component.css']
})
export class ContactFloatingComponent {
    phone = '0363656223';
    phoneDisplay = '0363 656 223';
    email = 'info@kindi.vn';

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