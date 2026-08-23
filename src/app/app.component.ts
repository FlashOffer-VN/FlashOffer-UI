// app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { routeAnimation } from './shared/animations/animations';
import { AppService } from './core/services/app.service';
import { ToastComponent } from "@shared/components/toast/toast.component";
import { ContactFloatingComponent } from "@shared/components/contact-floating/contact-floating.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, TranslateModule, ContactFloatingComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css'],
    animations: [routeAnimation]
})
export class AppComponent implements OnInit {
    constructor(
        private app: AppService,
        private router: Router
    ) {
        console.log('Current lang:', this.app.getCurrentLang());
    }

    ngOnInit() {
        // ✅ Cuộn lên đầu khi chuyển trang
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    prepareRoute(outlet: RouterOutlet) {
        return outlet?.activatedRouteData?.['animation'] || 'default';
    }
}