import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
    SocialPost,
    SocialMember,
    SocialEvent,
    SocialGroup,
    SocialComment,
    CreatePostRequest,
    GetPostsQuery,
    UpdatePostRequest,
    EventType
} from '../models/social.model';
import { PagedResponse } from '@core/models/paged-response.model';
import { ApiResponse } from '@core/models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class SocialService {
    private readonly _baseSocialUrl = 'Social';
    private readonly _baseSocialInteractionUrl = 'socialInteraction';

    constructor(private _apiService: ApiService) { }

    _mockPosts = [];

    // ===== POSTS =====
    getPosts(query: GetPostsQuery = {}): Observable<PagedResponse<SocialPost>> {
        const params: any = {
            pageNumber: query.pageNumber || 1,
            pageSize: query.pageSize || 10
        };
        if (query.type) params.type = query.type;
        if (query.privacy) params.privacy = query.privacy;
        if (query.tag) params.tag = query.tag;

        return this._apiService.get<PagedResponse<SocialPost>>(
            `${this._baseSocialUrl}/posts`,
            params
        );
    }

    getPendingPosts(pageNumber = 1, pageSize = 10): Observable<PagedResponse<SocialPost>> {
        return this._apiService.get<PagedResponse<SocialPost>>(
            `${this._baseSocialUrl}/posts/pending`,
            { pageNumber, pageSize }
        );
    }

    approvePost(id: string): Observable<SocialPost> {
        return this._apiService.post<SocialPost>(`${this._baseSocialUrl}/posts/${id}/approve`, {});
    }

    rejectPost(id: string, reason?: string): Observable<SocialPost> {
        return this._apiService.post<SocialPost>(
            `${this._baseSocialUrl}/posts/${id}/reject`,
            reason ?? null
        );
    }

    getPostById(id: string): Observable<any> {
        return this._apiService.get<SocialPost>(`${this._baseSocialUrl}/posts/${id}`);
    }

    createPost(data: CreatePostRequest): Observable<SocialPost> {
        return this._apiService.post<SocialPost>(`${this._baseSocialUrl}/posts`, data);
    }

    updatePost(id: string, data: UpdatePostRequest): Observable<SocialPost> {
        return this._apiService.put<SocialPost>(`${this._baseSocialUrl}/posts/${id}`, data);
    }

    deletePost(id: string): Observable<void> {
        return this._apiService.delete<void>(`${this._baseSocialUrl}/posts/${id}`);
    }

    // ===== MEMBERS =====
    // ❌ CHƯA CÓ API - Giữ mock
    getMembers(): Observable<SocialMember[]> {
        const members: SocialMember[] = [
            // Mock data
        ];
        return of(members).pipe(delay(300));
    }

    // ===== EVENTS =====
    // ❌ CHƯA CÓ API - Giữ mock
    getEvents(): Observable<SocialEvent[]> {
        const events: SocialEvent[] = [
            {
                id: 1,
                title: 'Webinar: Chiến lược phát triển 2026',
                description: 'Chia sẻ chiến lược phát triển kinh doanh trong bối cảnh mới',
                date: new Date('2026-03-20T14:00:00'),
                location: 'Online - Zoom',
                type: EventType.Online,
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
                type: EventType.Offline,
                maxParticipants: 50,
                currentParticipants: 30,
                image: 'assets/events/Meetup.jpg',
                organizer: 'Trần Thị B',
                isRegistered: false
            }
        ];
        return of(events).pipe(delay(300));
    }

    // ===== GROUPS =====
    // ❌ CHƯA CÓ API - Giữ mock
    getGroups(): Observable<SocialGroup[]> {
        const groups: SocialGroup[] = [
            { id: 1, name: 'Công nghệ & Khởi nghiệp', description: 'Thảo luận về công nghệ và xu hướng khởi nghiệp', icon: 'fa-solid fa-microchip', members: 120, posts: 45, isJoined: true, isPrivate: false },
            { id: 2, name: 'Marketing & Branding', description: 'Chia sẻ kiến thức marketing và xây dựng thương hiệu', icon: 'fa-solid fa-bullhorn', members: 85, posts: 32, isJoined: false, isPrivate: false },
            { id: 3, name: 'Tài chính & Đầu tư', description: 'Thảo luận về tài chính doanh nghiệp và đầu tư', icon: 'fa-solid fa-chart-line', members: 60, posts: 28, isJoined: false, isPrivate: true },
        ];
        return of(groups).pipe(delay(300));
    }

    // ===== INTERACTIONS =====
    likePost(postId: any): Observable<{ success: boolean }> {
        const url = `${this._baseSocialInteractionUrl}/posts/${postId}/like`;
        return this._apiService.post(url, {})
    }

    getLikeStatus(postId: any): Observable<any> {
        const url = `${this._baseSocialInteractionUrl}/posts/${postId}/like-status`;
        return this._apiService.get(url, {})
    }

    // ❌ CHƯA CÓ API - Giữ mock
    savePost(postId: any): Observable<{ success: boolean }> {
        // const post = this._mockPosts.find(p => p.id === postId);
        // if (post) {
        //     post.isSaved = !post.isSaved;
        // }
        return of({ success: true }).pipe(delay(200));
    }

    sharePost(postId: string): Observable<ApiResponse<any>> {
        const url = `${this._baseSocialInteractionUrl}/posts/${postId}/share`;
        return this._apiService.post<ApiResponse<any>>(url, {});
    }
}