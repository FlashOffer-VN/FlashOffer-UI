// components/create-post/create-post.component.ts
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface CreatePostData {
    title: string;
    content: string;
    type: 'post' | 'question' | 'event' | 'announcement';
    privacy: 'public' | 'friends' | 'private';
    tags: string[];
    images: File[];
}

@Component({
    selector: 'app-create-post',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.css']
})
export class CreatePostComponent {
    @Output() create = new EventEmitter<CreatePostData>();
    @Input() isLoading = false;

    title = '';
    content = '';
    selectedType: CreatePostData['type'] = 'post';
    selectedPrivacy: CreatePostData['privacy'] = 'public';
    tags: string[] = [];
    tagInput = '';
    imageFiles: File[] = [];
    imagePreviews: string[] = [];
    showOptions = false;

    readonly postTypes = [
        { value: 'post' as const, label: 'Bài viết', icon: 'fa-file-alt' },
        { value: 'question' as const, label: 'Hỏi đáp', icon: 'fa-question-circle' },
        { value: 'event' as const, label: 'Sự kiện', icon: 'fa-calendar' },
        { value: 'announcement' as const, label: 'Thông báo', icon: 'fa-bullhorn' }
    ];

    readonly privacyOptions = [
        { value: 'public' as const, label: 'Công khai', icon: 'fa-globe' },
        { value: 'friends' as const, label: 'Bạn bè', icon: 'fa-user-friends' },
        { value: 'private' as const, label: 'Riêng tư', icon: 'fa-lock' }
    ];

    // ✅ Thêm method autoResize
    autoResize(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    onSubmit(): void {
        if (!this.content.trim() || this.isLoading) {
            return;
        }

        this.create.emit({
            title: this.title.trim(),
            content: this.content.trim(),
            type: this.selectedType,
            privacy: this.selectedPrivacy,
            tags: this.tags,
            images: this.imageFiles
        });

        this.resetForm();
    }

    resetForm(): void {
        this.title = '';
        this.content = '';
        this.selectedType = 'post';
        this.selectedPrivacy = 'public';
        this.tags = [];
        this.tagInput = '';
        this.imageFiles = [];
        this.imagePreviews = [];
        this.showOptions = false;
    }

    toggleOptions(): void {
        this.showOptions = !this.showOptions;
    }

    selectType(type: CreatePostData['type']): void {
        this.selectedType = type;
    }

    selectPrivacy(privacy: CreatePostData['privacy']): void {
        this.selectedPrivacy = privacy;
    }

    getTypeLabel(type: string): string {
        const found = this.postTypes.find(t => t.value === type);
        return found ? found.label : type;
    }

    getPrivacyLabel(privacy: string): string {
        const found = this.privacyOptions.find(p => p.value === privacy);
        return found ? found.label : privacy;
    }

    getPrivacyIcon(privacy: string): string {
        const found = this.privacyOptions.find(p => p.value === privacy);
        return found ? found.icon : 'fa-globe';
    }

    addTag(): void {
        const tag = this.tagInput.trim().replace(/^#/, '');
        if (tag && !this.tags.includes(tag)) {
            this.tags.push(tag);
            this.tagInput = '';
        }
    }

    removeTag(index: number): void {
        this.tags.splice(index, 1);
    }

    triggerFileInput(): void {
        const input = document.getElementById('fileInput') as HTMLInputElement;
        if (input) {
            input.click();
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                if (file.type.startsWith('image/')) {
                    this.imageFiles.push(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        if (e.target?.result) {
                            this.imagePreviews.push(e.target.result as string);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
        input.value = '';
    }

    removeImage(index: number): void {
        this.imageFiles.splice(index, 1);
        this.imagePreviews.splice(index, 1);
    }

    get canSubmit(): boolean {
        return this.content.trim().length > 0 && !this.isLoading;
    }
}