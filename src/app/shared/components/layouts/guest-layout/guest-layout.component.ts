import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GuestFooterComponent } from './guest-footer/guest-footer.component';
import { GuestHeaderComponent } from './guest-header/guest-header.component';
import { ContactFloatingComponent } from '../../contact-floating/contact-floating.component';

@Component({
    selector: 'app-guest-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, TranslateModule, GuestHeaderComponent, GuestFooterComponent, ContactFloatingComponent],
    templateUrl: './guest-layout.component.html',
    styleUrls: ['./guest-layout.component.css']
})
export class GuestLayoutComponent { }