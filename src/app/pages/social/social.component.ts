import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { SocialService } from '@core/services/social.service';
import { SocialPost, SocialMember, SocialEvent, SocialGroup } from '@core/models/social.model';

@Component({
    selector: 'app-social',
    standalone: true,
    imports: [CommonModule, TranslateModule, FormsModule],
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
    newPostContent = '';
    selectedTab: 'feed' | 'members' | 'events' | 'groups' = 'feed';
    showCreatePost = false;

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

    createPost(): void {
        if (!this.newPostContent.trim()) {
            this._appService.showError('Vui lòng nhập nội dung bài viết');
            return;
        }

        this.socialService.createPost(this.newPostContent).subscribe(() => {
            this.newPostContent = '';
            this._appService.showSuccess('Đã đăng bài viết!');
        });
    }

    followMember(member: SocialMember): void {
        member.isFollowing = !member.isFollowing;
        member.followers += member.isFollowing ? 1 : -1;
        this._appService.showSuccess(
            member.isFollowing ? 'Đã theo dõi!' : 'Đã bỏ theo dõi!'
        );
    }

    joinGroup(group: SocialGroup): void {
        group.isJoined = !group.isJoined;
        group.members += group.isJoined ? 1 : -1;
        this._appService.showSuccess(
            group.isJoined ? 'Đã tham gia nhóm!' : 'Đã rời nhóm!'
        );
    }

    registerEvent(event: SocialEvent): void {
        if (event.currentParticipants < event.maxParticipants) {
            event.currentParticipants++;
            event.isRegistered = true;
            this._appService.showSuccess('Đăng ký thành công!');
        } else {
            this._appService.showError('Sự kiện đã đủ số lượng tham gia');
        }
    }

    getTimeAgo(date: Date): string {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff / 60) + ' phút';
        if (diff < 86400) return Math.floor(diff / 3600) + ' giờ';
        return Math.floor(diff / 86400) + ' ngày';
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}