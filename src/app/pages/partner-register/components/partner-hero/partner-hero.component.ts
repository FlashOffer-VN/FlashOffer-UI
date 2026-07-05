// partner-hero/partner-hero.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-partner-hero',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './partner-hero.component.html',
  styleUrls: ['./partner-hero.component.css']
})
export class PartnerHeroComponent { }