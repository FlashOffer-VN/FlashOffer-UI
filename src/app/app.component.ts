import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    constructor(translate: TranslateService) {
        translate.setDefaultLang('vi');
        translate.use('vi');
    }
}