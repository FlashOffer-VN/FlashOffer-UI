import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollToTopComponent } from './shared/components/scroll-to-top/scroll-to-top.component';
import { AppService } from './core/services/app.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, ScrollToTopComponent, TranslateModule],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent {
    constructor(private app: AppService) {
        // Translate đã được init trong app.config, AppService chỉ dùng để gọi
        console.log('Current lang:', this.app.getCurrentLang());
    }
}