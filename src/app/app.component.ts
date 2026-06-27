import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, ScrollToTopComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent {
    constructor(translate: TranslateService) {
        translate.setDefaultLang('vi');
        translate.use('vi');
    }
}