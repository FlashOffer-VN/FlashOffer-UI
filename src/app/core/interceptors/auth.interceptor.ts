// core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // ✅ Lấy token
        const token = this.authService.getToken();

        // ✅ Clone request và thêm Authorization header nếu có token
        let authReq = req;
        if (token) {
            authReq = this.addTokenToRequest(req, token);
        }

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // Nếu 401 (Unauthorized) - thử refresh token
                if (error.status === 401 && !authReq.url.includes('auth/refresh')) {
                    return this.handle401Error(authReq, next);
                }

                // Nếu 403 (Forbidden) - logout luôn
                if (error.status === 403) {
                    this.authService.logout();
                }

                return throwError(() => error);
            })
        );
    }

    private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
                switchMap((response: any) => {
                    this.isRefreshing = false;
                    const newToken = response?.data?.token || response?.token;
                    this.refreshTokenSubject.next(newToken);

                    // ✅ Retry request với token mới
                    return next.handle(this.addTokenToRequest(request, newToken));
                }),
                catchError((error) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(() => error);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => {
                    return next.handle(this.addTokenToRequest(request, token!));
                })
            );
        }
    }
}