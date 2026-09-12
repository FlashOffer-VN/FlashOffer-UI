import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProvinceOption, VN_PROVINCES } from '@core/data/vn-provinces.data';

/**
 * Nguồn dữ liệu tỉnh/thành phố dùng chung.
 *
 * Hiện tại trả seed data (`VN_PROVINCES`). Khi backend có API danh mục
 * tỉnh/thành, chỉ cần thay thân `getProvinces()` bằng call API — mọi
 * component dùng `app-province-select` không phải sửa.
 */
@Injectable({ providedIn: 'root' })
export class ProvinceService {

    private cache: ProvinceOption[] | null = null;

    /** Danh sách tỉnh/thành phố (value = label = tên tỉnh). */
    getProvinces(): Observable<ProvinceOption[]> {
        // TODO(API): thay bằng gọi API danh mục tỉnh/thành khi backend sẵn sàng.
        if (!this.cache) {
            this.cache = VN_PROVINCES.map(p => ({ ...p }));
        }

        return of(this.cache);
    }
}
