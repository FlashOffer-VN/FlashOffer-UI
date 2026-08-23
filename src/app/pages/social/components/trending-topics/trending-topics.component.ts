// components/trending-topics/trending-topics.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-trending-topics',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        <div class="trending-section">
            <h3><i class="fas fa-fire"></i> {{ 'SOCIAL.TRENDING' | translate }}</h3>
            <div class="trending-topics">
                <span *ngFor="let topic of topics" class="trending-topic">{{ topic }}</span>
            </div>
        </div>
    `,
    styles: [`
        .trending-section {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .trending-section h3 {
            font-size: 16px;
            font-weight: 700;
            color: #1F2937;
            margin: 0 0 12px;
        }
        .trending-topics {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .trending-topic {
            padding: 6px 14px;
            background: #f3f4f6;
            border-radius: 999px;
            font-size: 13px;
            color: #1F2937;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .trending-topic:hover {
            background: #7C3AED;
            color: white;
        }
    `]
})
export class TrendingTopicsComponent {
    @Input() topics: string[] = [];
}