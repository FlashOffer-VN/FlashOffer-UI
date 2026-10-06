// pages/social/components/post-edit-modal/post-edit-modal.component.ts
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuillModule } from 'ngx-quill';

import { AppService } from '@core/services/app.service';
import { acquireModalLevel, releaseModalLevel } from '@core/utils/z-index';
import { PostType, PrivacyType, SocialPost, UpdatePostRequest } from '@core/models/social.model';
import { QUILL_MODULES, quillPlainText } from '@core/configs/quill.config';
import { isBrowser } from '@core/utils/platform';
import { apiOrigin } from '@shared/pipes/media-url.pipe';
import { InputComponent } from '@shared/components/input/input.component';

/** Modal sửa bài viết — dùng chung cho bảng tin và trang Bài viết của tôi */
@Component({
    selector: 'app-post-edit-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, QuillModule,
        InputComponent
    ],
    templateUrl: './post-edit-modal.component.html',
    styleUrls: ['./post-edit-modal.component.css']
})
export class PostEditModalComponent implements OnChanges, OnDestroy {
    /** Bài cần sửa; truyền null để đóng modal */
    @Input() post: SocialPost | null = null;
    @Output() saved = new EventEmitter<SocialPost>();
    @Output() closed = new EventEmitter<void>();

    /** Tầng xếp lớp: modal mở sau luôn nằm trên modal mở trước (xem core/utils/z-index.ts) */
    modalLevel = 0;
    private _level: number | null = null;

    isSaving = false;
    showQuillEditor = true;
    tagInput = '';

    formData: Partial<SocialPost> & {
        type?: PostType;
        privacy?: PrivacyType;
    } = {};

    readonly editorConfig = QUILL_MODULES;

    readonly postTypes = [
        { value: PostType.Post, label: 'SOCIAL.TYPE_POST', icon: 'fa-file-alt' },
        { value: PostType.Question, label: 'SOCIAL.TYPE_QUESTION', icon: 'fa-question-circle' },
        { value: PostType.Event, label: 'SOCIAL.TYPE_EVENT', icon: 'fa-calendar' },
        { value: PostType.Announcement, label: 'SOCIAL.TYPE_ANNOUNCEMENT', icon: 'fa-bullhorn' }
    ];

    readonly privacyOptions = [
        { value: PrivacyType.Public, label: 'SOCIAL.PRIVACY_PUBLIC', icon: 'fa-globe' },
        { value: PrivacyType.Friends, label: 'SOCIAL.PRIVACY_FRIENDS', icon: 'fa-user-friends' },
        { value: PrivacyType.Private, label: 'SOCIAL.PRIVACY_PRIVATE', icon: 'fa-lock' }
    ];

    constructor(
        private readonly _appService: AppService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['post']) return;

        if (!this.post) {
            this._releaseLevel();
            this.showQuillEditor = true;
            return;
        }

        this._acquireLevel();

        this.formData = {
            title: this.post.title || '',
            content: this.post.content,
            tags: [...(this.post.tags ?? [])],
            type: this.post.type,
            privacy: this.post.privacy
        };
        this.tagInput = '';
        this.isSaving = false;
        // Force re-render Quill theo nội dung bài mới
        this.showQuillEditor = false;
        setTimeout(() => {
            this.showQuillEditor = true;
        }, 0);
    }

    ngOnDestroy(): void {
        this._releaseLevel();
    }

    /** Cấp/trả tầng xếp lớp để modal mở sau luôn nằm trên modal mở trước */
    private _acquireLevel(): void {
        if (this._level === null) {
            this._level = acquireModalLevel();
            this.modalLevel = this._level;
        }
    }

    private _releaseLevel(): void {
        if (this._level !== null) {
            releaseModalLevel(this._level);
            this._level = null;
        }
    }

    close(): void {
        this.formData = {};
        this.tagInput = '';
        this.isSaving = false;
        this.closed.emit();
    }

    selectType(type: PostType): void {
        this.formData.type = type;
    }

    selectPrivacy(privacy: PrivacyType): void {
        this.formData.privacy = privacy;
    }

    getTypeLabel(type: PostType): string {
        const found = this.postTypes.find(t => t.value === type);
        return found ? found.label : 'SOCIAL.TYPE_POST';
    }

    getPrivacyLabel(privacy: PrivacyType): string {
        const found = this.privacyOptions.find(p => p.value === privacy);
        return found ? found.label : 'SOCIAL.PRIVACY_PUBLIC';
    }

    getPrivacyIcon(privacy: PrivacyType): string {
        const found = this.privacyOptions.find(p => p.value === privacy);
        return found ? found.icon : 'fa-globe';
    }

    addTag(): void {
        const tag = this.tagInput.trim().replace(/^#/, '').toLowerCase();
        if (!tag) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_EMPTY'));
            return;
        }
        if (tag.length > 20) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_TOO_LONG'));
            return;
        }
        if (this.formData.tags && this.formData.tags.length >= 5) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_MAX'));
            return;
        }
        if (this.formData.tags?.includes(tag)) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_EXISTS'));
            return;
        }
        if (!this.formData.tags) {
            this.formData.tags = [];
        }
        this.formData.tags.push(tag);
        this.tagInput = '';
    }

    removeTag(index: number): void {
        if (this.formData.tags) {
            this.formData.tags.splice(index, 1);
        }
    }

    save(): void {
        if (!this.post || this.isSaving) return;

        if (!quillPlainText(this.formData.content)) {
            this._appService.showWarning(this._appService.trans('SOCIAL.CONTENT_REQUIRED'));
            return;
        }

        const data: UpdatePostRequest = {
            title: this.formData.title?.trim() || undefined,
            content: this.formData.content,
            tags: this.formData.tags || [],
            type: this.formData.type || PostType.Post,
            privacy: this.formData.privacy || PrivacyType.Public
        };

        const postId = this.post.id;
        this.isSaving = true;

        this._appService.socialService.updatePost(postId, data).subscribe({
            next: (updatedPost) => {
                this.isSaving = false;
                this._appService.showSuccess(this._appService.trans('SOCIAL.UPDATE_POST_SUCCESS'));
                this.saved.emit(updatedPost);
                this.close();
            },
            error: () => {
                this.isSaving = false;
                this._appService.showError(this._appService.trans('SOCIAL.UPDATE_POST_ERROR'));
            }
        });
    }

    /**
     * Nút "chèn ảnh" trong Quill: upload ảnh lên API rồi chèn URL tuyệt đối vào bài viết
     * (không nhồi base64 vào nội dung — tránh vượt giới hạn ký tự của API).
     */
    onEditorCreated(quill: any): void {
        quill?.getModule('toolbar')?.addHandler('image', () => this.pickAndUploadImage(quill));
    }

    private pickAndUploadImage(quill: any): void {
        if (!isBrowser()) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;

            this._appService.socialService.uploadImage(file, file.name).subscribe({
                next: (result: { url: string }) => {
                    if (!result?.url) {
                        this._appService.showError(this._appService.trans('SOCIAL.IMAGE_UPLOAD_FAILED'));
                        return;
                    }

                    const range = quill.getSelection(true);
                    const index = range?.index ?? 0;
                    quill.insertEmbed(index, 'image', `${apiOrigin()}${result.url}`, 'user');
                    quill.setSelection(index + 1);
                },
                error: () => this._appService.showError(this._appService.trans('SOCIAL.IMAGE_UPLOAD_FAILED'))
            });
        };

        input.click();
    }
}
