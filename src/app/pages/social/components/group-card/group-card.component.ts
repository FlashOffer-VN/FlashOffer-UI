// components/group-card/group-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialGroup } from '@core/models/social.model';

@Component({
    selector: 'app-group-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="group-card">
            <div class="group-card__icon">
                <i [class]="group.icon"></i>
                <span *ngIf="group.isPrivate" class="private-badge"><i class="fas fa-lock"></i></span>
            </div>
            <h3>{{ group.name }}</h3>
            <p>{{ group.description }}</p>
            <div class="group-card__stats">
                <span><i class="fas fa-users"></i> {{ group.members }}</span>
                <span><i class="fas fa-file-alt"></i> {{ group.posts }}</span>
            </div>
            <button class="join-btn" [class.joined]="group.isJoined" (click)="join.emit(group)">
                {{ group.isJoined ? 'Đã tham gia' : 'Tham gia' }}
            </button>
        </div>
    `,
    styles: [`
        .group-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
        }
        .group-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .group-card__icon {
            position: relative;
            display: inline-block;
            font-size: 40px;
            color: #7C3AED;
            margin-bottom: 12px;
        }
        .group-card__icon .private-badge {
            position: absolute;
            top: -4px;
            right: -12px;
            font-size: 14px;
            color: #6B7280;
            background: white;
            border-radius: 50%;
            padding: 2px;
        }
        .group-card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1F2937;
            margin: 0 0 4px;
        }
        .group-card p {
            font-size: 13px;
            color: #6B7280;
            margin: 0 0 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .group-card__stats {
            display: flex;
            justify-content: center;
            gap: 16px;
            font-size: 13px;
            color: #6B7280;
            margin-bottom: 12px;
        }
        .group-card__stats i { margin-right: 4px; }
        .join-btn {
            padding: 6px 24px;
            border: 1px solid #7C3AED;
            border-radius: 999px;
            background: transparent;
            color: #7C3AED;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .join-btn:hover {
            background: #7C3AED;
            color: white;
        }
        .join-btn.joined {
            background: #d1fae5;
            border-color: #10B981;
            color: #059669;
        }
    `]
})
export class GroupCardComponent {
    @Input() group!: SocialGroup;
    @Output() join = new EventEmitter<SocialGroup>();
}