// src/app/features/social/components/create-post/create-post.component.ts
import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '../../../../core/services/app.service';
import { PostType, PrivacyType, CreatePostRequest, SocialPost } from '../../../../core/models/social.model';

@Component({
    selector: 'app-create-post',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
    @Output() postCreated = new EventEmitter<SocialPost>();
    @Input() isLoading = false;

    private _appService = inject(AppService);

    // Form data
    title = '';
    content = '';
    selectedType: PostType = PostType.Post;
    selectedPrivacy: PrivacyType = PrivacyType.Public;
    tags: string[] = [];
    tagInput = '';
    images: any[] = [];
    imagePreviews: string[] = [];
    showOptions = false;
    isSubmitting = false;

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

    get canSubmit(): boolean {
        return this.content.trim().length > 0 && !this.isLoading && !this.isSubmitting;
    }

    autoResize(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
    }

    toggleOptions(): void {
        this.showOptions = !this.showOptions;
    }

    selectType(type: PostType): void {
        this.selectedType = type;
    }

    selectPrivacy(privacy: PrivacyType): void {
        this.selectedPrivacy = privacy;
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
            this._appService.showWarning('SOCIAL.TAG_EMPTY');
            return;
        }
        if (tag.length > 20) {
            this._appService.showWarning('SOCIAL.TAG_TOO_LONG');
            return;
        }
        if (this.tags.length >= 5) {
            this._appService.showWarning('SOCIAL.TAG_MAX');
            return;
        }
        if (this.tags.includes(tag)) {
            this._appService.showWarning('SOCIAL.TAG_EXISTS');
            return;
        }
        this.tags.push(tag);
        this.tagInput = '';
    }

    removeTag(index: number): void {
        this.tags.splice(index, 1);
    }

    triggerFileInput(): void {
        const input = document.getElementById('fileInput') as HTMLInputElement;
        if (input) input.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;

        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 5 * 1024 * 1024) {
                this._appService.showWarning('SOCIAL.IMAGE_TOO_LARGE');
                continue;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    this.imagePreviews.push(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
        input.value = '';
    }

    removeImage(index: number): void {
        this.imagePreviews.splice(index, 1);
    }

    onSubmit(): void {
        if (!this.canSubmit) return;

        this.isSubmitting = true;

        const request: CreatePostRequest = {
            title: this.title.trim() || undefined,
            content: this.content.trim(),
            type: this.selectedType,
            privacy: this.selectedPrivacy,
            tags: this.tags,
            images: []
        };

        // Add event fields if type is Event
        if (this.selectedType === PostType.Event) {
            // TODO: Add event fields when UI is ready
        }

        // Add announcement fields if type is Announcement
        if (this.selectedType === PostType.Announcement) {
            // TODO: Add announcement fields when UI is ready
        }

        this._appService.socialService.createPost(request).subscribe({
            next: (post) => {
                this.postCreated.emit(post);
                this._appService.showSuccess('SOCIAL.CREATE_POST_SUCCESS');
                this.resetForm();
                this.isSubmitting = false;
            },
            error: () => {
                this.isSubmitting = false;
            }
        });
    }

    resetForm(): void {
        this.title = '';
        this.content = '';
        this.selectedType = PostType.Post;
        this.selectedPrivacy = PrivacyType.Public;
        this.tags = [];
        this.tagInput = '';
        this.images = [];
        this.imagePreviews = [];
        this.showOptions = false;
        this.isSubmitting = false;
    }
}