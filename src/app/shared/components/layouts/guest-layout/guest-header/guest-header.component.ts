import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcherComponent } from '../../../language-switcher/language-switcher.component';

@Component({
    selector: 'app-guest-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
    templateUrl: './guest-header.component.html',
    styleUrls: ['./guest-header.component.css']
})
export class GuestHeaderComponent { }