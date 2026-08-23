// components/post-card-header/post-card-header.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialPost } from '@core/models/social.model';
import { AvatarPipe } from '@shared/pipes/avatar.pipe';

@Component({
    selector: 'app-post-card-header',
    standalone: true,
    imports: [CommonModule, AvatarPipe],
    template: `
        <div class="post-card__header">
            <div class="post-author">
                <img [src]="post.author.avatar | avatar" [alt]="post.author.fullName">
                <div>
                    <span class="name">
                        {{ post.author.fullName }}
                        <i *ngIf="post.author.isVerified" class="fas fa-check-circle verified"></i>
                    </span>
                    <span class="role">{{ post.author.role }}</span>
                    <span class="time">{{ timeAgo }}</span>
                </div>
            </div>
            <button class="post-card__more">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
    `,
    styles: [`
        .post-card__header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        .post-author {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .post-author img {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
        }
        .post-author .name {
            font-weight: 600;
            color: #1F2937;
            display: block;
        }
        .post-author .name .verified {
            color: #1DA1F2;
            font-size: 14px;
            margin-left: 4px;
        }
        .post-author .role {
            font-size: 12px;
            color: #6B7280;
        }
        .post-author .time {
            font-size: 12px;
            color: #9CA3AF;
            margin-left: 8px;
        }
        .post-card__more {
            background: none;
            border: none;
            color: #9CA3AF;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 8px;
        }
        .post-card__more:hover { background: #f3f4f6; }
    `]
})
export class PostCardHeaderComponent {
    @Input() post!: SocialPost;
    @Input() timeAgo = '';
}