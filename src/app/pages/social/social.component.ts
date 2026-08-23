import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuillModule } from 'ngx-quill';
import { AppService } from '@core/services/app.service';
import { SocialPost, SocialMember, SocialEvent, SocialGroup } from '@core/models/social.model';
import { PostType, PrivacyType } from '@core/models/social.model';
import { UserRole } from '@core/models/auth.model';
import { User } from '@core/models/auth.model';

import { SocialHeaderComponent } from './components/social-header/social-header.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { TrendingTopicsComponent } from './components/trending-topics/trending-topics.component';
import { SocialSidebarComponent } from './components/social-sidebar/social-sidebar.component';
import { GroupCardComponent } from './components/group-card/group-card.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { MemberCardComponent } from './components/member-card/member-card.component';

@Component({
    selector: 'app-social',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        QuillModule,
        SocialHeaderComponent,
        CreatePostComponent,
        PostCardComponent,
        TrendingTopicsComponent,
        SocialSidebarComponent,
        GroupCardComponent,
        EventCardComponent,
        MemberCardComponent
    ],
    templateUrl: './social.component.html',
    styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit {
    private _appService = inject(AppService);

    posts: SocialPost[] = [];
    members: SocialMember[] = [];
    events: SocialEvent[] = [];
    groups: SocialGroup[] = [];
    trendingTopics: string[] = [];
    isLoadingPosts = false;
    isLoadingMembers = false;
    isLoadingEvents = false;
    isLoadingGroups = false;
    selectedTab: 'feed' | 'members' | 'events' | 'groups' = 'feed';
    currentUser: User | null = null;

    // Edit Modal
    showEditModal = false;
    isSaving = false;
    editingPostId: string | null = null;
    editTagInput = '';
    editorKey = 0;
    showQuillEditor = true;

    editPostData: Partial<SocialPost> & {
        type?: PostType;
        privacy?: PrivacyType;
    } = {};

    editorConfig = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]
    };

    // Options for edit modal
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

    ngOnInit(): void {
        this.getCurrentUser();
        this.loadPosts();
        this.loadMembers();
        this.loadEvents();
        this.loadGroups();
        this.loadTrendingTopics();
    }

    getCurrentUser(): void {
        this.currentUser = this._appService.getCurrentUser();
    }

    canEditPost(post: SocialPost): boolean {
        if (!this.currentUser) return false;
        return this._appService.isAdmin() || post.author.id === this.currentUser.id;
    }

    canDeletePost(post: SocialPost): boolean {
        if (!this.currentUser) return false;
        return this._appService.isAdmin() || post.author.id === this.currentUser.id;
    }

    loadPosts(): void {
        this.isLoadingPosts = true;
        this._appService.socialService.getPosts().subscribe({
            next: (response) => {
                this.posts = response.data;
                this.isLoadingPosts = false;
            },
            error: () => {
                this.isLoadingPosts = false;
                this._appService.showError(this._appService.trans('SOCIAL.LOAD_ERROR'));
            }
        });
    }

    loadMembers(): void {
        this.isLoadingMembers = true;
        this._appService.socialService.getMembers().subscribe({
            next: (members) => {
                this.members = members;
                this.isLoadingMembers = false;
            },
            error: () => {
                this.isLoadingMembers = false;
            }
        });
    }

    loadEvents(): void {
        this.isLoadingEvents = true;
        this._appService.socialService.getEvents().subscribe({
            next: (events) => {
                this.events = events;
                this.isLoadingEvents = false;
            },
            error: () => {
                this.isLoadingEvents = false;
            }
        });
    }

    loadGroups(): void {
        this.isLoadingGroups = true;
        this._appService.socialService.getGroups().subscribe({
            next: (groups) => {
                this.groups = groups;
                this.isLoadingGroups = false;
            },
            error: () => {
                this.isLoadingGroups = false;
            }
        });
    }

    loadTrendingTopics(): void {
        this.trendingTopics = [
            '📊 Xu hướng kinh tế 2026',
            '💡 Khởi nghiệp với AI',
            '🌱 Phát triển bền vững',
            '📈 Chiến lược tăng trưởng'
        ];
    }

    toggleLike(post: SocialPost): void {
        this._appService.socialService.likePost(post.id).subscribe({
            next: () => { },
            error: () => {
                this._appService.showError('SOCIAL.LIKE_ERROR');
            }
        });
    }

    toggleSave(post: SocialPost): void {
        this._appService.socialService.savePost(post.id).subscribe({
            next: () => {
                this._appService.showSuccess(
                    post.isSaved ? this._appService.trans('SOCIAL.SAVE_SUCCESS') : this._appService.trans('SOCIAL.UNSAVE_SUCCESS')
                );
            },
            error: () => {
                this._appService.showError(this._appService.trans('SOCIAL.SAVE_ERROR'));
            }
        });
    }

    sharePost(post: SocialPost): void {
        this._appService.socialService.sharePost(post.id).subscribe({
            next: () => {
                this._appService.showSuccess(this._appService.trans('SOCIAL.SHARE_SUCCESS'));
            },
            error: () => {
                this._appService.showError(this._appService.trans('SOCIAL.SHARE_ERROR'));
            }
        });
    }

    toggleReadMore(post: SocialPost): void {
        post.isExpanded = !post.isExpanded;
    }

    // ===== EDIT MODAL =====
    openEditModal(post: SocialPost): void {
        if (!this.canEditPost(post)) {
            this._appService.showWarning(this._appService.trans('SOCIAL.NO_PERMISSION'));
            return;
        }
        this.editingPostId = post.id;
        this.editPostData = {
            title: post.title || '',
            content: post.content,
            tags: [...post.tags],
            type: post.type,
            privacy: post.privacy
        };
        this.editTagInput = '';
        this.showEditModal = true;
        // Force re-render quill
        this.showQuillEditor = false;
        setTimeout(() => {
            this.showQuillEditor = true;
        }, 0);
    }

    closeEditModal(): void {
        this.showEditModal = false;
        this.editPostData = {};
        this.editTagInput = '';
        this.editingPostId = null;
        this.isSaving = false;
        // Reset quill
        this.showQuillEditor = true;
    }

    selectEditType(type: PostType): void {
        this.editPostData.type = type;
    }

    selectEditPrivacy(privacy: PrivacyType): void {
        this.editPostData.privacy = privacy;
    }

    getEditTypeLabel(type: PostType): string {
        const found = this.postTypes.find(t => t.value === type);
        return found ? found.label : 'SOCIAL.TYPE_POST';
    }

    getEditPrivacyLabel(privacy: PrivacyType): string {
        const found = this.privacyOptions.find(p => p.value === privacy);
        return found ? found.label : 'SOCIAL.PRIVACY_PUBLIC';
    }

    getEditPrivacyIcon(privacy: PrivacyType): string {
        const found = this.privacyOptions.find(p => p.value === privacy);
        return found ? found.icon : 'fa-globe';
    }

    addEditTag(): void {
        const tag = this.editTagInput.trim().replace(/^#/, '').toLowerCase();
        if (!tag) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_EMPTY'));
            return;
        }
        if (tag.length > 20) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_TOO_LONG'));
            return;
        }
        if (this.editPostData.tags && this.editPostData.tags.length >= 5) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_MAX'));
            return;
        }
        if (this.editPostData.tags?.includes(tag)) {
            this._appService.showWarning(this._appService.trans('SOCIAL.TAG_EXISTS'));
            return;
        }
        if (!this.editPostData.tags) {
            this.editPostData.tags = [];
        }
        this.editPostData.tags.push(tag);
        this.editTagInput = '';
    }

    removeEditTag(index: number): void {
        if (this.editPostData.tags) {
            this.editPostData.tags.splice(index, 1);
        }
    }

    saveEditPost(): void {
        if (!this.editingPostId) return;

        const content = this.editPostData.content || '';
        if (!content.replace(/<[^>]*>/g, '').trim()) {
            this._appService.showWarning(this._appService.trans('SOCIAL.CONTENT_REQUIRED'));
            return;
        }

        this.isSaving = true;
        const updateData = {
            title: this.editPostData.title?.trim() || undefined,
            content: this.editPostData.content,
            tags: this.editPostData.tags || [],
            type: this.editPostData.type || PostType.Post,
            privacy: this.editPostData.privacy || PrivacyType.Public
        };

        this._appService.socialService.updatePost(this.editingPostId, updateData).subscribe({
            next: (updatedPost) => {
                const index = this.posts.findIndex(p => p.id === this.editingPostId);
                if (index !== -1) {
                    this.posts[index] = { ...this.posts[index], ...updatedPost };
                }
                this._appService.showSuccess(this._appService.trans('SOCIAL.UPDATE_POST_SUCCESS'));
                this.closeEditModal();
                this.isSaving = false;
                this.loadPosts();
            },
            error: () => {
                this._appService.showError(this._appService.trans('SOCIAL.UPDATE_POST_ERROR'));
                this.isSaving = false;
            }
        });
    }

    async deletePost(post: SocialPost): Promise<void> {
        if (!this.canDeletePost(post)) {
            this._appService.showWarning('SOCIAL.NO_PERMISSION');
            return;
        }

        const postTitle = post.title || post.content.slice(0, 50) + '...';
        const message = this._appService.trans('SOCIAL.CONFIRM_DELETE_MESSAGE', { title: postTitle });

        const confirmed = await this._appService.confirmDelete(message);

        if (confirmed) {
            this._appService.socialService.deletePost(post.id).subscribe({
                next: () => {
                    this.posts = this.posts.filter(p => p.id !== post.id);
                    this._appService.showSuccess(this._appService.trans('SOCIAL.DELETE_POST_SUCCESS'));
                },
                error: () => {
                    this._appService.showError(this._appService.trans('SOCIAL.DELETE_POST_ERROR'));
                }
            });
        }
    }

    onPostCreated(post: SocialPost): void {
        this.loadPosts();
    }

    followMember(member: SocialMember): void {
        member.isFollowing = !member.isFollowing;
        member.followers += member.isFollowing ? 1 : -1;
        this._appService.showSuccess(
            member.isFollowing ? this._appService.trans('SOCIAL.FOLLOW_SUCCESS') : this._appService.trans('SOCIAL.UNFOLLOW_SUCCESS')
        );
    }

    joinGroup(group: SocialGroup): void {
        group.isJoined = !group.isJoined;
        group.members += group.isJoined ? 1 : -1;
        this._appService.showSuccess(
            group.isJoined ? this._appService.trans('SOCIAL.JOIN_GROUP_SUCCESS') : this._appService.trans('SOCIAL.LEAVE_GROUP_SUCCESS')
        );
    }

    registerEvent(event: SocialEvent): void {
        if (event.currentParticipants < event.maxParticipants) {
            event.currentParticipants++;
            event.isRegistered = true;
            this._appService.showSuccess(this._appService.trans('SOCIAL.REGISTER_EVENT_SUCCESS'));
        } else {
            this._appService.showError(this._appService.trans('SOCIAL.EVENT_FULL'));
        }
    }

    getTimeAgo(date: string): string {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff / 60) + ' phút';
        if (diff < 86400) return Math.floor(diff / 3600) + ' giờ';
        return Math.floor(diff / 86400) + ' ngày';
    }
}