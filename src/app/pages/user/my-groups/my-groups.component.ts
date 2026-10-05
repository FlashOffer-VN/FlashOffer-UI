// src/app/pages/user/my-groups/my-groups.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppService } from '@core/services/app.service';
import {
    BusinessGroup,
    BusinessGroupType,
    GroupApprovalStatus,
    GroupMemberStatus,
    GroupMineRole
} from '@core/models/business-group.model';

import { AppDatePipe } from '@shared/pipes/app-date.pipe';
import { BadgeComponent } from '@shared/components/badge/badge.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatusTabsComponent } from '@shared/components/status-tabs/status-tabs.component';
import { SearchByComponent } from '@shared/components/search-by/search-by.component';
import { businessGroupSearchFields, SearchFieldOption } from '@core/constants/search-fields';
import { NgxFilterDaterangeComponent } from '@shared/components/filter-daterange/ngx-filter-daterange.component';

/** Nhóm của tôi: nhóm mình tạo và nhóm mình đã tham gia (nhóm ngành + hội nhóm) */
@Component({
    selector: 'app-my-groups',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TranslateModule, AppDatePipe,
        BadgeComponent, ButtonComponent, InputComponent, LoadingComponent,
        PaginationComponent, StatusTabsComponent, SearchByComponent, NgxFilterDaterangeComponent
    ],
    template: `
        <div class="space-y-6">
            <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 class="text-xl font-bold text-slate-800">{{ 'USER.MY_GROUPS.TITLE' | translate }}</h1>
                        <p class="mt-1 text-sm text-slate-500">{{ 'USER.MY_GROUPS.DESCRIPTION' | translate }}</p>
                    </div>
                    <app-button variant="primary" size="sm" (onClick)="onCreate()">
                        <i class="fa-solid fa-plus mr-2"></i>{{ 'USER.MY_GROUPS.CREATE_NEW' | translate }}
                    </app-button>
                </div>

                <div class="flex flex-wrap items-end gap-x-4 gap-y-4" style="--control-h: 2.5rem">
                    <!-- Nhóm tìm kiếm: chọn cột + từ khoá + nút -->
                    <div class="flex w-full flex-wrap items-end gap-3 lg:flex-1 lg:min-w-0">
                        <app-search-by [options]="searchFieldOptions" [(value)]="searchField"></app-search-by>
                        <div class="w-full lg:flex-1 lg:min-w-0">
                            <app-input [(ngModel)]="searchText" [label]="'USER.MY_GROUPS.SEARCH_LABEL' | translate"
                                [placeholder]="'USER.MY_GROUPS.SEARCH_PLACEHOLDER' | translate"
                                (keyup.enter)="onSearch()"></app-input>
                        </div>
                        <app-button variant="primary" (onClick)="onSearch()">
                            <i class="fas fa-search mr-2"></i>{{ 'COMMON.BUTTON.SEARCH' | translate }}
                        </app-button>
                        <app-button variant="outline" (onClick)="onReset()">
                            <i class="fas fa-rotate-left mr-2"></i>{{ 'COMMON.BUTTON.RESET' | translate }}
                        </app-button>
                    </div>

                    <!-- Nhóm lọc: khoảng ngày -->
                    <div
                        class="flex w-full flex-wrap items-end gap-3 border-t border-gray-200 pt-3 lg:w-auto lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                        <ngx-filter-daterange [from]="fromDate" [to]="toDate"
                            (rangeChange)="onRangeChange($event)"></ngx-filter-daterange>
                    </div>
                </div>

                <div class="mt-4 border-t border-gray-200 pt-4">
                    <app-status-tabs [items]="tabs" [active]="activeTab" (change)="onTabChange($event)"></app-status-tabs>
                </div>
            </section>

            @if (isLoading) {
            <div class="flex justify-center py-10">
                <app-loading></app-loading>
            </div>
            } @else if (groups.length === 0) {
            <section class="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
                <i class="fas fa-people-group mb-3 text-3xl text-slate-300"></i>
                <p class="font-medium">{{ 'USER.MY_GROUPS.EMPTY' | translate }}</p>
                <p class="mt-1 text-xs text-slate-400">{{ 'USER.MY_GROUPS.EMPTY_HINT' | translate }}</p>
            </section>
            } @else {
            <section class="grid gap-5 sm:grid-cols-2">
                @for (group of groups; track group.id) {
                <article class="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                    <div class="flex flex-wrap items-center gap-2 px-5 pt-5">
                        <app-badge [variant]="group.type === businessGroupType.Industry ? 'info' : 'primary'"
                            [label]="(group.type === businessGroupType.Industry ? 'USER.MY_GROUPS.TYPE_INDUSTRY' : 'USER.MY_GROUPS.TYPE_COMMUNITY') | translate"></app-badge>
                        @if (group.isOwner) {
                        <app-badge variant="success" [label]="'USER.MY_GROUPS.OWNER' | translate"></app-badge>
                        }
                        @if (group.approvalStatus === approvalStatus.Pending) {
                        <app-badge variant="warning" [label]="'USER.MY_GROUPS.APPROVAL_PENDING' | translate"></app-badge>
                        }
                        @if (group.approvalStatus === approvalStatus.Rejected) {
                        <app-badge variant="danger" [label]="'USER.MY_GROUPS.APPROVAL_REJECTED' | translate"></app-badge>
                        }
                        @if (group.myMemberStatus === memberStatus.Pending) {
                        <app-badge variant="warning" [label]="'USER.MY_GROUPS.MY_STATUS_PENDING' | translate"></app-badge>
                        }
                    </div>

                    <div class="flex flex-1 flex-col px-5 py-4">
                        <h2 class="text-base font-semibold text-slate-800">{{ group.name }}</h2>
                        <p class="text-xs text-slate-400">
                            {{ group.businessGroupCode || '--' }}
                            @if (group.businessFieldName) {
                            <span> · {{ group.businessFieldName }}</span>
                            }
                        </p>
                        @if (group.topic || group.description) {
                        <p class="mt-2 line-clamp-2 text-sm text-slate-500">{{ group.topic || group.description }}</p>
                        }

                        <div class="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span><i class="fa-solid fa-users mr-1 text-primary"></i>{{ group.membersCount }}
                                {{ 'USER.MY_GROUPS.MEMBERS' | translate }}</span>
                            <span><i class="fa-solid fa-newspaper mr-1 text-primary"></i>{{ group.postsCount }}
                                {{ 'USER.MY_GROUPS.POSTS' | translate }}</span>
                            <span><i class="fa-regular fa-clock mr-1 text-primary"></i>{{ group.createdAt | appDate }}</span>
                        </div>

                        @if (group.isOwner && group.pendingMembersCount > 0) {
                        <p class="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                            <i class="fa-solid fa-user-clock mr-1"></i>
                            {{ 'USER.MY_GROUPS.PENDING_MEMBERS' | translate:{ count: group.pendingMembersCount } }}
                        </p>
                        }
                    </div>

                    <div class="border-t border-slate-100 px-5 py-3">
                        <app-button variant="primary" size="sm" (onClick)="openGroup(group)">
                            {{ (group.isOwner ? 'USER.MY_GROUPS.MANAGE_GROUP' : 'USER.MY_GROUPS.VIEW_GROUP') | translate }}
                        </app-button>
                    </div>
                </article>
                }
            </section>

            <div class="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                <app-pagination [pageNumber]="pageNumber" [pageSize]="pageSize" [totalCount]="totalCount"
                    [totalPages]="totalPages" [hasPreviousPage]="hasPreviousPage" [hasNextPage]="hasNextPage"
                    (pageChange)="onPageChange($event)" (pageSizeChange)="onPageSizeChange($event)"></app-pagination>
            </div>
            }
        </div>
    `,
})
export class MyGroupsPageComponent implements OnInit {
    groups: BusinessGroup[] = [];
    isLoading = true;

    activeTab = 'all';
    tabs: { key: string; label: string }[] = [];

    searchText = '';

    /** Cột tìm kiếm (khớp searchField API); bỏ trống = tìm mọi trường */
    searchField: string | null = null;
    searchFieldOptions: SearchFieldOption[] = [];

    /** Khoảng ngày tạo nhóm (YYYY-MM-DD) */
    fromDate: string | null = null;
    toDate: string | null = null;

    pageNumber = 1;
    pageSize = 12;
    totalCount = 0;
    totalPages = 0;
    hasPreviousPage = false;
    hasNextPage = false;

    readonly businessGroupType = BusinessGroupType;
    readonly approvalStatus = GroupApprovalStatus;
    readonly memberStatus = GroupMemberStatus;

    constructor(
        private readonly _appService: AppService,
        private readonly _router: Router
    ) { }

    ngOnInit(): void {
        this.buildTabs();
        this.buildSearchFieldOptions();
        this.loadData();
    }

    /** Các cột tìm kiếm dùng chung (BusinessGroupSearchField). */
    private buildSearchFieldOptions(): void {
        const t = (key: string) => this._appService.trans(key);
        this.searchFieldOptions = businessGroupSearchFields(t);
    }

    onTabChange(tab: string): void {
        this.activeTab = tab;
        this.pageNumber = 1;
        this.loadData();
    }

    onSearch(): void {
        this.pageNumber = 1;
        this.loadData();
    }

    /** Đổi khoảng ngày thì tải lại (bỏ trống = không lọc ngày). */
    onRangeChange(range: { from: string | null; to: string | null }): void {
        this.fromDate = range.from;
        this.toDate = range.to;
        this.pageNumber = 1;
        this.loadData();
    }

    /** Đặt lại toàn bộ bộ lọc: từ khoá, cột tìm kiếm và khoảng ngày. */
    onReset(): void {
        this.searchText = '';
        this.searchField = null;
        this.fromDate = null;
        this.toDate = null;
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
        // Tạo hội nhóm mới nằm ở bảng tin (khối "Hội nhóm của bạn")
        this._router.navigate(['/social']);
    }

    /** Mở trang nhóm — chủ nhóm duyệt thành viên ngay trong trang này */
    openGroup(group: BusinessGroup): void {
        this._router.navigate(['/groups', group.id]);
    }

    private loadData(): void {
        this.isLoading = true;

        this._appService.businessGroupService.getMine({
            page: this.pageNumber,
            pageSize: this.pageSize,
            search: this.searchText,
            searchField: this.searchField ?? undefined,
            mineRole: this.currentRole(),
            fromDate: this.fromDate ?? undefined,
            toDate: this.toDate ?? undefined
        }).subscribe({
            next: (response) => {
                this.groups = response?.data ?? [];
                this.pageNumber = response?.pageNumber ?? this.pageNumber;
                this.pageSize = response?.pageSize ?? this.pageSize;
                this.totalCount = response?.totalCount ?? 0;
                this.totalPages = response?.totalPages ?? 0;
                this.hasPreviousPage = response?.hasPreviousPage ?? false;
                this.hasNextPage = response?.hasNextPage ?? false;
                this.isLoading = false;
            },
            error: (error: { message?: string }) => {
                this.groups = [];
                this.isLoading = false;
                this._appService.showError(error?.message || this._appService.trans('COMMON.ERROR.LOAD_FAILED'));
            }
        });
    }

    /** Vai trò lọc theo tab đang chọn (tab "Tất cả" thì lấy cả nhóm tạo và nhóm tham gia) */
    private currentRole(): GroupMineRole | null {
        if (this.activeTab === 'created') return GroupMineRole.Created;
        if (this.activeTab === 'joined') return GroupMineRole.Joined;
        return null;
    }

    private buildTabs(): void {
        this.tabs = [
            { key: 'all', label: this._appService.trans('COMMON.ALL') },
            { key: 'created', label: this._appService.trans('USER.MY_GROUPS.CREATED_BY_ME') },
            { key: 'joined', label: this._appService.trans('USER.MY_GROUPS.JOINED') }
        ];
    }
}
