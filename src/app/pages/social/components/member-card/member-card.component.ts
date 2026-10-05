// components/member-card/member-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialMember } from '@core/models/social.model';

@Component({
    selector: 'app-member-card',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="member-card">
            <div class="member-card__avatar">
                <img [src]="member.avatar" [alt]="member.name">
                <span *ngIf="member.isOnline" class="online-dot"></span>
                <i *ngIf="member.isVerified" class="fas fa-check-circle verified-badge"></i>
            </div>
            <span class="name">{{ member.name }}</span>
            <span class="role">{{ member.role }}</span>
            <span class="company">{{ member.company }}</span>
            <div class="member-card__stats">
                <span><i class="fas fa-user-plus"></i> {{ member.followers }}</span>
                <span><i class="fas fa-file-alt"></i> {{ member.posts }}</span>
            </div>
            <button class="follow-btn" [class.following]="member.isFollowing" (click)="follow.emit(member)">
                {{ member.isFollowing ? 'Đang theo dõi' : 'Theo dõi' }}
            </button>
        </div>
    `,
    styles: [`
        .member-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
        }
        .member-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .member-card__avatar {
            position: relative;
            display: inline-block;
            margin-bottom: 12px;
        }
        .member-card__avatar img {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            object-fit: cover;
        }
        .member-card__avatar .online-dot {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 14px;
            height: 14px;
            background: var(--success);
            border-radius: 50%;
            border: 2px solid white;
        }
        .member-card__avatar .verified-badge {
            position: absolute;
            bottom: 2px;
            right: -4px;
            color: #1DA1F2;
            font-size: 18px;
            background: white;
            border-radius: 50%;
            padding: 2px;
        }
        .member-card .name {
            display: block;
            font-weight: 600;
            color: var(--text);
        }
        .member-card .role {
            display: block;
            font-size: 13px;
            color: var(--text-muted);
        }
        .member-card .company {
            display: block;
            font-size: 12px;
            color: var(--text-subtle);
            margin-bottom: 8px;
        }
        .member-card__stats {
            display: flex;
            justify-content: center;
            gap: 16px;
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 12px;
        }
        .member-card__stats i { margin-right: 4px; }
        .follow-btn {
            padding: 6px 24px;
            border: 1px solid var(--primary);
            border-radius: 999px;
            background: transparent;
            color: var(--primary);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .follow-btn:hover {
            background: var(--primary);
            color: white;
        }
        .follow-btn.following {
            background: var(--success-soft);
            border-color: var(--success);
            color: var(--success-dark);
        }
    `]
})
export class MemberCardComponent {
    @Input() member!: SocialMember;
    @Output() follow = new EventEmitter<SocialMember>();
}