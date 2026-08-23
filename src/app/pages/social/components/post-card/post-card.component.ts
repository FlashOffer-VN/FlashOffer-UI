import { Component, EventEmitter, Input, Output, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost } from '@core/models/social.model';
import { PostType, PrivacyType } from '@core/models/social.model';
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

    @ViewChild('actionsToggle') actionsToggle!: ElementRef;

    showActions = false;
    isFocused = false;

    // Type methods
    getTypeIcon(type: PostType): string {
        const icons = {
            [PostType.Post]: 'fa-file-alt',
            [PostType.Question]: 'fa-question-circle',
            [PostType.Event]: 'fa-calendar',
            [PostType.Announcement]: 'fa-bullhorn'
        };
        return 'fas ' + (icons[type] || 'fa-file-alt');
    }

    getTypeLabel(type: PostType): string {
        const labels = {
            [PostType.Post]: 'SOCIAL.TYPE_POST',
            [PostType.Question]: 'SOCIAL.TYPE_QUESTION',
            [PostType.Event]: 'SOCIAL.TYPE_EVENT',
            [PostType.Announcement]: 'SOCIAL.TYPE_ANNOUNCEMENT'
        };
        return labels[type] || 'SOCIAL.TYPE_POST';
    }

    // Privacy methods
    getPrivacyIcon(privacy: PrivacyType): string {
        const icons = {
            [PrivacyType.Public]: 'fa-globe',
            [PrivacyType.Friends]: 'fa-user-friends',
            [PrivacyType.Private]: 'fa-lock'
        };
        return 'fas ' + (icons[privacy] || 'fa-globe');
    }

    getPrivacyLabel(privacy: PrivacyType): string {
        const labels = {
            [PrivacyType.Public]: 'SOCIAL.PRIVACY_PUBLIC',
            [PrivacyType.Friends]: 'SOCIAL.PRIVACY_FRIENDS',
            [PrivacyType.Private]: 'SOCIAL.PRIVACY_PRIVATE'
        };
        return labels[privacy] || 'SOCIAL.PRIVACY_PUBLIC';
    }

    toggleActions(event: Event): void {
        event.stopPropagation();
        this.showActions = !this.showActions;
        if (this.showActions) {
            const card = (event.currentTarget as HTMLElement).closest('.post-card') as HTMLElement;
            if (card) card.focus();
        }
    }

    closeActions(): void {
        this.showActions = false;
    }

    onEdit(): void {
        this.edit.emit(this.post);
        this.closeActions();
    }

    onDelete(): void {
        this.delete.emit(this.post);
        this.closeActions();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.post-actions')) {
            this.closeActions();
        }
    }

    @HostListener('document:keydown.escape')
    onEscapePress(): void {
        if (this.showActions) {
            this.closeActions();
        }
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        if (!this.isFocused && !this.showActions) return;

        const isCtrl = event.ctrlKey || event.metaKey;

        if (isCtrl && event.key === 'e' && this.canEdit) {
            event.preventDefault();
            this.onEdit();
        }

        if (isCtrl && event.key === 'd' && this.canDelete) {
            event.preventDefault();
            this.onDelete();
        }
    }
}