import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { SocialPost } from '@core/models/social.model';
import { PagedResponse } from '@core/models/paged-response.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
    selector: 'app-admin-social-post-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, ButtonComponent, LoadingComponent, PaginationComponent],
    templateUrl: './social-post-list.component.html',
    styleUrls: ['./social-post-list.component.css']
})
export class AdminSocialPostListComponent implements OnInit {
    posts: SocialPost[] = [];
    isLoading = true;
    isActionLoading = false;
    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;
    selectedPost: SocialPost | null = null;

    constructor(private readonly appService: AppService) { }

    ngOnInit(): void {
        this.loadPosts();
    }

    loadPosts(): void {
        this.isLoading = true;
        this.appService.socialService.getPendingPosts(this.pageNumber, this.pageSize).subscribe({
            next: (response: PagedResponse<SocialPost>) => {
                this.posts = response.data;
                this.pageNumber = response.pageNumber;
                this.pageSize = response.pageSize;
                this.totalCount = response.totalCount;
                this.totalPages = response.totalPages;
                this.hasPreviousPage = response.hasPreviousPage;
                this.hasNextPage = response.hasNextPage;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.appService.showError(this.appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    approve(post: SocialPost): void {
        this.isActionLoading = true;
        this.appService.socialService.approvePost(post.id).subscribe({
            next: () => {
                this.isActionLoading = false;
                this.appService.showSuccess(this.appService.trans('ADMIN.SOCIAL.APPROVED_SUCCESS'));
                this.loadPosts();
            },
            error: () => {
                this.isActionLoading = false;
                this.appService.showError(this.appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    reject(post: SocialPost): void {
        this.isActionLoading = true;
        this.appService.socialService.rejectPost(post.id).subscribe({
            next: () => {
                this.isActionLoading = false;
                this.appService.showSuccess(this.appService.trans('ADMIN.SOCIAL.REJECTED_SUCCESS'));
                this.loadPosts();
            },
            error: () => {
                this.isActionLoading = false;
                this.appService.showError(this.appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    openPostDetail(post: SocialPost): void {
        this.selectedPost = post;
    }

    closePostDetail(): void {
        this.selectedPost = null;
    }

    getContentPreview(content: string): string {
        const plainText = content
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return plainText.length > 140 ? `${plainText.substring(0, 140).trim()}...` : plainText;
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadPosts();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.pageNumber = 1;
        this.loadPosts();
    }

    formatDate(value: string): string {
        return new Date(value).toLocaleString('vi-VN');
    }
}
