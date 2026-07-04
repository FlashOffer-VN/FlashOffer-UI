// components/partner-hero/partner-hero.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-partner-hero',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
    <section class="partner-hero">
      <div class="partner-hero__content">
        <span class="partner-badge">{{ 'PARTNER.BADGE' | translate }}</span>
        <h1>{{ 'PARTNER.TITLE' | translate }}</h1>
        <p>{{ 'PARTNER.DESC' | translate }}</p>
      </div>
    </section>
  `,
    styles: [`
    .partner-hero {
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      padding: 4rem 2rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .partner-hero::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: rgba(124, 58, 237, 0.1);
      border-radius: 50%;
    }

    .partner-hero::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 400px;
      height: 400px;
      background: rgba(236, 72, 153, 0.08);
      border-radius: 50%;
    }

    .partner-hero__content {
      position: relative;
      z-index: 1;
      max-width: 800px;
      margin: 0 auto;
    }

    .partner-badge {
      display: inline-block;
      background: rgba(124, 58, 237, 0.2);
      color: #A78BFA;
      padding: 0.5rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(124, 58, 237, 0.3);
    }

    .partner-hero h1 {
      color: white;
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .partner-hero h1 span {
      color: #A78BFA;
    }

    .partner-hero p {
      color: #9CA3AF;
      font-size: 1.25rem;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .partner-hero {
        padding: 2.5rem 1.5rem;
      }

      .partner-hero h1 {
        font-size: 2rem;
      }

      .partner-hero p {
        font-size: 1rem;
      }
    }
  `]
})
export class PartnerHeroComponent { }