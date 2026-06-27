import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-community',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.css']
})
export class CommunityComponent { }