// social.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { SocialPost, SocialMember, SocialEvent, SocialGroup } from '@core/models/social.model';

// Components
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

    ngOnInit(): void {
        this.loadPosts();
        this.loadMembers();
        this.loadEvents();
        this.loadGroups();
        this.loadTrendingTopics();
    }

    // ===== LOAD METHODS =====
    loadPosts(): void {
        this.isLoadingPosts = true;
        this._appService.socialService.getPosts().subscribe({
            next: (response) => {
                this.posts = response.data;
                this.isLoadingPosts = false;
            },
            error: () => {
                this.isLoadingPosts = false;
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

    // ===== Post Actions =====
    toggleLike(post: SocialPost): void {
        this._appService.socialService.likePost(post.id).subscribe();
    }

    toggleSave(post: SocialPost): void {
        this._appService.socialService.savePost(post.id).subscribe();
        this._appService.showSuccess(post.isSaved ? 'Đã lưu bài viết!' : 'Đã bỏ lưu!');
    }

    sharePost(post: SocialPost): void {
        this._appService.socialService.sharePost(post.id).subscribe();
        this._appService.showSuccess('Đã chia sẻ bài viết!');
    }

    toggleReadMore(post: SocialPost): void {
        post.isExpanded = !post.isExpanded;
    }

    // ===== Create Post =====
    onPostCreated(post: SocialPost): void {
        // Chỉ reload posts, không reload members/events/groups
        this.loadPosts();
        this._appService.showSuccess('Đã đăng bài viết!');
    }

    // ===== Member Actions =====
    followMember(member: SocialMember): void {
        member.isFollowing = !member.isFollowing;
        member.followers += member.isFollowing ? 1 : -1;
        this._appService.showSuccess(
            member.isFollowing ? 'Đã theo dõi!' : 'Đã bỏ theo dõi!'
        );
    }

    // ===== Group Actions =====
    joinGroup(group: SocialGroup): void {
        group.isJoined = !group.isJoined;
        group.members += group.isJoined ? 1 : -1;
        this._appService.showSuccess(
            group.isJoined ? 'Đã tham gia nhóm!' : 'Đã rời nhóm!'
        );
    }

    // ===== Event Actions =====
    registerEvent(event: SocialEvent): void {
        if (event.currentParticipants < event.maxParticipants) {
            event.currentParticipants++;
            event.isRegistered = true;
            this._appService.showSuccess('Đăng ký thành công!');
        } else {
            this._appService.showError('Sự kiện đã đủ số lượng tham gia');
        }
    }

    // ===== Utility =====
    getTimeAgo(date: string): string {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff / 60) + ' phút';
        if (diff < 86400) return Math.floor(diff / 3600) + ' giờ';
        return Math.floor(diff / 86400) + ' ngày';
    }
}