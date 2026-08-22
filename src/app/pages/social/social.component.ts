// social.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { SocialService } from '@core/services/social.service';
import { SocialPost, SocialMember, SocialEvent, SocialGroup } from '@core/models/social.model';

// Components
import { SocialHeaderComponent } from './components/social-header/social-header.component';
import { CreatePostComponent, CreatePostData } from './components/create-post/create-post.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { TrendingTopicsComponent } from './components/trending-topics/trending-topics.component';
import { MemberCardComponent } from './components/member-card/member-card.component';
import { EventCardComponent } from './components/event-card/event-card.component';
import { GroupCardComponent } from './components/group-card/group-card.component';
import { SocialSidebarComponent } from './components/social-sidebar/social-sidebar.component';

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
        MemberCardComponent,
        EventCardComponent,
        GroupCardComponent,
        SocialSidebarComponent
    ],
    templateUrl: './social.component.html',
    styleUrls: ['./social.component.css']
})
export class SocialComponent implements OnInit {
    posts: SocialPost[] = [];
    members: SocialMember[] = [];
    events: SocialEvent[] = [];
    groups: SocialGroup[] = [];
    trendingTopics: string[] = [];
    isLoading = true;
    selectedTab: 'feed' | 'members' | 'events' | 'groups' = 'feed';

    constructor(
        private _appService: AppService,
        private socialService: SocialService
    ) { }

    ngOnInit(): void {
        this.loadData();
        this.loadTrendingTopics();
    }

    loadData(): void {
        this.isLoading = true;
        this.socialService.getPosts().subscribe(posts => {
            this.posts = posts;
            this.isLoading = false;
        });
        this.socialService.getMembers().subscribe(members => {
            this.members = members;
        });
        this.socialService.getEvents().subscribe(events => {
            this.events = events;
        });
        this.socialService.getGroups().subscribe(groups => {
            this.groups = groups;
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
        this.socialService.likePost(post.id).subscribe();
    }

    toggleSave(post: SocialPost): void {
        this.socialService.savePost(post.id).subscribe();
        this._appService.showSuccess(post.isSaved ? 'Đã lưu bài viết!' : 'Đã bỏ lưu!');
    }

    sharePost(post: SocialPost): void {
        post.shares++;
        this._appService.showSuccess('Đã chia sẻ bài viết!');
    }

    toggleReadMore(post: SocialPost): void {
        post.isExpanded = !post.isExpanded;
    }

    // ===== Create Post =====
    createPost(data: CreatePostData): void {
        this.isLoading = true;
        this.socialService.createPost({
            title: data.title,
            content: data.content,
            type: data.type,
            privacy: data.privacy,
            tags: data.tags,
            images: data.images // sẽ xử lý upload sau
        }).subscribe({
            next: (post) => {
                this.posts.unshift(post);
                this.isLoading = false;
                this._appService.showSuccess('Đã đăng bài viết!');
            },
            error: (err) => {
                this.isLoading = false;
                this._appService.showError('Không thể đăng bài viết. Vui lòng thử lại!');
            }
        });
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
    getTimeAgo(date: Date): string {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff / 60) + ' phút';
        if (diff < 86400) return Math.floor(diff / 3600) + ' giờ';
        return Math.floor(diff / 86400) + ' ngày';
    }
}