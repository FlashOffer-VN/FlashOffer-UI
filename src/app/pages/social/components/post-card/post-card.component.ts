// components/post-card/post-card.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialPost } from '@core/models/social.model';
import { PostCardHeaderComponent } from '../post-card-header/post-card-header.component';
import { PostCardContentComponent } from '../post-card-content/post-card-content.component';
import { PostCardActionsComponent } from '../post-card-actions/post-card-actions.component';

@Component({
    selector: 'app-post-card',
    standalone: true,
    imports: [
        CommonModule,
        PostCardHeaderComponent,
        PostCardContentComponent,
        PostCardActionsComponent
    ],
    template: `
        <div class="post-card">
            <app-post-card-header 
                [post]="post" 
                [timeAgo]="timeAgo">
            </app-post-card-header>

            <app-post-card-content 
                [post]="post"
                (toggleReadMore)="toggleReadMore.emit(post)">
            </app-post-card-content>

            <app-post-card-actions 
                [post]="post"
                (like)="like.emit(post)"
                (share)="share.emit(post)"
                (save)="save.emit(post)">
            </app-post-card-actions>
        </div>
    `,
    styles: [`
        .post-card {
            background: white;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
        }
        .post-card:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        @media (max-width: 480px) {
            .post-card { padding: 16px; }
        }
    `]
})
export class PostCardComponent {
    @Input() post!: SocialPost;
    @Input() timeAgo = '';
    @Output() like = new EventEmitter<SocialPost>();
    @Output() share = new EventEmitter<SocialPost>();
    @Output() save = new EventEmitter<SocialPost>();
    @Output() toggleReadMore = new EventEmitter<SocialPost>();
}