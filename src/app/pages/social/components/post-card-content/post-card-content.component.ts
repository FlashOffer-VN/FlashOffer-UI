// components/post-card-content/post-card-content.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost } from '@core/models/social.model';
import { ReadMorePipe } from '@shared/pipes/read-more.pipe';

@Component({
    selector: 'app-post-card-content',
    standalone: true,
    imports: [CommonModule, TranslateModule, ReadMorePipe],
    template: `
        <div class="post-card__content">
            <h3 *ngIf="post.title" class="post-card__title">{{ post.title }}</h3>

            <div class="post-content-wrapper">
                <div class="post-text-wrapper" [class.expanded]="post.isExpanded">
                    <p>{{ post.content | readMore:post.isExpanded:200 }}</p>
                </div>
                <button *ngIf="post.content.length > 200" class="read-more-btn" (click)="toggleReadMore.emit(post)">
                    <span>{{ post.isExpanded ? ('SOCIAL.COLLAPSE' | translate) : ('SOCIAL.READ_MORE' | translate) }}</span>
                    <i class="fas fa-chevron-down" [class.rotated]="post.isExpanded"></i>
                </button>
            </div>

            <div *ngIf="post.images && post.images.length > 0" class="post-card__images">
                <img [src]="post.images[0]" alt="Post image">
            </div>

            <div *ngIf="post.tags && post.tags.length > 0" class="post-card__tags">
                <span *ngFor="let tag of post.tags" class="tag">#{{ tag }}</span>
            </div>
        </div>
    `,
    styles: [`
        .post-card__title {
            font-size: 18px;
            font-weight: 700;
            color: #0a1a2b;
            margin: 0 0 8px;
            line-height: 1.4;
        }
        .post-card__content p {
            font-size: 15px;
            line-height: 1.6;
            color: #1F2937;
            margin: 0 0 12px;
            white-space: pre-line;
        }
        .post-card__images img {
            width: 100%;
            border-radius: 12px;
            max-height: 400px;
            object-fit: cover;
        }
        .post-card__tags {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .post-card__tags .tag {
            font-size: 13px;
            color: #7C3AED;
            background: #f3e8ff;
            padding: 4px 12px;
            border-radius: 999px;
        }
        .read-more-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 16px 6px 14px;
            border: none;
            background: transparent;
            color: #007f94;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 999px;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            margin-top: 6px;
            user-select: none;
        }
        .read-more-btn:hover {
            background: rgba(0, 127, 148, 0.08);
            color: #006b80;
            transform: translateY(-1px);
        }
        .read-more-btn:active { transform: scale(0.95); }
        .read-more-btn i {
            font-size: 12px;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            color: #007f94;
        }
        .read-more-btn i.rotated { transform: rotate(180deg); }
        @media (prefers-color-scheme: dark) {
            .read-more-btn { color: #24c7d7; }
            .read-more-btn:hover { background: rgba(36,199,215,0.12); color: #4dd4e0; }
            .read-more-btn i { color: #24c7d7; }
            .read-more-btn:hover i { color: #4dd4e0; }
        }
    `]
})
export class PostCardContentComponent {
    @Input() post!: SocialPost;
    @Output() toggleReadMore = new EventEmitter<SocialPost>();
}