// components/create-post/create-post.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-create-post',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule],
    template: `
        <div class="create-post">
            <div class="create-post__avatar">
                <img src="assets/avatars/avatar.jpg" alt="Avatar">
            </div>
            <div class="create-post__input">
                <input 
                    type="text" 
                    [(ngModel)]="content" 
                    [placeholder]="'SOCIAL.WHATS_NEW' | translate"
                    (focus)="onFocus()" 
                    (keyup.enter)="onSubmit()">
            </div>
            <button class="create-post__btn" (click)="onSubmit()">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `,
    styles: [`
        .create-post {
            display: flex;
            align-items: center;
            gap: 16px;
            background: white;
            border-radius: 16px;
            padding: 16px 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .create-post__avatar img {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
        }
        .create-post__input { flex: 1; }
        .create-post__input input {
            width: 100%;
            border: none;
            padding: 10px 16px;
            border-radius: 24px;
            background: #f0f2f5;
            font-size: 14px;
            outline: none;
            transition: all 0.3s ease;
        }
        .create-post__input input:focus { background: #e4e6eb; }
        .create-post__btn {
            width: 44px;
            height: 44px;
            border: none;
            border-radius: 50%;
            background: linear-gradient(135deg, #7C3AED, #A78BFA);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .create-post__btn:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }
        @media (max-width: 480px) {
            .create-post { padding: 12px 16px; }
            .create-post__avatar img { width: 36px; height: 36px; }
        }
    `]
})
export class CreatePostComponent {
    @Output() create = new EventEmitter<string>();
    content = '';

    onSubmit(): void {
        if (this.content.trim()) {
            this.create.emit(this.content);
            this.content = '';
        }
    }

    onFocus(): void {
        // Có thể emit event focus nếu cần
    }
}