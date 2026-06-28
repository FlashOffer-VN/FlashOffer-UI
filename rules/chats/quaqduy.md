## 📋 BẢN FULL QUY TẮC DỰ ÁN FLASHOFFER UI (ĐẦY ĐỦ)

---

### 1. KIẾN TRÚC THƯ MỤC

```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts          # Base HTTP
│   │   ├── auth.service.ts         # Auth logic
│   │   ├── product.service.ts      # Product logic
│   │   ├── order.service.ts        # Order logic
│   │   └── app.service.ts          # Tổng hợp tất cả service
│   ├── models/
│   │   ├── auth.model.ts
│   │   ├── product.model.ts
│   │   └── order.model.ts
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
│       │   └── user-layout/
│       ├── language-switcher/
│       ├── toast/
│       ├── modal/
│       ├── loading/
│       ├── button/
│       ├── input/
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
    └── profile/
```

---

### 2. NGUYÊN TẮC SERVICE

| Nguyên tắc | Mô tả |
|------------|-------|
| **ApiService** | Chỉ gọi HTTP, không xử lý logic |
| **{Tên}Service** | Xử lý logic nghiệp vụ, gọi ApiService |
| **AppService** | Tập trung tất cả service, dùng 1 lần inject |
| **Không inject service lẻ** | Luôn qua AppService trong component |
| **Không circular dependency** | Service con KHÔNG inject AppService |

**Luồng tạo service mới:**
```
Bước 1: Tạo Model trong core/models/{tên}.model.ts
Bước 2: Tạo Service trong core/services/{tên}.service.ts
Bước 3: Inject ApiService vào Service
Bước 4: Viết methods (get, post, put, delete)
Bước 5: Import Service vào AppService
Bước 6: Export public property trong AppService
```

---

### 3. MODEL & ENUM

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
```

---

### 4. TRANSLATE

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
- **TS**: `this._appService.instant('key')` hoặc `this._appService.get('key').subscribe()`
- **Chỉ cần import AppService** là đủ dùng translate
- **KHÔNG inject TranslateService trực tiếp vào component**

---

### 5. AUTH

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

### 6. ENVIRONMENT

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

### 7. COMPONENTS ĐÃ VIẾT SẴN

**Layout Components:**
| Component | Path | Mô tả |
|-----------|------|-------|
| `GuestLayoutComponent` | `shared/components/layouts/guest-layout/` | Layout cho guest (chưa login) |
| `GuestHeaderComponent` | `shared/components/layouts/guest-layout/guest-header/` | Header guest có secret admin button |
| `GuestFooterComponent` | `shared/components/layouts/guest-layout/guest-footer/` | Footer guest |
| `AdminLayoutComponent` | `shared/components/layouts/admin-layout/` | Layout cho admin |
| `UserLayoutComponent` | `shared/components/layouts/user-layout/` | Layout cho user thường |

**Shared Components (Helper):**
| Component | Path | Mô tả |
|-----------|------|-------|
| `LanguageSwitcherComponent` | `shared/components/language-switcher/` | Chuyển đổi ngôn ngữ VI/EN |
| `ToastComponent` | `shared/components/toast/` | Thông báo (success, error, warning, info) |
| `ModalComponent` | `shared/components/modal/` | Dialog/Popup |
| `LoadingComponent` | `shared/components/loading/` | Loading (dots, spinner, skeleton, pulse, logo, community) |
| `ButtonComponent` | `shared/components/button/` | Nút với các variant |
| `InputComponent` | `shared/components/input/` | Input form có validation |
| `ScrollToTopComponent` | `shared/components/scroll-to-top/` | Nút cuộn lên đầu trang |

**⚠️ Quy tắc dùng Helper Components:**
- **Ưu tiên dùng component chung** thay vì viết lại HTML/CSS mới
- **Thống nhất UI** toàn bộ dự án
- **Không tự viết button, input, loading, toast** nếu đã có sẵn
- Nếu cần style khác, extend từ component hiện có

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

---

### 8. MÀU SẮC CHỦ ĐẠO

**8.1. CSS Variables (styles.css)**
```css
@layer base {
    :root {
        /* Brand */
        --primary: #007f94;
        --primary-light: #24c7d7;
        --primary-dark: #006b80;
        --secondary: #1F2937;
        --secondary-light: #374151;
        --secondary-dark: #111827;
        --accent: #EC4899;
        
        /* Feature */
        --offer: #F97316;
        --offer-light: #FB923C;
        --offer-dark: #EA580C;
        --premium: #FBBF24;
        --premium-light: #FCD34D;
        --premium-dark: #F59E0B;
        --community: #8B5CF6;
        --community-light: #A78BFA;
        --community-dark: #7C3AED;
        
        /* Status */
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
        
        /* Neutral */
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
    
    /* Admin role */
    body.admin-role {
        --primary: #7C3AED;
        --primary-light: #A78BFA;
        --primary-dark: #5B21B6;
    }
    
    /* User role */
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
// AuthService tự động set khi login/logout
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

### 9. ROUTES

```typescript
export const routes: Routes = [
  // Guest routes (chưa đăng nhập)
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
    ]
  },
  // Admin routes (chỉ admin)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
    ]
  },
  // User routes (cần login)
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: ProfileComponent },
    ]
  },
  // Fallback
  { path: '**', redirectTo: '' }
];
```

---

### 10. QUY TẮC CODE

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
| 9 | **Message translate** | Tất cả message hiển thị user đều qua translate |
| 10 | **Không circular dependency** | Service con KHÔNG inject AppService |
| 11 | **ApiResponse<T>** | Dùng chung cho tất cả API response |
| 12 | **Error handling** | Lấy từ `errors[0]` hoặc `message` |
| 13 | **Refresh token** | Tự động refresh khi token sắp hết hạn |
| 14 | **Guard** | Luôn có guard cho route cần bảo vệ |
| 15 | **Standalone components** | Tất cả component đều standalone |
| 16 | **Dùng component chung** | Ưu tiên dùng Button, Input, Toast, Modal, Loading có sẵn |

---

### 11. VÍ DỤ CHUẨN

```typescript
// ✅ ĐÚNG
import { AppService } from '@core/services/app.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ToastComponent } from '@shared/components/toast/toast.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, ToastComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  constructor(private _appService: AppService) {}
  
  login() {
    this._appService.auth.login(data).subscribe({
      next: (response) => {
        // ✅ Dùng ToastComponent
        this.showToast(this._appService.instant('SUCCESS.LOGIN'), 'success');
        if (response?.data?.role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        const msg = err.error?.errors?.[0] || err.error?.message || this._appService.instant('ERROR.LOGIN_FAILED');
        // ✅ Dùng ToastComponent
        this.showToast(msg, 'error');
      }
    });
  }
}
```

```typescript
// ❌ SAI
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';

@Component({...})
export class LoginComponent {
  constructor(
    private translate: TranslateService,  // ❌ Không dùng direct
    private auth: AuthService             // ❌ Không dùng direct
  ) {}
  
  login() {
    this.auth.login(data).subscribe({
      next: () => {
        // ❌ Hardcode + không dùng ToastComponent
        this.showToast('Đăng nhập thành công!', 'success');
      }
    });
  }
}
```

---

### 12. CÁC TÍNH NĂNG ĐÃ HOÀN THÀNH

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
| 13 | Shared Components (Button, Input, Toast, Modal, Loading) | ✅ |

---

### 13. CÁC TÍNH NĂNG CẦN LÀM TIẾP

| STT | Tính năng | Ưu tiên |
|-----|-----------|---------|
| 1 | Product Service + Model | Cao |
| 2 | Order Service + Model | Cao |
| 3 | Admin - User Management | Thấp |
| 4 | Admin - Product Management | Thấp |
| 5 | Admin - Order Management | Thấp |