import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';
import { SocialPost } from '@core/models/social.model';
import { PagedResponse } from '@core/models/paged-response.model';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

@Component({
    selector: 'app-admin-social-post-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        TranslateModule,
        ButtonComponent,
        InputComponent,
        LoadingComponent,
        PaginationComponent,
        StatusTabsComponent,
        NgxFilterDaterangeComponent
    ],
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

    // Search + date range
    searchText = '';
    fromDate: string | null = null;
    toDate: string | null = null;

    // Tab lọc status (All / Pending / Approved / Deleted)
    activeStatus = 'all';
    tabs: { key: string; label: string }[] = [];

    constructor(private readonly appService: AppService) { }

    ngOnInit(): void {
        this.buildTabs();
        this.loadPosts();
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this.appService.trans('COMMON.ALL') },
            { key: 'pending', label: this.appService.trans('COMMON.STATUS.PENDING') },
            { key: 'approved', label: this.appService.trans('COMMON.STATUS.APPROVED') },
            { key: 'deleted', label: this.appService.trans('COMMON.STATUS.DELETED') }
        ];
    }

    onTabChange(tab: string): void {
        this.activeStatus = tab;
        this.pageNumber = 1;
        this.loadPosts();
    }

    loadPosts(): void {
        this.isLoading = true;
        this.appService.socialService.getAdminPosts(
            this.activeStatus,
            this.pageNumber,
            this.pageSize,
            this.searchText,
            this.fromDate ?? undefined,
            this.toDate ?? undefined
        ).subscribe({
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

    restore(post: SocialPost): void {
        this.isActionLoading = true;
        this.appService.socialService.restorePost(post.id).subscribe({
            next: () => {
                this.isActionLoading = false;
                this.appService.showSuccess(this.appService.trans('ADMIN.SOCIAL.RESTORED_SUCCESS'));
                this.loadPosts();
            },
            error: () => {
                this.isActionLoading = false;
                this.appService.showError(this.appService.trans('COMMON.ERROR.UPDATE_FAILED'));
            }
        });
    }

    /**
     * Xóa mềm bài viết (Admin) — áp dụng cho cả bài đã duyệt lẫn chưa duyệt.
     */
    delete(post: SocialPost): void {
        const name = post.title || post.author?.fullName || this.appService.trans('ADMIN.SOCIAL.UNTITLED');
        this.appService.confirmDelete(
            this.appService.trans('ADMIN.SOCIAL.DELETE_CONFIRM', { name })
        ).then(confirmed => {
            if (!confirmed) return;
            this.isActionLoading = true;
            this.appService.socialService.deletePost(post.id).subscribe({
                next: () => {
                    this.isActionLoading = false;
                    this.appService.showSuccess(this.appService.trans('ADMIN.SOCIAL.DELETED_SUCCESS'));
                    this.loadPosts();
                },
                error: () => {
                    this.isActionLoading = false;
                    this.appService.showError(this.appService.trans('COMMON.ERROR.UPDATE_FAILED'));
                }
            });
        });
    }

    openPostDetail(post: SocialPost): void {
        this.selectedPost = post;
    }

    closePostDetail(): void {
        this.selectedPost = null;
    }

    /**
     * Dòng nhỏ mờ dưới tên: "UserCode - username" (fallback username/fullName).
     */
    getAuthorCode(author: any): string {
        if (!author) return '';
        if (author.userCode) {
            return `${author.userCode} - ${author.username || author.fullName || ''}`;
        }
        return author.username || author.fullName || '';
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

    onSearch(): void {
        this.pageNumber = 1;
        this.loadPosts();
    }

    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
        this.pageNumber = 1;
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