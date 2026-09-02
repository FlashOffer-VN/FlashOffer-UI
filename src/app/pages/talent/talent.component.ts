import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-talent',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './talent.component.html',
    styleUrls: ['./talent.component.css']
})
export class TalentComponent {
    readonly outsourcingScopes = [
        { icon: '📣', title: 'TALENT_SCOPE_SALES_TITLE', description: 'TALENT_SCOPE_SALES_DESC' },
        { icon: '✍️', title: 'TALENT_SCOPE_CONTENT_TITLE', description: 'TALENT_SCOPE_CONTENT_DESC' },
        { icon: '🛠️', title: 'TALENT_SCOPE_TECH_TITLE', description: 'TALENT_SCOPE_TECH_DESC' },
        { icon: '📋', title: 'TALENT_SCOPE_OPERATIONS_TITLE', description: 'TALENT_SCOPE_OPERATIONS_DESC' }
    ];

    readonly processSteps = [
        { title: 'TALENT_PROCESS_BRIEF_TITLE', description: 'TALENT_PROCESS_BRIEF_DESC' },
        { title: 'TALENT_PROCESS_MATCH_TITLE', description: 'TALENT_PROCESS_MATCH_DESC' },
        { title: 'TALENT_PROCESS_START_TITLE', description: 'TALENT_PROCESS_START_DESC' }
    ];
}