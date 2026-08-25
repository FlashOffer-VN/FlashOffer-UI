// shared/components/post-detail-modal/post-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost, PostType, PrivacyType } from '@core/models/social.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarPipe } from '@shared/pipes/avatar.pipe';
import { AppService } from '@core/services/app.service';

@Component({
  selector: 'app-post-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, AvatarPipe],
  templateUrl: './post-detail-modal.component.html',
  styleUrls: ['./post-detail-modal.component.scss']
})
export class PostDetailModalComponent implements OnInit {
  @Input() post: SocialPost | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() liked = new EventEmitter<void>();
  @Output() shared = new EventEmitter<void>();

  constructor(
    private _sanitizer: DomSanitizer,
    private _appService: AppService
  ) { }

  ngOnInit() { }

  sanitizeHtml(content: string): SafeHtml {
    if (!content) return '';
    const sanitized = this._sanitizer.sanitize(SecurityContext.HTML, content);
    return this._sanitizer.bypassSecurityTrustHtml(sanitized || '');
  }

  onClose(): void {
    this.close.emit();
  }

  onLike(): void {
    if (!this.post) return;

    this._appService.socialService.likePost(this.post.id).subscribe({
      next: () => {
        if (this.post) {
          this.post.isLiked = !this.post.isLiked;
          this.post.likesCount += this.post.isLiked ? 1 : -1;
          this.post.likesCount = Math.max(0, this.post.likesCount);
        }
        this.liked.emit();
      },
      error: () => {
        this._appService.showError(this._appService.trans('SOCIAL.LIKE_ERROR'));
      }
    });
  }

  onShare(): void {
    if (!this.post) return;

    this._appService.socialService.sharePost(this.post.id).subscribe({
      next: () => {
        if (this.post) {
          this.post.sharesCount = (this.post.sharesCount || 0) + 1;
        }
        this._appService.showSuccess(this._appService.trans('SOCIAL.SHARE_SUCCESS'));
        this.shared.emit();
      },
      error: () => {
        this._appService.showError(this._appService.trans('SOCIAL.SHARE_ERROR'));
      }
    });
  }

  onSave(): void {
    if (!this.post) return;

    this._appService.socialService.savePost(this.post.id).subscribe({
      next: () => {
        if (this.post) {
          this.post.isSaved = !this.post.isSaved;
          this._appService.showSuccess(
            this.post.isSaved
              ? this._appService.trans('SOCIAL.SAVE_SUCCESS')
              : this._appService.trans('SOCIAL.UNSAVE_SUCCESS')
          );
        }
      },
      error: () => {
        this._appService.showError(this._appService.trans('SOCIAL.SAVE_ERROR'));
      }
    });
  }

  // ✅ Đã sửa: dùng enum
  getTypeLabel(type: PostType): string {
    const labels = {
      [PostType.Post]: 'SOCIAL.TYPE_POST',
      [PostType.Question]: 'SOCIAL.TYPE_QUESTION',
      [PostType.Event]: 'SOCIAL.TYPE_EVENT',
      [PostType.Announcement]: 'SOCIAL.TYPE_ANNOUNCEMENT'
    };
    return labels[type] || 'SOCIAL.TYPE_POST';
  }

  // ✅ Đã sửa: dùng enum
  getPrivacyLabel(privacy: PrivacyType): string {
    const labels = {
      [PrivacyType.Public]: 'SOCIAL.PRIVACY_PUBLIC',
      [PrivacyType.Friends]: 'SOCIAL.PRIVACY_FRIENDS',
      [PrivacyType.Private]: 'SOCIAL.PRIVACY_PRIVATE'
    };
    return labels[privacy] || 'SOCIAL.PRIVACY_PUBLIC';
  }
}