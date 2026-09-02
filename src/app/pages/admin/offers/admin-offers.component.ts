import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-admin-offers',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        <div class="page">
            <header>
                <div>
                    <h1>{{ 'ADMIN.OFFERS.TITLE' | translate }}</h1>
                    <p>{{ 'ADMIN.OFFERS.SUBTITLE' | translate }}</p>
                </div>
                <span class="status"><i class="fa-solid fa-wrench"></i> {{ 'ADMIN.COMING_SOON' | translate }}</span>
            </header>
            <section class="hero-card">
                <div class="hero-icon"><i class="fa-solid fa-tags"></i></div>
                <div>
                    <h2>{{ 'ADMIN.OFFERS.CARD_TITLE' | translate }}</h2>
                    <p>{{ 'ADMIN.OFFERS.CARD_TEXT' | translate }}</p>
                </div>
            </section>
            <div class="preview-grid">
                <div class="preview-card"><i class="fa-solid fa-filter"></i><span>{{ 'ADMIN.OFFERS.FILTERS' | translate }}</span></div>
                <div class="preview-card"><i class="fa-solid fa-chart-line"></i><span>{{ 'ADMIN.OFFERS.REPORTS' | translate }}</span></div>
                <div class="preview-card"><i class="fa-solid fa-bell"></i><span>{{ 'ADMIN.OFFERS.NOTIFICATIONS' | translate }}</span></div>
            </div>
        </div>
    `,
    styles: [`
        .page { padding: 1.5rem; color: #111827; }
        header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
        h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        header p { margin: .35rem 0 0; color: #6b7280; font-size: .875rem; }
        .status { border-radius: 999px; background: #fef3c7; color: #92400e; padding: .45rem .75rem; font-size: .75rem; font-weight: 600; white-space: nowrap; }
        .hero-card { display: flex; align-items: center; gap: 1rem; border: 1px solid #ddd6fe; border-radius: .75rem; background: linear-gradient(135deg, #f5f3ff, #fff); padding: 2rem; }
        .hero-icon { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border-radius: .75rem; background: #7c3aed; color: #fff; font-size: 1.4rem; }
        h2 { margin: 0; font-size: 1.125rem; font-weight: 700; }
        .hero-card p { margin: .4rem 0 0; color: #6b7280; }
        .preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
        .preview-card { display: flex; align-items: center; gap: .75rem; border: 1px solid #e5e7eb; border-radius: .65rem; background: #fff; padding: 1rem; color: #4b5563; }
        .preview-card i { color: #7c3aed; }
        @media (max-width: 700px) { header { flex-direction: column; } .preview-grid { grid-template-columns: 1fr; } }
    `]
})
export class AdminOffersComponent { }
