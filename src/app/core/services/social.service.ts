import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SocialPost, SocialMember, SocialEvent, SocialGroup, SocialComment } from '../models/social.model';

@Injectable({
    providedIn: 'root'
})
export class SocialService {
    private posts: SocialPost[] = [
        {
            id: 1,
            author: {
                id: 1,
                name: 'Nguyễn Văn A',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'nguyenvana',
                role: 'CEO',
                isVerified: true
            },
            content: '📢 Mình vừa ra mắt sản phẩm mới! Cảm ơn cộng đồng đã luôn ủng hộ. Hãy cùng nhau phát triển nhé! 🚀',
            images: ['assets/posts/poster.jpg'],
            likes: 45,
            comments: 12,
            shares: 8,
            isLiked: false,
            isSaved: false,
            createdAt: new Date('2026-03-12T10:30:00'),
            tags: ['Khởi nghiệp', 'Sản phẩm mới'],
            type: 'post',
            privacy: 'public'
        },
        {
            id: 2,
            author: {
                id: 2,
                name: 'Trần Thị B',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'tranb',
                role: 'Marketing Director',
                isVerified: false
            },
            content: '💡 Mọi người có kinh nghiệm gì về marketing trên TikTok không? Mình đang tìm hiểu và muốn tham khảo!',
            likes: 28,
            comments: 23,
            shares: 5,
            isLiked: true,
            isSaved: false,
            createdAt: new Date('2026-03-13T14:20:00'),
            tags: ['Marketing', 'TikTok'],
            type: 'question',
            privacy: 'public'
        },
        {
            id: 3,
            author: {
                id: 3,
                name: 'Lê Văn C',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'levanc',
                role: 'Founder',
                isVerified: true
            },
            content: '🎯 Sự kiện sắp tới: "Kết nối doanh nhân trẻ" tại TP.HCM. Hẹn gặp mọi người nhé!',
            images: ['assets/posts/event.jpg'],
            likes: 89,
            comments: 34,
            shares: 45,
            isLiked: false,
            isSaved: true,
            createdAt: new Date('2026-03-14T09:00:00'),
            tags: ['Sự kiện', 'Kết nối'],
            type: 'event',
            privacy: 'public'
        }
    ];

    getPosts(): Observable<SocialPost[]> {
        return of(this.posts);
    }

    getMembers(): Observable<SocialMember[]> {
        const members: SocialMember[] = [
            { id: 1, name: 'Nguyễn Văn A', username: 'nguyenvana', avatar: 'assets/avatars/avatar.jpg', role: 'CEO', company: 'Công nghệ Xanh', followers: 150, following: 80, posts: 45, isFollowing: true, isOnline: true, isVerified: true },
            { id: 2, name: 'Trần Thị B', username: 'tranb', avatar: 'assets/avatars/avatar.jpg', role: 'Marketing Director', company: 'Logistics Thành Công', followers: 120, following: 60, posts: 32, isFollowing: false, isOnline: true, isVerified: false },
            { id: 3, name: 'Lê Văn C', username: 'levanc', avatar: 'assets/avatars/avatar.jpg', role: 'Founder', company: 'Thực phẩm Sạch 365', followers: 200, following: 100, posts: 56, isFollowing: true, isOnline: false, isVerified: true },
            { id: 4, name: 'Phạm Thị D', username: 'phamd', avatar: 'assets/avatars/avatar.jpg', role: 'CTO', company: 'Nội thất Xanh', followers: 80, following: 40, posts: 28, isFollowing: false, isOnline: true, isVerified: false },
        ];
        return of(members);
    }

    getEvents(): Observable<SocialEvent[]> {
        const events: SocialEvent[] = [
            {
                id: 1,
                title: 'Webinar: Chiến lược phát triển 2026',
                description: 'Chia sẻ chiến lược phát triển kinh doanh trong bối cảnh mới',
                date: new Date('2026-03-20T14:00:00'),
                location: 'Online - Zoom',
                type: 'online',
                maxParticipants: 100,
                currentParticipants: 65,
                image: 'assets/events/webinar.jpg',
                organizer: 'Nguyễn Văn A',
                isRegistered: false
            },
            {
                id: 2,
                title: 'Meetup: Kết nối doanh nhân TP.HCM',
                description: 'Gặp gỡ, kết nối và chia sẻ kinh nghiệm kinh doanh',
                date: new Date('2026-03-25T18:00:00'),
                location: 'Quận 1, TP.HCM',
                type: 'offline',
                maxParticipants: 50,
                currentParticipants: 30,
                image: 'assets/events/Meetup.jpg',
                organizer: 'Trần Thị B',
                isRegistered: false
            }
        ];
        return of(events);
    }

    getGroups(): Observable<SocialGroup[]> {
        const groups: SocialGroup[] = [
            { id: 1, name: 'Công nghệ & Khởi nghiệp', description: 'Thảo luận về công nghệ và xu hướng khởi nghiệp', icon: 'fa-solid fa-microchip', members: 120, posts: 45, isJoined: true, isPrivate: false },
            { id: 2, name: 'Marketing & Branding', description: 'Chia sẻ kiến thức marketing và xây dựng thương hiệu', icon: 'fa-solid fa-bullhorn', members: 85, posts: 32, isJoined: false, isPrivate: false },
            { id: 3, name: 'Tài chính & Đầu tư', description: 'Thảo luận về tài chính doanh nghiệp và đầu tư', icon: 'fa-solid fa-chart-line', members: 60, posts: 28, isJoined: false, isPrivate: true },
        ];
        return of(groups);
    }

    likePost(postId: number): Observable<any> {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
        }
        return of({ success: true });
    }

    savePost(postId: number): Observable<any> {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isSaved = !post.isSaved;
        }
        return of({ success: true });
    }

    createPost(content: string, images?: string[]): Observable<SocialPost> {
        const newPost: SocialPost = {
            id: Date.now(),
            author: {
                id: 999,
                name: 'Bạn',
                avatar: 'assets/avatars/avatar.jpg',
                username: 'current_user',
                role: 'Thành viên',
                isVerified: false
            },
            content: content,
            images: images || [],
            likes: 0,
            comments: 0,
            shares: 0,
            isLiked: false,
            isSaved: false,
            createdAt: new Date(),
            type: 'post',
            privacy: 'public'
        };
        this.posts.unshift(newPost);
        return of(newPost);
    }
}