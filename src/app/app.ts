// app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routeAnimations } from './shared/animations/route.animations';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ContactFloatingComponent } from '@shared/components/contact-floating/contact-floating.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastComponent,
    ContactFloatingComponent
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