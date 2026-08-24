// shared/components/post-detail-modal/post-detail-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SocialPost } from '@core/models/social.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AvatarPipe } from '@shared/pipes/avatar.pipe';

@Component({
  selector: 'app-post-detail-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule, AvatarPipe],
  templateUrl: './post-detail-modal.component.html',
  styleUrls: ['./post-detail-modal.component.css']
})
export class PostDetailModalComponent implements OnInit {
  @Input() post: SocialPost | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() like = new EventEmitter<SocialPost>();
  @Output() share = new EventEmitter<SocialPost>();
  @Output() save = new EventEmitter<SocialPost>();

  constructor(private _sanitizer: DomSanitizer) { }

  ngOnInit() { }

  sanitizeHtml(content: string): SafeHtml {
    return this._sanitizer.sanitize(1, content) || '';
  }

  onClose() { this.close.emit(); }
  onLike() { if (this.post) this.like.emit(this.post); }
  onShare() { if (this.post) this.share.emit(this.post); }
  onSave() { if (this.post) this.save.emit(this.post); }

  getTypeLabel(type: number): string {
    const labels = ['SOCIAL.TYPE_POST', 'SOCIAL.TYPE_QUESTION', 'SOCIAL.TYPE_EVENT', 'SOCIAL.TYPE_ANNOUNCEMENT'];
    return labels[type - 1] || 'SOCIAL.TYPE_POST';
  }

  getPrivacyLabel(privacy: number): string {
    const labels = ['SOCIAL.PRIVACY_PUBLIC', 'SOCIAL.PRIVACY_FRIENDS', 'SOCIAL.PRIVACY_PRIVATE'];
    return labels[privacy - 1] || 'SOCIAL.PRIVACY_PUBLIC';
  }
}