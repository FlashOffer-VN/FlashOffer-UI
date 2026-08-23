import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost } from '@core/models/social.model';
import { AvatarPipe } from '@shared/pipes/avatar.pipe';

@Component({
    selector: 'app-post-card',
    standalone: true,
    imports: [CommonModule, TranslateModule, AvatarPipe],
    templateUrl: './post-card.component.html',
    styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
    @Input() post!: SocialPost;
    @Input() timeAgo = '';
    @Input() canEdit = false;
    @Input() canDelete = false;
    @Output() like = new EventEmitter<SocialPost>();
    @Output() share = new EventEmitter<SocialPost>();
    @Output() save = new EventEmitter<SocialPost>();
    @Output() toggleReadMore = new EventEmitter<SocialPost>();
    @Output() edit = new EventEmitter<SocialPost>();
    @Output() delete = new EventEmitter<SocialPost>();

    showActions = false;
}