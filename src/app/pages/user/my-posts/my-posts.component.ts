// src/app/pages/user/my-posts/my-posts.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import { socialPostSearchFields } from '@core/constants/search-fields';
import { PagedResponse } from '@core/models/paged-response.model';
import { GetPostsQuery, SocialPost } from '@core/models/social.model';

import { isBrowser } from '@core/utils/platform';
import { copyToClipboard } from '@core/utils/share-link';
import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { InputComponent } from '@shared/components/input/input.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';

import { PostCardComponent } from '@pages/social/components/post-card/post-card.component';
import { PostDetailModalComponent } from '@pages/social/components/post-detail-modal/post-detail-modal.component';
import { PostEditModalComponent } from '@pages/social/components/post-edit-modal/post-edit-modal.component';

/** Bài viết của tôi: bài do chính mình đăng, kèm trạng thái duyệt */
@Component({
    selector: 'app-my-posts',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TranslateModule, AppDatePipe,
        BadgeComponent, ButtonComponent, LoadingComponent,
        PaginationComponent, StatusTabsComponent, PostCardComponent, PostEditModalComponent,
        InputComponent, SearchByComponent
    ],
    template: `
        <div class="space-y-6">
            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 class="text-xl font-bold text-slate-800">{{ 'USER.MY_POSTS.TITLE' | translate }}</h1>
                        <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_POSTS.DESCRIPTION' | translate }}</p>
                    </div>
                    <app-button variant="primary" size="sm" (onClick)="onCreate()">
                        <i class="fa-solid fa-plus mr-2"></i>{{ 'USER.MY_POSTS.CREATE_NEW' | translate }}
                    </app-button>
                </div>

                <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)"></app-status-tabs>
            </section>

            <!-- Tìm kiếm + chọn cột tìm kiếm (bỏ trống = tất cả) -->
            <section class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div class="flex flex-wrap items-end gap-3" style="--control-h: 2.5rem">
                    <app-search-by [options]="searchFieldOptions" [(value)]="searchField"></app-search-by>

                    <div class="w-full sm:flex-1 sm:min-w-0">
                        <app-input [(ngModel)]="searchText" [placeholder]="'USER.MY_POSTS.SEARCH_PLACEHOLDER' | translate"
                            (keyup.enter)="onSearch()"></app-input>
                    </div>

                    <app-button variant="primary" (onClick)="onSearch()">
                        <i class="fas fa-search mr-2"></i>{{ 'COMMON.BUTTON.SEARCH' | translate }}
                    </app-button>
                </div>
            </section>

            @if (isLoading) {
            <div class="flex justify-center py-10">
                <app-loading></app-loading>
            </div>
            } @else if (posts.length === 0) {
            <section class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
                <i class="fa-solid fa-newspaper mb-3 text-3xl text-slate-300"></i>
                <p class="font-medium">{{ 'USER.MY_POSTS.EMPTY' | translate }}</p>
                <p class="mt-1 text-xs text-slate-400">{{ 'USER.MY_POSTS.EMPTY_HINT' | translate }}</p>
            </section>
            } @else {
            <section class="space-y-5">
                @for (post of posts; track post.id) {
                <div class="space-y-2">
                    <div class="flex flex-wrap items-center gap-3 px-1">
                        <app-badge [variant]="post.isApproved ? 'success' : 'warning'"
                            [label]="(post.isApproved ? 'USER.MY_POSTS.APPROVED' : 'USER.MY_POSTS.PENDING') | translate"></app-badge>
                        <span class="text-xs text-slate-400">{{ post.createdAt | appDate }}</span>
                        <app-button class="ml-auto" variant="secondary" size="sm" (onClick)="openDetail(post)">
                            {{ 'COMMON.BUTTON.VIEW_DETAIL' | translate }}
                        </app-button>
                    </div>

                    <app-post-card [post]="post" [canEdit]="true" [canDelete]="true" [canPin]="false"
                        (like)="toggleLike($event)" (share)="sharePost($event)" (save)="toggleSave($event)"
                        (edit)="openEdit($event)"
                        (toggleReadMore)="toggleReadMore($event)" (delete)="deletePost($event)">
                    </app-post-card>
                </div>
                }

                <div class="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <app-pagination [pageNumber]="pageNumber" [pageSize]="pageSize" [totalCount]="totalCount"
                        [totalPages]="totalPages" [hasPreviousPage]="hasPreviousPage" [hasNextPage]="hasNextPage"
                        (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)"></app-pagination>
                </div>
            </section>
            }
        </div>

        <!-- Modal sửa bài viết (component dùng chung) -->
        <app-post-edit-modal [post]="editingPost" (saved)="onPostSaved()" (closed)="editingPost = null">
        </app-post-edit-modal>
    `,
})
export class MyPostsPageComponent implements OnInit {
    posts: SocialPost[] = [];
    isLoading = true;

    /** Bài đang sửa trong modal sửa bài viết */
    editingPost: SocialPost | null = null;

    /** Từ khoá + cột tìm kiếm (bỏ trống = mọi trường) */
    searchText = '';
    searchField: string | null = null;
    searchFieldOptions: { value: string; label: string }[] = [];

    activeTab = 'all';
    tabs: { key: string; label: string }[] = [];

    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    constructor(
        private readonly _appService: AppService,
        private readonly _router: Router
    ) { }

    ngOnInit(): void {
        this.buildTabs();
        this.searchFieldOptions = socialPostSearchFields((key: string) => this._appService.trans(key));
        this.loadData();
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    /** Enter/nút Tìm mới gọi lại API (đổi cột không tự tải) */
    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    onPageChange(page: number): void {
        this.pageNumber = page;
        this.loadData();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.pageNumber = 1;
        this.loadData();
    }

    onCreate(): void {
        this._router.navigate(['/social']);
    }

    toggleReadMore(post: SocialPost): void {
        post.isExpanded = !post.isExpanded;
    }

    toggleLike(post: SocialPost): void {
        this._appService.socialService.likePost(post.id).subscribe({
            next: () => {
                post.isLiked = !post.isLiked;
                post.likesCount = Math.max(0, post.likesCount + (post.isLiked ? 1 : -1));
            },
            error: () => this._appService.showError(this._appService.trans('SOCIAL.LIKE_ERROR'))
        });
    }

    toggleSave(post: SocialPost): void {
        this._appService.socialService.savePost(post.id).subscribe({
            next: () => {
                post.isSaved = !post.isSaved;
                this._appService.showSuccess(
                    post.isSaved ? this._appService.trans('SOCIAL.SAVE_SUCCESS') : this._appService.trans('SOCIAL.UNSAVE_SUCCESS')
                );
            },
            error: () => this._appService.showError(this._appService.trans('SOCIAL.SAVE_ERROR'))
        });
    }

    sharePost(post: SocialPost): void {
        if (isBrowser()) {
            copyToClipboard(`${window.location.origin}/social/${post.id}`)
                .then(() => this._appService.showSuccess(this._appService.trans('SOCIAL.SHARE_SUCCESS')));
        }

        this._appService.socialService.sharePost(post.id).subscribe({
            next: () => {
                post.sharesCount = (post.sharesCount || 0) + 1;
            },
            error: () => { }
        });
    }

    /** Mở modal sửa bài viết (dùng chung với bảng tin) */
    openEdit(post: SocialPost): void {
        this.editingPost = post;
    }

    onPostSaved(): void {
        this.editingPost = null;
        this.loadData();
    }

    /** Mở chi tiết bài viết bằng modal dùng chung của bảng tin */
    openDetail(post: SocialPost): void {
        this._appService.socialService.getPostById(post.id).subscribe({
            next: (response) => {
                const modalRef = this._appService.modal.create(ModalComponent, {
                    contentComponent: PostDetailModalComponent,
                    contentData: { post: response.data },
                    size: 'lg',
                    customWidth: '800px',
                    showCancel: false,
                    title: '',
                    showHeader: false,
                    showFooter: false,
                    showCloseButton: false,
                });

                const contentInstance = modalRef.contentComponentRef?.instance as PostDetailModalComponent | undefined;

                contentInstance?.close?.subscribe(() => this.loadData());
                contentInstance?.liked?.subscribe(() => this.loadData());
                contentInstance?.shared?.subscribe(() => this.loadData());
            },
            error: () => this._appService.showError(this._appService.trans('SOCIAL.LOAD_POST_ERROR'))
        });
    }

    async deletePost(post: SocialPost): Promise<void> {
        const message = this._appService.trans('SOCIAL.CONFIRM_DELETE_MESSAGE', {
            title: post.title || post.content.slice(0, 50) + '...'
        });

        if (!await this._appService.confirmDelete(message)) return;

        this._appService.socialService.deletePost(post.id).subscribe({
            next: () => {
                this._appService.showSuccess(this._appService.trans('SOCIAL.DELETE_POST_SUCCESS'));
                this.loadData();
            },
            error: () => this._appService.showError(this._appService.trans('SOCIAL.DELETE_POST_ERROR'))
        });
    }

    /** Chỉ lấy bài viết của chính mình; tab trạng thái truyền isApproved */
    private loadData(): void {
        this.isLoading = true;

        const query: GetPostsQuery = {
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            mineOnly: true,
            search: this.searchText,
            searchField: this.searchField ?? undefined
        };

        if (this.activeTab !== 'all') {
            query.isApproved = this.activeTab === 'approved';
        }

        this._appService.socialService.getPosts(query).subscribe({
            next: (response: PagedResponse<SocialPost>) => {
                this.posts = response?.data ?? [];
                this.pageNumber = response?.pageNumber ?? this.pageNumber;
                this.pageSize = response?.pageSize ?? this.pageSize;
                this.totalCount = response?.totalCount ?? 0;
                this.totalPages = response?.totalPages ?? 0;
                this.hasPreviousPage = response?.hasPreviousPage ?? false;
                this.hasNextPage = response?.hasNextPage ?? false;
                this.isLoading = false;
            },
            error: (error: { message?: string }) => {
                this.posts = [];
                this.isLoading = false;
                this._appService.showError(error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: 'approved', label: this._appService.trans('USER.MY_POSTS.APPROVED') },
            { key: 'pending', label: this._appService.trans('USER.MY_POSTS.PENDING') }
        ];
    }
}
