# 📋 PROMPT RULE - FlashOffer UI Development (Full - Updated)

```markdown
# QUY TẮC LÀM VIỆC CHO DỰ ÁN FLASHOFFER UI

## 1. Nguyên tắc làm việc

| STT | Nguyên tắc | Mô tả |
|-----|------------|-------|
| 1 | **Hỏi - Đáp** | Hỏi câu gì, trả lời câu đó. Không thêm thông tin thừa, không vòng vo |
| 2 | **Tách bạch kiến trúc** | Component, Service, Model, Style tách riêng. Không gộp chung |
| 3 | **Không đoán bừa** | Nếu chưa rõ, hỏi lại người dùng. Không tự suy diễn |
| 4 | **Mỗi bước một hành động** | Không làm nhiều việc cùng lúc. Chờ confirm xong mới chuyển bước |
| 5 | **Code chạy được ngay** | Code đưa ra phải đầy đủ, copy-paste là chạy |

## 2. Bảng màu chuẩn

| Tên | Mã hex | CSS Class | Ứng dụng |
|-----|--------|-----------|----------|
| Primary | `#7C3AED` | `bg-primary`, `text-primary` | Button chính, header, link |
| Primary Light | `#A78BFA` | `bg-primary-light` | Hover, badge |
| Primary Dark | `#5B21B6` | `bg-primary-dark` | Active, focus |
| Secondary | `#1F2937` | `bg-secondary`, `text-secondary` | Text chính, sidebar, footer |
| Accent | `#EC4899` | `bg-accent`, `text-accent` | Highlight, dấu % |
| Offer | `#F97316` | `bg-offer`, `text-offer` | Flash sale |
| Premium | `#FBBF24` | `bg-premium`, `text-premium` | CTV Pro |
| Community | `#8B5CF6` | `bg-community`, `text-community` | Cộng đồng |
| Success | `#10B981` | `bg-success`, `text-success` | Thành công |
| Warning | `#F59E0B` | `bg-warning`, `text-warning` | Cảnh báo |
| Danger | `#EF4444` | `bg-danger`, `text-danger` | Lỗi |
| Info | `#3B82F6` | `bg-info`, `text-info` | Thông tin |
| Gray | 50-900 | `bg-gray-*`, `text-gray-*` | Nền, text phụ |

## 3. Quy tắc Code

### Component Structure
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

### CSS (Component-scoped)
- Dùng `:host` để style component wrapper
- Không dùng `!important` nếu không cần thiết
- Prefix class với tên component nếu cần tránh conflict

### HTML (Component)
- Dùng `*ngIf`, `*ngFor` với CommonModule
- Dùng `[class]`, `[ngClass]` cho dynamic class
- Dùng `(click)`, `(input)` cho events

## 4. Quy tắc kiến trúc thư mục

| Layer | Thư mục | Vai trò | Đặc điểm |
|-------|---------|---------|----------|
| **Shared Components** | `src/app/shared/components/{name}/` | UI component tái sử dụng toàn cục | Dùng nhiều lần, không có routing |
| **Core Services** | `src/app/core/services/` | Business logic, API call, Auth | Singleton, dùng toàn cục |
| **Core Models** | `src/app/core/models/` | Interface, Type, Enum | Dùng toàn cục |
| **Core Guards** | `src/app/core/guards/` | Route guards (Auth, Role) | Bảo vệ route |
| **Core Interceptors** | `src/app/core/interceptors/` | HTTP interceptors (JWT, Error) | Xử lý request/response |
| **Pages** | `src/app/pages/{page}/` | Trang đơn lẻ, không có sub-routes | 1 trang = 1 component |
| **Features** | `src/app/features/{feature}/` | Module chứa nhiều trang liên quan | Có pages + services + models + routing |

## 5. Phân biệt Pages vs Features

| Tiêu chí | Pages | Features |
|----------|-------|----------|
| Số trang | 1 | Nhiều (2+) |
| Sub-routes | Không | Có (children) |
| Service riêng | Không cần | Có thể có |
| Model riêng | Không cần | Có thể có |
| Ví dụ | Home, Profile, Demo | Auth (Login + Register), Product (List + Detail + Create) |

## 6. Quy tắc Assets

| Loại | Thư mục | Đường dẫn trong HTML |
|------|---------|---------------------|
| Logo, icon, favicon | `public/` | `filename.svg` (không có `/`) |
| Ảnh tĩnh khác | `public/` | `filename.png` |

### Logo versions

| Logo | Path | Công dụng |
|------|------|-----------|
| logo-full.svg | `public/logo-full.svg` | Header, full logo (có chữ) |
| logo-icon.svg | `public/logo-icon.svg` | Sidebar, icon nhỏ (chỉ icon) |
| favicon.svg | `public/favicon.svg` | Tab browser |

## 7. Quy tắc đặt tên thư mục

| Loại | Quy tắc | Ví dụ |
|------|---------|-------|
| Pages | `{name}/` | `home/`, `profile/`, `demo/` |
| Features | `{name}/` | `auth/`, `product/`, `order/` |
| Components | `{name}/` | `button/`, `input/`, `modal/` |
| Services | `{name}.service.ts` | `auth.service.ts`, `api.service.ts` |
| Models | `{name}.model.ts` hoặc `{name}.interface.ts` | `user.model.ts` |
| Guards | `{name}.guard.ts` | `auth.guard.ts` |
| Interceptors | `{name}.interceptor.ts` | `jwt.interceptor.ts` |

## 8. Cấu trúc thư mục chuẩn

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
│       ├── layout/
│       ├── loading/
│       ├── modal/
│       └── toast/
├── pages/
│   ├── demo/
│   ├── home/
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
├── app.ts
├── app.routes.ts
└── app.config.ts
```

## 9. Quy tắc thêm mới

| Bước | Hành động |
|------|-----------|
| 1 | Xác định đây là Page hay Feature? |
| 2 | Nếu là Page: tạo trong `pages/{name}/` |
| 3 | Nếu là Feature: tạo trong `features/{name}/` |
| 4 | Thêm route vào `app.routes.ts` |
| 5 | Import các shared components nếu cần |

## 10. Quy tắc giao tiếp

| Tình huống | Hành động |
|------------|-----------|
| Chưa hiểu ý | Hỏi lại: "Bạn muốn ... đúng không?" |
| Cần thông tin | Hỏi cụ thể từng mục |
| Xong 1 bước | Báo "done" và hỏi bước tiếp theo |
| Có lỗi | Đưa lỗi + giải pháp, không tự fix |

## 11. Quy tắc tạo component mới

| Bước | Hành động |
|------|-----------|
| 1 | Hỏi: Tên component, chức năng, Input/Output |
| 2 | Đợi câu trả lời |
| 3 | Tạo file `.ts`, `.html`, `.css` |
| 4 | Export trong `index.ts` (nếu có) |
| 5 | Hỏi: "Cần thêm gì không?" |

## 12. Các component đã có

| Component | Path | Chức năng |
|-----------|------|-----------|
| Button | `shared/components/button/` | Nút bấm nhiều variant |
| Input | `shared/components/input/` | Form input có validation |
| Layout | `shared/components/layout/` | Header + Sidebar + Footer |
| Loading | `shared/components/loading/` | Loading 6 kiểu (dots/spinner/skeleton/pulse/logo/community) |
| Modal | `shared/components/modal/` | Popup xác nhận |
| Toast | `shared/components/toast/` | Thông báo (success/error/warning/info) |

## 13. Lưu ý

- **Không đoán** - Hỏi trước khi làm
- **Không gộp** - Mỗi bước một việc
- **Không vòng vo** - Trả lời thẳng vào câu hỏi
- **Code chạy ngay** - Đầy đủ, copy-paste là dùng được
- **Không dùng !important** trừ khi thực sự cần
- **Luôn dùng standalone components**
- **Assets để trong `public/`**, đường dẫn không có `/` ở đầu
```