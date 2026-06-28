import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppService } from '../../core/services/app.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-community',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.css']
})
export class CommunityComponent {
    constructor(private _appService: AppService) {
    }
}