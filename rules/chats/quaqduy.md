## 📋 QUY TẮC LÀM VIỆC CHO DỰ ÁN FLASHOFFER UI (FULL)

### 1. Nguyên tắc làm việc

| STT | Nguyên tắc | Mô tả |
|-----|------------|-------|
| 1 | **Hỏi - Đáp** | Hỏi câu gì, trả lời câu đó. Không thêm thông tin thừa, không vòng vo |
| 2 | **Tách bạch kiến trúc** | Component, Service, Model, Style tách riêng. Không gộp chung |
| 3 | **Không đoán bừa** | Nếu chưa rõ, hỏi lại người dùng. Không tự suy diễn |
| 4 | **Mỗi bước một hành động** | Không làm nhiều việc cùng lúc. Chờ confirm xong mới chuyển bước |
| 5 | **Code chạy được ngay** | Code đưa ra phải đầy đủ, copy-paste là chạy |
| 6 | **Debug từng bước** | Đưa giả thuyết → 1 câu kiểm tra (console.log) → chờ kết quả → phân tích |
| 7 | **Không đoán mò khi debug** | Chỉ đưa giải pháp khi xác định nguyên nhân |

---

### 2. Bảng màu chuẩn

| Tên | Mã hex | CSS Class | Ứng dụng |
|-----|--------|-----------|----------|
| Primary | `#7C3AED` | `bg-primary`, `text-primary` | Button chính, header, link |
| Primary Light | `#A78BFA` | `bg-primary-light` | Hover, badge |
| Primary Dark | `#5B21B6` | `bg-primary-dark` | Active, focus |
| Secondary | `#1F2937` | `bg-secondary`, `text-secondary` | Text chính, sidebar, footer |
| Accent | `#EC4899` | `bg-accent`, `text-accent` | Highlight |
| Offer | `#F97316` | `bg-offer`, `text-offer` | Flash sale |
| Premium | `#FBBF24` | `bg-premium`, `text-premium` | CTV Pro |
| Community | `#8B5CF6` | `bg-community`, `text-community` | Cộng đồng |
| Success | `#10B981` | `bg-success`, `text-success` | Thành công |
| Warning | `#F59E0B` | `bg-warning`, `text-warning` | Cảnh báo |
| Danger | `#EF4444` | `bg-danger`, `text-danger` | Lỗi |
| Info | `#3B82F6` | `bg-info`, `text-info` | Thông tin |
| Gray | 50-900 | `bg-gray-*`, `text-gray-*` | Nền, text phụ |

---

### 3. Quy tắc Code

#### Component Structure
```typescript
@Component({
  selector: 'app-{name}',
  standalone: true,
  imports: [...],
  templateUrl: './{name}.component.html',
  styleUrl: './{name}.component.css'
})
export class {Name}Component {
  // 1. Inputs
  // 2. Outputs
  // 3. Properties
  // 4. Methods
}
```

#### CSS (Component-scoped)
- Dùng `:host` để style component wrapper
- Không dùng `!important` nếu không cần thiết
- Prefix class với tên component nếu cần tránh conflict

#### HTML (Component)
- Dùng `*ngIf`, `*ngFor` với CommonModule
- Dùng `[class]`, `[ngClass]` cho dynamic class
- Dùng `(click)`, `(input)` cho events

---

### 4. Quy tắc kiến trúc thư mục

| Layer | Thư mục | Vai trò | Đặc điểm |
|-------|---------|---------|----------|
| **Shared Components** | `src/app/shared/components/{name}/` | UI component tái sử dụng toàn cục | Dùng nhiều lần, không có routing |
| **Core Services** | `src/app/core/services/` | Business logic, API call, Auth | Singleton, dùng toàn cục |
| **Core Models** | `src/app/core/models/` | Interface, Type, Enum | Dùng toàn cục |
| **Core Guards** | `src/app/core/guards/` | Route guards (Auth, Role) | Bảo vệ route |
| **Core Interceptors** | `src/app/core/interceptors/` | HTTP interceptors (JWT, Error) | Xử lý request/response |
| **Pages** | `src/app/pages/{page}/` | Trang đơn lẻ, không có sub-routes | 1 trang = 1 component |
| **Features** | `src/app/features/{feature}/` | Module chứa nhiều trang liên quan | Có pages + services + models + routing |

---

### 5. Phân biệt Pages vs Features

| Tiêu chí | Pages | Features |
|----------|-------|----------|
| Số trang | 1 | Nhiều (2+) |
| Sub-routes | Không | Có (children) |
| Service riêng | Không cần | Có thể có |
| Model riêng | Không cần | Có thể có |
| Ví dụ | Home, Profile, Demo | Auth (Login + Register), Product (List + Detail + Create) |

---

### 6. Quy tắc đặt tên thư mục

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| Pages | `{name}/` | `home/`, `profile/`, `demo/` |
| Features | `{name}/` | `auth/`, `product/`, `order/` |
| Components | `{name}/` | `button/`, `input/`, `modal/` |
| Services | `{name}.service.ts` | `auth.service.ts`, `api.service.ts` |
| Models | `{name}.model.ts` hoặc `{name}.interface.ts` | `user.model.ts` |
| Guards | `{name}.guard.ts` | `auth.guard.ts` |
| Interceptors | `{name}.interceptor.ts` | `jwt.interceptor.ts` |

---

### 7. Cấu trúc thư mục chuẩn

```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── auth.service.ts
│   │   └── toast.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── api-response.model.ts
│   ├── guards/
│   │   └── auth.guard.ts
│   └── interceptors/
│       └── jwt.interceptor.ts
├── shared/
│   └── components/
│       ├── button/
│       ├── input/
│       ├── loading/
│       ├── modal/
│       ├── toast/
│       └── layouts/
│           ├── admin-layout/
│           ├── guest-layout/
│           │   ├── guest-layout.component.ts
│           │   ├── guest-layout.component.html
│           │   ├── guest-layout.component.css
│           │   ├── guest-header/
│           │   │   ├── guest-header.component.ts
│           │   │   ├── guest-header.component.html
│           │   │   └── guest-header.component.css
│           │   └── guest-footer/
│           │       ├── guest-footer.component.ts
│           │       ├── guest-footer.component.html
│           │       └── guest-footer.component.css
│           └── user-layout/
├── pages/
│   ├── demo/
│   ├── home/
│   │   ├── home.component.ts
│   │   ├── home.component.html
│   │   └── home.component.css
│   ├── dashboard/
│   └── profile/
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── services/
│   │   └── models/
│   └── product/
│       ├── pages/
│       │   ├── list/
│       │   └── detail/ 
│       └── services/
├── app.component.ts
├── app.routes.ts
└── app.config.ts
```

---

### 8. Quy tắc Role & Layout

| Role | Layout | Route Prefix | Mô tả |
|------|--------|--------------|-------|
| **Guest** | `GuestLayout` | `/` (root) | Chưa đăng nhập, xem trang chủ, login, register |
| **Admin** | `AdminLayout` | `/admin` | Quản trị hệ thống, có sidebar + header |
| **User** | `UserLayout` | `/user` | Người dùng đã đăng nhập (tương lai) |

**Routing structure:**
```typescript
{
  path: '',
  component: GuestLayoutComponent,
  children: [...]
},
{
  path: 'admin',
  component: AdminLayoutComponent,
  children: [...]
},
{
  path: 'user',
  component: UserLayoutComponent,
  children: [...]
},
{ path: '**', redirectTo: '' }
```

**Lưu ý:**
- Fallback luôn redirect về GuestLayout (`/`)
- Layouts đặt trong `shared/components/layouts/`
- Mỗi layout là standalone component

---

### 9. Quy tắc thêm mới

| Bước | Hành động |
|------|-----------|
| 1 | Xác định đây là Page hay Feature? |
| 2 | **Hỏi component đã có chưa? Nếu có, gửi code hiện tại** |
| 3 | Đợi người dùng gửi code |
| 4 | Phân tích và đề xuất bổ sung |
| 5 | Confirm trước khi code |
| 6 | Thực hiện các bước còn lại (tạo component, thêm route, import shared components) |

---

### 10. Quy tắc giao tiếp

| Tình huống | Hành động |
|------------|-----------|
| Chưa hiểu ý | Hỏi lại: "Bạn muốn ... đúng không?" |
| Cần thông tin | Hỏi cụ thể từng mục |
| Xong 1 bước | Báo "done" và hỏi bước tiếp theo |
| Có lỗi | Đưa lỗi + giải pháp, không tự fix |
| Debug | Đưa giả thuyết → 1 kiểm tra → chờ kết quả → phân tích → hỏi tiếp |

---

### 11. Quy tắc tạo component mới

| Bước | Hành động |
|------|-----------|
| 1 | Hỏi: Tên component, chức năng, Input/Output |
| 2 | Đợi câu trả lời |
| 3 | Tạo file `.ts`, `.html`, `.css` |
| 4 | Export trong `index.ts` (nếu có) |
| 5 | Hỏi: "Cần thêm gì không?" |

---

### 12. Các component đã có

| Component | Path | Chức năng |
|-----------|------|-----------|
| Button | `shared/components/button/` | Nút bấm nhiều variant |
| Input | `shared/components/input/` | Form input có validation |
| Loading | `shared/components/loading/` | Loading 6 kiểu (dots/spinner/skeleton/pulse/logo/community) |
| Modal | `shared/components/modal/` | Popup xác nhận |
| Toast | `shared/components/toast/` | Thông báo (success/error/warning/info) |
| GuestHeader | `shared/components/layouts/guest-layout/guest-header/` | Header cho guest |
| GuestFooter | `shared/components/layouts/guest-layout/guest-footer/` | Footer cho guest |
| GuestLayout | `shared/components/layouts/guest-layout/` | Layout cho guest |
| AdminLayout | `shared/components/layouts/admin-layout/` | Layout cho admin |
| UserLayout | `shared/components/layouts/user-layout/` | Layout cho user |

---

### 13. Quy tắc dịch đa ngôn ngữ (i18n)

#### 13.1. Cấu trúc file dịch

```
src/assets/i18n/
├── vi-VN.json    # Tiếng Việt (mặc định)
└── en-US.json    # Tiếng Anh
```

#### 13.2. Quy tắc đặt tên key

| Loại | Format | Ví dụ |
|------|--------|-------|
| Page | `PAGE_{NAME}_{FIELD}` | `HOME_TITLE`, `HOME_DESC` |
| Button | `BUTTON_{ACTION}` | `BUTTON_START`, `BUTTON_JOIN_SME` |
| Navigation | `NAV_{NAME}` | `NAV_SOLUTIONS`, `NAV_SUPPLIERS` |
| Footer | `FOOTER_{SECTION}` | `FOOTER_DESC`, `FOOTER_SOLUTIONS` |
| Common | `COMMON_{NAME}` | `COMMON_SAVE`, `COMMON_CANCEL` |

#### 13.3. Quy tắc sử dụng trong component

**Import TranslateModule:**
```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  imports: [CommonModule, TranslateModule]
})
```

**Sử dụng trong template:**
```html
<h1>{{ 'HOME_TITLE' | translate }}</h1>
<button>{{ 'BUTTON_START' | translate }}</button>
```

**Sử dụng trong component:**
```typescript
constructor(private translate: TranslateService) {
  translate.get('HOME_TITLE').subscribe(text => console.log(text));
}
```

#### 13.4. Quy tắc thêm key mới

| Bước | Hành động |
|------|-----------|
| 1 | Thêm key vào cả 2 file `vi-VN.json` và `en-US.json` |
| 2 | Key phải giống nhau, chỉ khác giá trị dịch |
| 3 | Đặt key theo đúng format quy tắc |
| 4 | Commit cả 2 file cùng lúc |

#### 13.5. Quy tắc làm việc với i18n

| STT | Nguyên tắc |
|-----|------------|
| 1 | **Không hardcode text** trong template, luôn dùng `translate` pipe |
| 2 | **Thêm key đủ ngôn ngữ** - không thêm 1 file bỏ file kia |
| 3 | **Key nhất quán** - dùng chung key cho text giống nhau |
| 4 | **Ưu tiên tiếng Việt** - `vi-VN` là ngôn ngữ mặc định |
| 5 | **Test cả 2 ngôn ngữ** trước khi báo done |

#### 13.6. Các bước thêm dịch cho component mới

| Bước | Hành động |
|------|-----------|
| 1 | Xác định các text cần dịch trong template |
| 2 | Đặt tên key theo quy tắc |
| 3 | Thêm key vào `vi-VN.json` và `en-US.json` |
| 4 | Import `TranslateModule` vào component |
| 5 | Thay text cứng bằng `{{ 'KEY' | translate }}` |
| 6 | Chạy `ng serve` kiểm tra cả 2 ngôn ngữ |

---

### 14. Quy tắc viết Issue cho UI

**Format trả lời:** CHỈ nội dung issue, KHÔNG lời dẫn hay giải thích.

```markdown
## ✨ Implement UI [Tên component/trang] - [mô tả ngắn]

### 📌 Mục tiêu
[mô tả]

### 🧩 Component Structure

| Thành phần | Giá trị |
|------------|---------|
| Selector | `app-{name}` |
| Standalone | Yes |
| Imports | [CommonModule, ...] |

### 📥 Inputs

| Tên | Type | Bắt buộc | Default |
|-----|------|----------|---------|
| ... | ... | ... | ... |

### 📤 Outputs

| Tên | Type | Mô tả |
|-----|------|-------|
| ... | ... | ... |

### 🎨 UI States

- [ ] Trạng thái 1
- [ ] Trạng thái 2

### 📝 Acceptance Criteria

- [ ] ...
```

---

### 15. Lưu ý

- **Không đoán** - Hỏi trước khi làm
- **Không gộp** - Mỗi bước một việc
- **Không vòng vo** - Trả lời thẳng vào câu hỏi
- **Code chạy ngay** - Đầy đủ, copy-paste là dùng được
- **Không dùng !important** trừ khi thực sự cần
- **Luôn dùng standalone components**
- **Mỗi câu trả lời ≤ 30 dòng** (không tính code block)
- **Thứ tự ưu tiên**: Kết quả > Hành động tiếp theo > Giải thích
- **Khi debug**: đưa giả thuyết → 1 kiểm tra → chờ kết quả → phân tích → hỏi tiếp tục