# 📋 BẢN FULL QUY TẮC DỰ ÁN KINDI UI

---

## 1. KIẾN TRÚC THƯ MỤC

```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts          # Base HTTP
│   │   ├── auth.service.ts         # Auth logic
│   │   ├── toast.service.ts        # Toast/Notification logic
│   │   ├── product.service.ts      # Product logic
│   │   ├── order.service.ts        # Order logic
│   │   ├── purchase-request.service.ts
│   │   └── app.service.ts          # Tổng hợp tất cả service
│   ├── models/
│   │   ├── auth.model.ts
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   └── purchase-request.model.ts
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── admin.guard.ts
│   │   └── guest.guard.ts
│   └── interceptors/
│       └── auth.interceptor.ts
├── shared/
│   └── components/
│       ├── layouts/
│       │   ├── guest-layout/
│       │   │   ├── guest-header/
│       │   │   └── guest-footer/
│       │   ├── admin-layout/
│       │   │   ├── admin-sidebar/
│       │   │   ├── admin-header/
│       │   │   └── admin-footer/
│       │   └── user-layout/
│       ├── language-switcher/
│       ├── toast/
│       ├── modal/
│       ├── loading/
│       ├── button/
│       ├── input/
│       ├── ng-select-wrapper/      # Select wrapper (dùng @ng-select/ng-select)
│       ├── pagination/             # Pagination dùng chung
│       ├── badge/                  # Badge status dùng chung
│       └── scroll-to-top/
├── features/
│   └── auth/
│       └── pages/
│           ├── login/
│           ├── admin-login/
│           └── register/
└── pages/
    ├── home/
    ├── dashboard/
    ├── admin/
    ├── profile/
    ├── find-supplier/
    └── partner/
```

---

## 2. NGUYÊN TẮC SERVICE

| Nguyên tắc | Mô tả |
|------------|-------|
| **ApiService** | Chỉ gọi HTTP, không xử lý logic |
| **{Tên}Service** | Xử lý logic nghiệp vụ, gọi ApiService |
| **ToastService** | Quản lý hiển thị toast/notification |
| **AppService** | Tập trung tất cả service, dùng 1 lần inject |
| **Không inject service lẻ** | Luôn qua AppService trong component |
| **Không circular dependency** | Service con KHÔNG inject AppService |

**Luồng tạo service mới:**
```
Bước 1: Tạo Model trong core/models/{tên}.model.ts
Bước 2: Tạo Service trong core/services/{tên}.service.ts
Bước 3: Inject ApiService vào Service (nếu cần)
Bước 4: Viết methods (get, post, put, delete)
Bước 5: Import Service vào AppService
Bước 6: Export public property trong AppService
```

**Quy tắc ApiService & Base URL:**

| Nguyên tắc | Mô tả |
|------------|-------|
| **Base URL duy nhất** | Chỉ `ApiService` chứa `baseUrl = environment.apiUrl`, service con KHÔNG import environment |
| **Endpoint tương đối** | Service con chỉ định nghĩa endpoint tương đối (ví dụ: `'Ctv'`, `'Partner'`) |
| **Không gộp URL** | Service con KHÔNG được gộp `environment.apiUrl + '/Ctv'` |
| **Params linh hoạt** | `ApiService.get()` hỗ trợ cả `HttpParams` và object `Record<string, any>` |

**ApiService chuẩn:**
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
    protected baseUrl = environment.apiUrl;

    get<T>(endpoint: string, params?: HttpParams | Record<string, any>): Observable<T> {
        let httpParams: HttpParams | undefined;
        if (params) {
            if (params instanceof HttpParams) {
                httpParams = params;
            } else {
                httpParams = new HttpParams({ fromObject: params });
            }
        }
        return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
    }

    post<T>(endpoint: string, data: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
    }

    put<T>(endpoint: string, data: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data);
    }

    patch<T>(endpoint: string, data: any): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data);
    }

    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
    }
}
```

**Service con chuẩn:**
```typescript
@Injectable({ providedIn: 'root' })
export class CtvService {
    private readonly _baseUrl = 'Ctv';

    constructor(private _apiService: ApiService) { }

    getData() {
        return this._apiService.get<PagedResponse<CtvRegistration>>(this._baseUrl);
    }
}
```

---

## 3. MODEL & ENUM

**Quy tắc Model:**
- **Export hết**: interface, enum, type, const
- **Enum**: Dùng cho role, status, category, type
- **Không hardcode** string/số trong service hay component
- **Type**: Dùng cho filter, request payload, response
- **ApiResponse<T>**: Dùng chung cho tất cả API response

**File model chuẩn:**
```typescript
export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string;
  status?: UserStatus;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED'
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[] | null;
  timestamp: string;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  timestamp: string;
}
```

---

## 4. TRANSLATE (I18N)

**Cấu hình (app.config.ts):**
```typescript
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'vi'
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [TranslateService],
      multi: true
    }
  ]
};
```

**Sử dụng:**
- **HTML**: `{{ 'key' | translate }}`
- **TS**: `this._appService.trans('key')` hoặc `this._appService.get('key').subscribe()`
- **Chỉ cần import AppService** là đủ dùng translate
- **KHÔNG inject TranslateService trực tiếp vào component**

**⭐ QUY TẮC TỔ CHỨC KEY I18N:**

| Quy tắc | Mô tả | Ví dụ |
|---------|-------|-------|
| **Gom nhóm theo page/feature** | Nhóm key theo page/feature | `PARTNER.*`, `FIND_SUPPLIER.*` |
| **COMMON cho dùng chung** | Text dùng chung toàn app | `COMMON.BUTTON.*`, `COMMON.STATUS.*` |
| **Key viết hoa + underscore** | Tất cả key viết hoa, cách nhau bằng `_` | `COMMON.BUTTON_JOIN_CTV` |
| **Dùng dấu chấm phân cấp** | Phân cấp bằng dấu chấm `.` | `PARTNER.FORM.TITLE` |
| **Không hardcode text** | Tất cả text hiển thị đều qua translate | `{{ 'COMMON.BUTTON.SAVE' \| translate }}` |
| **Chỉ hỗ trợ 2 ngôn ngữ** | `vi.json` và `en.json` | `assets/i18n/vi.json`, `assets/i18n/en.json` |

**Cấu trúc file i18n chuẩn:**
```json
// vi.json
{
  "APP_NAME": "Kindi",
  "COMMON": {
    "BUTTON": {
      "SAVE": "Lưu",
      "CANCEL": "Hủy",
      "DELETE": "Xóa",
      "EDIT": "Sửa",
      "CREATE": "Tạo mới"
    },
    "STATUS": {
      "ACTIVE": "Hoạt động",
      "INACTIVE": "Không hoạt động",
      "PENDING": "Đang chờ",
      "APPROVED": "Đã duyệt",
      "REJECTED": "Từ chối",
      "COMPLETED": "Hoàn thành",
      "CANCELLED": "Đã hủy"
    },
    "ERROR": {
      "REQUIRED": "Trường này là bắt buộc",
      "INVALID": "Dữ liệu không hợp lệ"
    }
  },
  "PAGINATION": {
    "SHOWING": "Hiển thị",
    "OF": "trên tổng",
    "ITEMS": "kết quả",
    "SHOW": "Hiển thị",
    "ITEMS_PER_PAGE": "kết quả/trang",
    "NO_ITEMS": "Không có dữ liệu"
  },
  "PARTNER": {
    "TITLE": "Đăng ký đối tác",
    "DESCRIPTION": "Trở thành đối tác của Kindi",
    "BUSINESS_TYPE_SME": "SME - Doanh nghiệp vừa và nhỏ",
    "COMPANY_SIZE_1_10": "1 - 10 nhân viên"
  },
  "FIND_SUPPLIER": {
    "TITLE": "Tìm nhà cung cấp",
    "SEARCH_PLACEHOLDER": "Tìm kiếm...",
    "UNIT_KG": "Kg",
    "UNIT_GRAM": "Gram"
  },
  "CONNECT_SME": {
    "TITLE": "Kết nối doanh nghiệp",
    "BENEFIT_1": "Tiếp cận khách hàng mới"
  }
}
```

**Key format cho select options:**

| Loại | Format | Ví dụ |
|------|--------|-------|
| Business Type | `PARTNER.BUSINESS_TYPE_{KEY}` | `PARTNER.BUSINESS_TYPE_SME` |
| Company Size | `PARTNER.COMPANY_SIZE_{KEY}` | `PARTNER.COMPANY_SIZE_1_10` |
| Product Category | `PARTNER.PRODUCT_CATEGORY_{KEY}` | `PARTNER.PRODUCT_CATEGORY_ELECTRONICS` |
| Commission Type | `PARTNER.COMMISSION_TYPE_{KEY}` | `PARTNER.COMMISSION_TYPE_PERCENTAGE` |
| Unit | `FIND_SUPPLIER.UNIT_{KEY}` | `FIND_SUPPLIER.UNIT_KG` |

---

## 5. AUTH

**AuthService methods:**
| Method | Mô tả |
|--------|-------|
| `login(data)` | Gọi API login → lưu token + user → start refresh timer |
| `logout()` | Xóa token + user → stop refresh timer → redirect login |
| `getMe()` | Gọi API /me → lấy thông tin user đầy đủ |
| `refreshToken()` | Gọi API refresh → lấy token mới |
| `getCurrentUser()` | Lấy user từ BehaviorSubject |
| `isAuthenticated()` | Kiểm tra token có tồn tại |

**AuthInterceptor:**
- Tự động thêm `Authorization: Bearer {token}` vào header
- Gặp 401 → gọi refresh token → retry request
- Refresh token fail → logout

**Guards:**
| Guard | Công dụng |
|-------|-----------|
| `AuthGuard` | Chỉ cho vào khi đã login |
| `AdminGuard` | Chỉ cho vào khi login + role ADMIN |
| `GuestGuard` | Chỉ cho vào khi chưa login (login, register) |

**Error handling:**
```typescript
const errorMsg = err.error?.errors?.[0] || err.error?.message || err.message || 'Đã có lỗi xảy ra!';
```

---

## 6. ENVIRONMENT

**File cấu hình:**
```
.env                    # Development
.env.production         # Production
generate-env.js         # Script generate environment.ts
```

**Sử dụng:**
```typescript
// ApiService
protected baseUrl = environment.apiUrl;
```

---

## 7. COMPONENTS ĐÃ VIẾT SẴN

**Layout Components:**
| Component | Path | Mô tả |
|-----------|------|-------|
| `GuestLayoutComponent` | `shared/components/layouts/guest-layout/` | Layout cho guest (chưa login) |
| `GuestHeaderComponent` | `shared/components/layouts/guest-layout/guest-header/` | Header guest có secret admin button |
| `GuestFooterComponent` | `shared/components/layouts/guest-layout/guest-footer/` | Footer guest |
| `AdminLayoutComponent` | `shared/components/layouts/admin-layout/` | Layout cho admin |
| `AdminSidebarComponent` | `shared/components/layouts/admin-layout/admin-sidebar/` | Sidebar admin (menu + logout) |
| `AdminHeaderComponent` | `shared/components/layouts/admin-layout/admin-header/` | Header admin (logo + user info) |
| `AdminFooterComponent` | `shared/components/layouts/admin-layout/admin-footer/` | Footer admin |
| `UserLayoutComponent` | `shared/components/layouts/user-layout/` | Layout cho user thường |

**Shared Components (Helper):**
| Component | Selector | Mô tả |
|-----------|----------|-------|
| `NgSelectWrapperComponent` | `app-ng-select-wrapper` | Select wrapper dùng `@ng-select/ng-select` |
| `ButtonComponent` | `app-button` | Nút với các variant |
| `InputComponent` | `app-input` | Input form có validation |
| `ToastComponent` | `app-toast` | Thông báo (success, error, warning, info) |
| `ModalComponent` | `app-modal` | Dialog/Popup |
| `LoadingComponent` | `app-loading` | Loading (dots, spinner, skeleton) |
| `ScrollToTopComponent` | `app-scroll-to-top` | Nút cuộn lên đầu trang |
| `PaginationComponent` | `app-pagination` | Phân trang dùng chung |
| `BadgeComponent` | `app-badge` | Badge status dùng chung |

**⚠️ Quy tắc dùng Helper Components:**
- **Ưu tiên dùng component chung** thay vì viết lại HTML/CSS mới
- **Thống nhất UI** toàn bộ dự án
- **Không tự viết button, input, loading, toast, select** nếu đã có sẵn
- **Luôn dùng `app-ng-select-wrapper`** thay vì `<select>` native
- **Luôn dùng `app-pagination`** cho phân trang thay vì tự viết
- **Luôn dùng `app-badge`** cho hiển thị status thay vì tự viết badge

**⚠️ Quy tắc dùng NgSelectWrapperComponent:**
- Binding items: `[items]="options"` với format `{ value: any, label: string }`
- Binding form: `formControlName` hoặc `[(ngModel)]`
- Validation: `[isInvalid]`, `[errorMessage]`, `[touched]`

**⚠️ Quy tắc dùng PaginationComponent:**

| Input | Type | Default | Mô tả |
|-------|------|---------|-------|
| `pageNumber` | number | 1 | Trang hiện tại |
| `pageSize` | number | 10 | Số item trên 1 trang |
| `totalCount` | number | 0 | Tổng số item |
| `totalPages` | number | 0 | Tổng số trang |
| `hasPreviousPage` | boolean | false | Có trang trước không |
| `hasNextPage` | boolean | false | Có trang sau không |
| `showInfo` | boolean | true | Hiển thị thông tin X-Y/Z |
| `pageSizes` | number[] | [10, 20, 50] | Các option page size |
| `showPageSize` | boolean | true | Hiển thị dropdown page size |

| Output | Type | Mô tả |
|--------|------|-------|
| `pageChange` | EventEmitter<number> | Emit khi đổi trang |
| `pageSizeChange` | EventEmitter<number> | Emit khi đổi page size |

**⚠️ Quy tắc dùng BadgeComponent:**

| Input | Type | Default | Mô tả |
|-------|------|---------|-------|
| `status` | string | '' | Tên status (pending, approved, rejected, active, inactive, completed, cancelled) |
| `variant` | `success` \| `danger` \| `warning` \| `info` \| `primary` \| `secondary` | 'secondary' | Variant badge |
| `label` | string | '' | Label hiển thị |
| `size` | `'sm'` \| `'md'` \| `'lg'` | 'md' | Kích thước |
| `rounded` | `'none'` \| `'sm'` \| `'md'` \| `'lg'` \| `'full'` | 'full' | Độ bo tròn |
| `showDot` | boolean | true | Hiển thị chấm tròn màu |

**Variant Mapping (Status → Variant):**
| Status | Variant | Màu |
|--------|---------|-----|
| `pending` | `warning` | 🟡 Vàng |
| `approved` | `success` | 🟢 Xanh |
| `active` | `success` | 🟢 Xanh |
| `rejected` | `danger` | 🔴 Đỏ |
| `inactive` | `secondary` | ⚪ Xám |
| `completed` | `info` | 🔵 Xanh dương |
| `cancelled` | `danger` | 🔴 Đỏ |

**ToastService - Quản lý thông báo:**
| Method | Mô tả |
|--------|-------|
| `showToast(message, type, duration)` | Hiển thị toast với type |
| `showSuccess(message, duration)` | Toast success |
| `showError(message, duration)` | Toast error |
| `showWarning(message, duration)` | Toast warning |
| `showInfo(message, duration)` | Toast info |
| `dismiss()` | Đóng toast |

**Auth Pages:**
| Component | Path | Mô tả |
|-----------|------|-------|
| `LoginComponent` | `features/auth/pages/login/` | Login user thường |
| `AdminLoginComponent` | `features/auth/pages/admin-login/` | Login admin |
| `RegisterComponent` | `features/auth/pages/register/` | Register user |

**Pages:**
| Component | Path | Mô tả |
|-----------|------|-------|
| `HomeComponent` | `pages/home/` | Trang chủ |
| `DashboardComponent` | `pages/admin/dashboard/` | Admin dashboard |
| `ProfileComponent` | `pages/profile/` | User profile |
| `ConnectSmeComponent` | `pages/connect-sme/` | Kết nối doanh nghiệp |
| `FindSupplierComponent` | `pages/find-supplier/` | Tìm nhà cung cấp |
| `PartnerComponent` | `pages/partner/` | Đăng ký đối tác |

---

## 8. MÀU SẮC CHỦ ĐẠO

**8.1. CSS Variables (styles.css)**
```css
@layer base {
    :root {
        --primary: #007f94;
        --primary-light: #24c7d7;
        --primary-dark: #006b80;
        --secondary: #1F2937;
        --secondary-light: #374151;
        --secondary-dark: #111827;
        --accent: #EC4899;
        
        --offer: #F97316;
        --offer-light: #FB923C;
        --offer-dark: #EA580C;
        --premium: #FBBF24;
        --premium-light: #FCD34D;
        --premium-dark: #F59E0B;
        --community: #8B5CF6;
        --community-light: #A78BFA;
        --community-dark: #7C3AED;
        
        --success: #10B981;
        --success-light: #34D399;
        --success-dark: #059669;
        --warning: #F59E0B;
        --warning-light: #FBBF24;
        --warning-dark: #D97706;
        --danger: #EF4444;
        --danger-light: #F87171;
        --danger-dark: #DC2626;
        --info: #3B82F6;
        --info-light: #60A5FA;
        --info-dark: #2563EB;
        
        --gray-50: #F9FAFB;
        --gray-100: #F3F4F6;
        --gray-200: #E5E7EB;
        --gray-300: #D1D5DB;
        --gray-400: #9CA3AF;
        --gray-500: #6B7280;
        --gray-600: #4B5563;
        --gray-700: #374151;
        --gray-800: #1F2937;
        --gray-900: #111827;
    }
    
    body.admin-role {
        --primary: #7C3AED;
        --primary-light: #A78BFA;
        --primary-dark: #5B21B6;
    }
    
    body.user-role {
        --primary: #EC4899;
        --primary-light: #F472B6;
        --primary-dark: #BE185D;
    }
}

@layer utilities {
    .bg-primary { background-color: var(--primary) !important; }
    .text-primary { color: var(--primary) !important; }
    .border-primary { border-color: var(--primary) !important; }
    .bg-primary-light { background-color: var(--primary-light) !important; }
    .text-primary-dark { color: var(--primary-dark) !important; }
    .hover\:bg-primary-dark:hover { background-color: var(--primary-dark) !important; }
    .hover\:text-primary:hover { color: var(--primary) !important; }
}
```

**8.2. Bảng màu chi tiết**

| Role | Primary | Light | Dark |
|------|---------|-------|------|
| **Guest (default)** | `#007f94` | `#24c7d7` | `#006b80` |
| **Admin** | `#7C3AED` | `#A78BFA` | `#5B21B6` |
| **User** | `#EC4899` | `#F472B6` | `#BE185D` |

| Feature | Màu | Light | Dark |
|---------|-----|-------|------|
| Offer | `#F97316` | `#FB923C` | `#EA580C` |
| Premium | `#FBBF24` | `#FCD34D` | `#F59E0B` |
| Community | `#8B5CF6` | `#A78BFA` | `#7C3AED` |

| Status | Màu | Light | Dark |
|--------|-----|-------|------|
| Success | `#10B981` | `#34D399` | `#059669` |
| Warning | `#F59E0B` | `#FBBF24` | `#D97706` |
| Danger | `#EF4444` | `#F87171` | `#DC2626` |
| Info | `#3B82F6` | `#60A5FA` | `#2563EB` |

**8.3. Button Variants**
| Variant | Màu nền | Hover |
|---------|---------|-------|
| `primary` | `var(--primary)` | `var(--primary-dark)` |
| `secondary` | `#1F2937` | `#374151` |
| `success` | `#10B981` | `#059669` |
| `danger` | `#EF4444` | `#DC2626` |
| `warning` | `#F59E0B` | `#D97706` |
| `offer` | `#F97316` | `#EA580C` |
| `premium` | `#FBBF24` | `#F59E0B` |
| `community` | `#8B5CF6` | `#7C3AED` |
| `ghost` | `transparent` | `rgba(0,0,0,0.05)` |
| `outline` | `transparent` | `var(--primary)` |

**8.4. Badge Status**
| Status | Màu nền | Text |
|--------|---------|------|
| `success` / `completed` | `#10B981` | `white` |
| `error` / `cancelled` | `#EF4444` | `white` |
| `warning` / `pending` | `#F59E0B` | `#1F2937` |
| `info` / `shipping` | `#3B82F6` | `white` |
| `offer` | `#F97316` | `white` |
| `premium` | `#FBBF24` | `#1F2937` |
| `community` | `#8B5CF6` | `white` |

**8.5. Set role class**
```typescript
private setBodyRoleClass(role: string | UserRole): void {
    this.clearBodyRoleClass();
    const roleStr = typeof role === 'string' ? role : role.toString();
    if (roleStr === UserRole.ADMIN || roleStr === 'Admin' || roleStr === 'admin') {
        document.body.classList.add('admin-role');
    } else if (roleStr === UserRole.USER || roleStr === 'User' || roleStr === 'user') {
        document.body.classList.add('user-role');
    }
}
```

---

## 9. ROUTES

```typescript
export const routes: Routes = [
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      { path: 'login', canActivate: [GuestGuard], component: LoginComponent },
      { path: 'admin-login', canActivate: [GuestGuard], component: AdminLoginComponent },
      { path: 'register', canActivate: [GuestGuard], component: RegisterComponent },
      { path: 'register-ctv', component: RegisterCtvComponent },
      { path: 'connect-sme', component: ConnectSmeComponent },
      { path: 'find-supplier', component: FindSupplierComponent },
      { path: 'group-buying', component: GroupBuyingComponent },
      { path: 'get-offer', component: GetOfferComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'talent', component: TalentComponent },
      { path: 'community', component: CommunityComponent },
      { path: 'partner', component: PartnerComponent },
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'ctv', component: AdminCtvListComponent },
      { path: 'ctv/:id', component: AdminCtvDetailComponent },
      { path: 'partner', component: AdminPartnerListComponent },
      { path: 'partner/:id', component: AdminPartnerDetailComponent },
    ]
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
```

---

## 10. CODE CONVENTION

### TypeScript Convention:
- **Private properties** trong constructor: prefix `_`
- **Public properties** trong constructor: không prefix
- **Local variables**: không prefix

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(
    private _apiService: ApiService,
    private _toastService: ToastService,
    public appService: AppService
  ) {}

  private _cache: Map<string, any>;

  getData() {
    const localVar = 'test';
    return this._apiService.get('/products');
  }
}

@Component({ ... })
export class ProductListComponent {
  constructor(
    private _appService: AppService,
    private _fb: FormBuilder,
    private _route: ActivatedRoute
  ) {}

  isLoading = false;
  products: Product[] = [];
}
```

### Quy tắc Code:

| STT | Quy tắc | Mô tả |
|-----|---------|-------|
| 1 | **Hỏi - Đáp** | Hỏi gì trả lời đó, không vòng vo |
| 2 | **Tách bạch** | Service, Model, Component tách riêng |
| 3 | **Không đoán** | Chưa rõ thì hỏi lại |
| 4 | **Mỗi bước 1 hành động** | Làm xong mới chuyển |
| 5 | **Code chạy ngay** | Copy-paste là dùng được |
| 6 | **Export hết** | Interface, enum, type đều export |
| 7 | **Không hardcode** | Dùng enum, const thay vì string |
| 8 | **private _appService** | Luôn dùng `private _appService: AppService` |
| 9 | **Message translate** | Dùng `this._appService.trans()` trong TS, `| translate` trong HTML |
| 10 | **Không circular dependency** | Service con KHÔNG inject AppService |
| 11 | **ApiResponse<T>** | Dùng chung cho tất cả API response |
| 12 | **Error handling** | Lấy từ `errors[0]` hoặc `message` |
| 13 | **Refresh token** | Tự động refresh khi token sắp hết hạn |
| 14 | **Guard** | Luôn có guard cho route cần bảo vệ |
| 15 | **Standalone components** | Tất cả component đều standalone |
| 16 | **Dùng component chung** | Ưu tiên dùng Button, Input, Toast, Modal, Loading, NgSelectWrapper có sẵn |
| 17 | **Toast qua AppService** | Luôn dùng `this._appService.showSuccess()` hoặc `this._appService.showError()` |
| 18 | **i18n gom nhóm** | Gom nhóm key translate theo page/feature, dùng dấu chấm phân cấp |
| 19 | **Animation** | Sử dụng `@angular/animations` cho hiệu ứng chuyển trang |
| 20 | **Number pipe với string** | Kiểm tra giá trị là number trước khi dùng pipe |
| 21 | **Dùng app-ng-select-wrapper** | Luôn dùng `app-ng-select-wrapper` thay vì `<select>` native |
| 22 | **NgSelect items format** | Items format `{ value: number/string, label: string }` |
| 23 | **NgSelect validation** | Truyền `[isInvalid]`, `[errorMessage]`, `[touched]` |
| 24 | **NgSelect với Reactive Forms** | Dùng `formControlName` như input bình thường |
| 25 | **Chia nhỏ theo bước** | Không code full 1 lần, chia thành các bước nhỏ, chờ confirm |
| 26 | **Fix lỗi trước khi chuyển bước** | Fix lỗi xong mới chuyển sang bước tiếp theo |
| 27 | **Dùng app-pagination** | Luôn dùng `app-pagination` cho phân trang |
| 28 | **Dùng app-badge** | Luôn dùng `app-badge` cho hiển thị status |
| 29 | **Badge từ status** | Truyền `status` vào badge để auto-detect variant và label |
| 30 | **Pagination với API** | Kết hợp `PagedResponse<T>` với `app-pagination` |
| 31 | **Không dùng env.apiUrl trong service con** | Không import `environment` trong service con |
| 32 | **Endpoint tương đối** | Service con chỉ định nghĩa endpoint tương đối |
| 33 | **ApiService quản lý baseUrl** | ApiService là nơi duy nhất quản lý baseUrl |
| 34 | **Params linh hoạt** | `ApiService.get()` hỗ trợ cả `HttpParams` và object params |
| 35 | **Gửi từng file 1** | Không gửi full code nhiều file cùng lúc |
| 36 | **Chờ confirm** | Sau khi gửi 1 file, chờ OK mới gửi file tiếp |
| 37 | **Comment code** | Chỉ comment mang tính trình bày luồng logic, không comment thừa |

---

## 11. QUY TRÌNH TẠO COMPONENT VỚI SEED DATA

**B1:** Tạo interface model trong `core/models/`
**B2:** Tạo service với method `getMockData()` trả về seed data
**B3:** Component gọi `getMockData()` thay vì API
**B4:** Sau khi UI hoàn thiện, thay `getMockData()` bằng `apiService.get()`

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private _api: ApiService) {}

  getMockData(pageNumber = 1, pageSize = 10): Observable<PagedResponse<Product>> {
    const allItems = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
    ];
    
    const start = (pageNumber - 1) * pageSize;
    const end = start + pageSize;
    const items = allItems.slice(start, end);
    
    return of({
      success: true,
      message: 'Success',
      data: items,
      pageNumber: pageNumber,
      pageSize: pageSize,
      totalCount: allItems.length,
      totalPages: Math.ceil(allItems.length / pageSize),
      hasPreviousPage: pageNumber > 1,
      hasNextPage: end < allItems.length,
      timestamp: new Date().toISOString()
    });
  }

  getData(pageNumber = 1, pageSize = 10): Observable<PagedResponse<Product>> {
    return this._api.get<PagedResponse<Product>>(`/products?page=${pageNumber}&size=${pageSize}`);
  }
}
```

**Component mẫu với Pagination:**
```typescript
@Component({ ... })
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  constructor(private _productService: ProductService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this._productService.getMockData(this.pageNumber, this.pageSize).subscribe(response => {
      this.products = response.data;
      this.pageNumber = response.pageNumber;
      this.pageSize = response.pageSize;
      this.totalCount = response.totalCount;
      this.totalPages = response.totalPages;
      this.hasPreviousPage = response.hasPreviousPage;
      this.hasNextPage = response.hasNextPage;
      this.isLoading = false;
    });
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.loadData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageNumber = 1;
    this.loadData();
  }
}
```

**Quy tắc chuyển đổi sang API thật:**
| Bước | Hành động |
|------|-----------|
| 1 | Đổi `getMockData()` thành `getData()` trong component |
| 2 | Xóa method `getMockData()` khỏi service |
| 3 | Kiểm tra lại UI với API thật |

---

## 12. PHONG CÁCH LÀM VIỆC CÁ NHÂN

| Nguyên tắc | Mô tả |
|------------|-------|
| **Hỏi trước khi code** | Luôn hỏi xác nhận trước khi viết component mới |
| **Chia nhỏ từng bước** | Mỗi lần chỉ làm 1 task nhỏ, chờ confirm mới chuyển |
| **Seed data trước** | Dùng mock data để check UI, đổi sang API sau |
| **Fix lỗi ngay** | Phát hiện lỗi → sửa xong mới làm tiếp |
| **Không đoán ý** | Chưa rõ requirement → hỏi lại, không tự suy diễn |
| **Review sau mỗi task** | Áp dụng quy trình review code mục 11 |

---

## 13. CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

| STT | Tính năng | Trạng thái |
|-----|-----------|-----------|
| 1 | Cấu hình .env + environment | ✅ |
| 2 | ApiService | ✅ |
| 3 | AuthService + Model | ✅ |
| 4 | AppService (tổng hợp service) | ✅ |
| 5 | Translate (i18n) | ✅ |
| 6 | Login (Admin + User) | ✅ |
| 7 | Admin Dashboard | ✅ |
| 8 | AuthInterceptor + Refresh Token | ✅ |
| 9 | Guards (Auth, Admin, Guest) | ✅ |
| 10 | Route phân quyền | ✅ |
| 11 | Error handling + Translate | ✅ |
| 12 | Guest Header + Secret Admin Button | ✅ |
| 13 | Shared Components (Button, Input, Toast, Modal, Loading, NgSelectWrapper) | ✅ |
| 14 | ToastService | ✅ |
| 15 | Admin Layout (tách component con) | ✅ |
| 16 | Connect SME Page | ✅ |
| 17 | Animation (route, fade, slide, stagger) | ✅ |
| 18 | Scroll to top khi chuyển trang | ✅ |
| 19 | Partner Register (tách component + NgSelectWrapper) | ✅ |
| 20 | PurchaseRequest Service + Model | ✅ |
| 21 | Find Supplier Page (gọi API + NgSelectWrapper) | ✅ |
| 22 | PaginationComponent (dùng chung) | ✅ |
| 23 | BadgeComponent (dùng chung) | ✅ |
| 24 | PagedResponse Model | ✅ |

---

## 14. CÁC TÍNH NĂNG CẦN LÀM TIẾP

| STT | Tính năng | Ưu tiên |
|-----|-----------|---------|
| 1 | Product Service + Model | Cao |
| 2 | Order Service + Model | Cao |
| 3 | Admin - CTV Management | Cao |
| 4 | Admin - Partner Management | Cao |
| 5 | Admin - User Management | Thấp |
| 6 | Admin - Product Management | Thấp |
| 7 | Admin - Order Management | Thấp |
| 8 | Admin - Purchase Request Management | Thấp |

---

## 📝 TÓM TẮT CẬP NHẬT MỚI NHẤT:

| Mục | Nội dung |
|-----|----------|
| **Phần 4** | Sửa `instant` → `trans` |
| **Phần 10** | Thêm quy tắc 35, 36, 37 về cách gửi code và comment |
| **Phần 10** | Cập nhật quy tắc 9: dùng `this._appService.trans()` trong TS |