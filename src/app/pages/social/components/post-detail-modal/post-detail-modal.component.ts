// shared/components/post-detail-modal/post-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost } from '@core/models/social.model';
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
  // Emit when the post is liked or shared to allow parent component to refresh data
  @Output() liked = new EventEmitter<void>();
  @Output() shared = new EventEmitter<void>();

  constructor(
    private _sanitizer: DomSanitizer,
    private _appService: AppService
  ) { }

  ngOnInit() { }

  sanitizeHtml(content: string): SafeHtml {
    return this._sanitizer.sanitize(1, content) || '';
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
        // Notify parent that like action occurred
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
        // Notify parent that share action occurred
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

  getTypeLabel(type: number): string {
    const labels = ['SOCIAL.TYPE_POST', 'SOCIAL.TYPE_QUESTION', 'SOCIAL.TYPE_EVENT', 'SOCIAL.TYPE_ANNOUNCEMENT'];
    return labels[type - 1] || 'SOCIAL.TYPE_POST';
  }

  getPrivacyLabel(privacy: number): string {
    const labels = ['SOCIAL.PRIVACY_PUBLIC', 'SOCIAL.PRIVACY_FRIENDS', 'SOCIAL.PRIVACY_PRIVATE'];
    return labels[privacy - 1] || 'SOCIAL.PRIVACY_PUBLIC';
  }
}