import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { LoadingComponent } from '@shared/components/loading/loading.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputComponent } from '@shared/components/input/input.component';
import { CheckboxComponent } from '@shared/components/checkbox/checkbox.component';

/** Một tài khoản hiển thị trong danh sách chọn. */
export interface UserPickerItem {
    id: string;
    username: string;
    fullName: string;
    roleName?: string;
}

/**
 * Danh sách tài khoản có ô tìm kiếm và tick chọn nhiều — chỉ hiển thị, không tự gọi API:
 * nơi dùng truyền vào danh sách và tự nạp lại khi nhận sự kiện tìm kiếm.
 */
@Component({
    selector: 'app-user-picker',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, LoadingComponent, ButtonComponent, InputComponent,
        CheckboxComponent
    ],
    template: `
        <div class="flex gap-2">
            <app-input [(ngModel)]="search" (keyup.enter)="emitSearch()" [id]="'user_picker_search'"
                [placeholder]="'COMMON.USER_PICKER.SEARCH_PLACEHOLDER' | translate">
            </app-input>
            <app-button variant="outline" [title]="'COMMON.BUTTON.SEARCH' | translate" (click)="emitSearch()">
                <i class="fa-solid fa-magnifying-glass"></i>
            </app-button>
        </div>

        <div class="mt-3 max-h-80 overflow-y-auto">
            @if (loading) {
                <app-loading></app-loading>
            } @else if (users.length === 0) {
                <p class="text-sm text-gray-500 py-4 text-center">{{ 'COMMON.USER_PICKER.EMPTY' | translate }}</p>
            } @else {
                @for (user of users; track user.id) {
                    <label class="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                        <app-checkbox [ngModel]="isSelected(user.id)" (ngModelChange)="toggle(user)" />
                        <span class="text-sm">
                            <span class="block text-gray-900">{{ user.fullName }}</span>
                            <span class="block text-xs text-gray-500">
                                {{ user.username }}@if (user.roleName) { · {{ user.roleName }} }
                            </span>
                        </span>
                    </label>
                }
            }
        </div>
    `
})
export class UserPickerComponent {
    /** Danh sách tài khoản do nơi dùng nạp sẵn. */
    @Input() users: UserPickerItem[] = [];

    /** Đang nạp danh sách. */
    @Input() loading = false;

    /** Id các tài khoản đang được chọn. */
    @Input() selectedIds: string[] = [];

    /** Danh sách tài khoản đang chọn thay đổi. */
    @Output() selectedIdsChange = new EventEmitter<string[]>();

    /** Người dùng bấm tìm kiếm — nơi dùng nạp lại danh sách theo từ khoá này. */
    @Output() searchChange = new EventEmitter<string>();

    search = '';

    isSelected(userId: string): boolean {
        return this.selectedIds.includes(userId);
    }

    toggle(user: UserPickerItem): void {
        this.selectedIdsChange.emit(this.isSelected(user.id)
            ? this.selectedIds.filter(id => id !== user.id)
            : [...this.selectedIds, user.id]);
    }

    emitSearch(): void {
        this.searchChange.emit(this.search.trim());
    }
}
