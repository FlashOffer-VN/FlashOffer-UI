// app.routes.ts
import { Routes } from '@angular/router';
import { adminRoutes } from '@core/routes/admin.routes';
import { guestRoutes } from '@core/routes/guest.routes';
import { userRoutes } from '@core/routes/user.routes';

/**
 * Route gốc — mỗi nhóm layout khai ở file riêng trong core/routes để dễ tra cứu:
 * guest (khách chưa đăng nhập) -> admin (quản trị) -> user (đã đăng nhập).
 */
export const routes: Routes = [
    ...guestRoutes,
    ...adminRoutes,
    ...userRoutes,

    // Fallback
    { path: '**', redirectTo: '' }
];
