// src/app/core/constants/search-fields.ts

/**
 * Cột tìm kiếm dùng chung cho các màn danh sách ("search by").
 *
 * `value` khớp enum `RequestSearchField` / `BusinessGroupSearchField` phía API;
 * `''` = tìm trên mọi trường. Nhãn lấy từ i18n `COMMON.SEARCH_FIELD.*` nên phải
 * dựng lúc chạy bằng hàm `trans()` của trang (không dịch cứng ở đây).
 */
export interface SearchFieldOption {
    value: string;
    label: string;
}

/**
 * Các cột tìm kiếm của danh sách YÊU CẦU (mua hàng / nhận offer / mua chung) —
 * đúng tập giá trị `RequestSearchField` của API.
 *
 * @param t hàm dịch của trang (thường là `_appService.trans`).
 * @param customerNameKey / @param customerPhoneKey cho phép trang mua chung đổi nhãn
 *   hai cột người tạo thành "Người mở nhóm" mà vẫn dùng chung một nguồn dữ liệu.
 */
export function requestSearchFields(
    t: (key: string) => string,
    customerNameKey = 'COMMON.SEARCH_FIELD.CUSTOMER_NAME',
    customerPhoneKey = 'COMMON.SEARCH_FIELD.CUSTOMER_PHONE'
): SearchFieldOption[] {
    return [
        { value: '', label: t('COMMON.SEARCH_FIELD.ALL') },
        { value: 'productName', label: t('COMMON.SEARCH_FIELD.PRODUCT_NAME') },
        { value: 'code', label: t('COMMON.SEARCH_FIELD.CODE') },
        { value: 'recordReferrerCode', label: t('COMMON.SEARCH_FIELD.RECORD_REFERRER') },
        { value: 'recordReferrerName', label: t('COMMON.SEARCH_FIELD.RECORD_REFERRER_NAME') },
        { value: 'customerName', label: t(customerNameKey) },
        { value: 'customerPhone', label: t(customerPhoneKey) },
        { value: 'customerEmail', label: t('COMMON.SEARCH_FIELD.CUSTOMER_EMAIL') }
    ];
}

/** Các cột tìm kiếm của danh sách NHÓM — đúng tập giá trị `BusinessGroupSearchField` của API. */
export function businessGroupSearchFields(t: (key: string) => string): SearchFieldOption[] {
    return [
        { value: '', label: t('COMMON.SEARCH_FIELD.ALL') },
        { value: 'name', label: t('COMMON.SEARCH_FIELD.GROUP_NAME') },
        { value: 'description', label: t('COMMON.SEARCH_FIELD.GROUP_DESCRIPTION') },
        { value: 'topic', label: t('COMMON.SEARCH_FIELD.GROUP_TOPIC') },
        { value: 'businessFieldName', label: t('COMMON.SEARCH_FIELD.GROUP_BUSINESS_FIELD') },
        { value: 'code', label: t('COMMON.SEARCH_FIELD.GROUP_CODE') }
    ];
}
