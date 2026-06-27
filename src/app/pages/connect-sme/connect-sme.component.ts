import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-connect-sme',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './connect-sme.component.html',
    styleUrls: ['./connect-sme.component.css']
})
export class ConnectSmeComponent { }