import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [TranslateModule],
    template: `
        <div class="page">
            <header>
                <div>
                    <h1>{{ 'ADMIN.SETTINGS_PAGE.TITLE' | translate }}</h1>
                    <p>{{ 'ADMIN.SETTINGS_PAGE.SUBTITLE' | translate }}</p>
                </div>
                <span class="status"><i class="fa-solid fa-wrench"></i> {{ 'ADMIN.COMING_SOON' | translate }}</span>
            </header>
            <section class="settings-card">
                <div class="settings-icon"><i class="fa-solid fa-gear"></i></div>
                <div>
                    <h2>{{ 'ADMIN.SETTINGS_PAGE.CARD_TITLE' | translate }}</h2>
                    <p>{{ 'ADMIN.SETTINGS_PAGE.CARD_TEXT' | translate }}</p>
                </div>
            </section>
            <section class="checklist">
                <h2>{{ 'ADMIN.SETTINGS_PAGE.PLANNED_TITLE' | translate }}</h2>
                <div><i class="fa-solid fa-language"></i>{{ 'ADMIN.SETTINGS_PAGE.LANGUAGE' | translate }}</div>
                <div><i class="fa-solid fa-shield-halved"></i>{{ 'ADMIN.SETTINGS_PAGE.SECURITY' | translate }}</div>
                <div><i class="fa-solid fa-sliders"></i>{{ 'ADMIN.SETTINGS_PAGE.SYSTEM' | translate }}</div>
            </section>
        </div>
    `,
    styles: [`
        .page { padding: 1.5rem; color: #111827; }
        header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
        h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        header p { margin: .35rem 0 0; color: #6b7280; font-size: .875rem; }
        .status { border-radius: 999px; background: #fef3c7; color: #92400e; padding: .45rem .75rem; font-size: .75rem; font-weight: 600; white-space: nowrap; }
        .settings-card { display: flex; align-items: center; gap: 1rem; border: 1px solid #bfdbfe; border-radius: .75rem; background: linear-gradient(135deg, #eff6ff, #fff); padding: 2rem; }
        .settings-icon { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border-radius: .75rem; background: #2563eb; color: #fff; font-size: 1.4rem; }
        h2 { margin: 0; font-size: 1.125rem; font-weight: 700; }
        .settings-card p { margin: .4rem 0 0; color: #6b7280; }
        .checklist { margin-top: 1rem; border: 1px solid #e5e7eb; border-radius: .75rem; background: #fff; padding: 1.25rem; }
        .checklist h2 { margin-bottom: 1rem; }
        .checklist div { display: flex; align-items: center; gap: .75rem; border-top: 1px solid #f3f4f6; padding: .85rem 0; color: #4b5563; }
        .checklist i { width: 1.25rem; color: #2563eb; text-align: center; }
        @media (max-width: 700px) { header { flex-direction: column; } }
    `]
})
export class AdminSettingsComponent { }
