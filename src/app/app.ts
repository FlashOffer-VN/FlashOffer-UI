// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routeAnimations } from './shared/animations/route.animations';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ScrollToTopComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  animations: [routeAnimations]
})
export class AppComponent {
  constructor(private router: Router) { }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'] || 'default';
  }
}