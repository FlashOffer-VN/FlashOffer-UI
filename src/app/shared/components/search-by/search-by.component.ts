// src/app/shared/components/search-by/search-by.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';
import type { SearchFieldOption } from '@core/constants/search-fields';

/**
 * Bộ chọn "tìm theo" (chọn cột tìm kiếm) dùng chung cho mọi màn danh sách.
 *
 * Bọc sẵn ô `app-ng-select-wrapper` + nhãn/placeholder chuẩn để không phải lặp khối
 * markup ở từng trang. Giá trị hai chiều qua `[(value)]`. Đổi lựa chọn KHÔNG tự tải
 * lại — trang tự quyết khi bấm Enter/nút Tìm (giữ nguyên hành vi cũ).
 */
@Component({
    selector: 'app-search-by',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslateModule, NgSelectWrapperComponent],
    templateUrl: './search-by.component.html',
    // :host dùng display: contents để div bọc ngoài trở thành flex-item của hàng lọc
    // y như khối inline cũ — giữ nguyên giao diện.
    styles: [':host { display: contents; }']
})
export class SearchByComponent {
    /** Danh sách cột tìm kiếm; `value` = `''` nghĩa là tìm mọi trường. */
    @Input() options: SearchFieldOption[] = [];

    /** Cột đang chọn (two-way qua `[(value)]`). */
    @Input() value: string | null = null;
    @Output() valueChange = new EventEmitter<string | null>();

    /** Class bọc ngoài; mặc định khớp các trang admin hiện có. */
    @Input() wrapperClass = 'flex-shrink-0 w-full sm:w-56';

    onValueChange(value: string | null): void {
        this.value = value;
        this.valueChange.emit(value);
    }
}
