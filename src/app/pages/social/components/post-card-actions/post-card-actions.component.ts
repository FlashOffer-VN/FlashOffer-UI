// components/post-card-actions/post-card-actions.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost } from '@core/models/social.model';

@Component({
    selector: 'app-post-card-actions',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        <div class="post-card__stats">
            <span><i class="fas fa-heart"></i> {{ post.likes }}</span>
            <span><i class="fas fa-comment"></i> {{ post.comments }}</span>
            <span><i class="fas fa-share"></i> {{ post.shares }}</span>
        </div>

        <div class="post-card__actions">
            <button class="action-btn" [class.liked]="post.isLiked" (click)="like.emit(post)">
                <i class="fas fa-heart"></i> {{ 'SOCIAL.LIKE' | translate }}
            </button>
            <button class="action-btn">
                <i class="fas fa-comment"></i> {{ 'SOCIAL.COMMENT' | translate }}
            </button>
            <button class="action-btn" (click)="share.emit(post)">
                <i class="fas fa-share"></i> {{ 'SOCIAL.SHARE' | translate }}
            </button>
            <button class="action-btn save-btn" [class.saved]="post.isSaved" (click)="save.emit(post)">
                <i class="fas fa-bookmark"></i>
            </button>
        </div>
    `,
    styles: [`
        .post-card__stats {
            display: flex;
            gap: 24px;
            padding: 12px 0;
            border-top: 1px solid #f1f5f9;
            border-bottom: 1px solid #f1f5f9;
            margin: 12px 0;
            font-size: 14px;
            color: #6B7280;
        }
        .post-card__stats span {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .post-card__actions {
            display: flex;
            gap: 4px;
        }
        .action-btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            background: transparent;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #6B7280;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .action-btn:hover { background: #f3f4f6; }
        .action-btn.liked { color: #EF4444; }
        .action-btn.liked i { animation: heartBeat 0.3s ease; }
        .action-btn.save-btn.saved { color: #7C3AED; }
        @keyframes heartBeat {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        @media (max-width: 768px) {
            .post-card__actions { flex-wrap: wrap; }
            .action-btn { flex: 1 1 45%; }
        }
        @media (max-width: 480px) {
            .post-card__stats { font-size: 13px; gap: 16px; }
        }
    `]
})
export class PostCardActionsComponent {
    @Input() post!: SocialPost;
    @Output() like = new EventEmitter<SocialPost>();
    @Output() share = new EventEmitter<SocialPost>();
    @Output() save = new EventEmitter<SocialPost>();
}