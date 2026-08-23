// components/social-header/social-header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-social-header',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        <div class="social-header">
            <div class="social-header__content">
                <h1><i class="fas fa-users"></i> {{ 'SOCIAL.TITLE' | translate }}</h1>
                <p>{{ 'SOCIAL.DESC' | translate }}</p>
                <div class="social-stats">
                    <div class="stat-item">
                        <strong>1,200+</strong>
                        <span>{{ 'SOCIAL.STATS_MEMBERS' | translate }}</span>
                    </div>
                    <div class="stat-item">
                        <strong>500+</strong>
                        <span>{{ 'SOCIAL.STATS_POSTS' | translate }}</span>
                    </div>
                    <div class="stat-item">
                        <strong>50+</strong>
                        <span>{{ 'SOCIAL.STATS_EVENTS' | translate }}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .social-header {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border-radius: 20px;
            padding: 40px 40px;
            margin: 20px 0 30px;
            color: white;
            position: relative;
            overflow: hidden;
        }
        .social-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(124, 58, 237, 0.2), transparent);
            border-radius: 50%;
        }
        .social-header::after {
            content: '';
            position: absolute;
            bottom: -40%;
            left: -10%;
            width: 250px;
            height: 250px;
            background: radial-gradient(circle, rgba(0, 127, 148, 0.15), transparent);
            border-radius: 50%;
        }
        .social-header__content {
            position: relative;
            z-index: 1;
        }
        .social-header h1 {
            font-size: 28px;
            font-weight: 800;
            margin: 0 0 8px;
        }
        .social-header h1 i {
            color: #A78BFA;
            margin-right: 12px;
        }
        .social-header p {
            font-size: 16px;
            opacity: 0.8;
            margin: 0 0 20px;
        }
        .social-stats {
            display: flex;
            gap: 40px;
        }
        .stat-item {
            text-align: center;
        }
        .stat-item strong {
            display: block;
            font-size: 28px;
            font-weight: 700;
        }
        .stat-item span {
            font-size: 13px;
            opacity: 0.7;
        }
        @media (max-width: 768px) {
            .social-header { padding: 32px 20px; }
            .social-header h1 { font-size: 22px; }
            .social-stats { gap: 20px; }
            .stat-item strong { font-size: 20px; }
        }
        @media (max-width: 480px) {
            .social-header h1 { font-size: 18px; }
        }
    `]
})
export class SocialHeaderComponent { }