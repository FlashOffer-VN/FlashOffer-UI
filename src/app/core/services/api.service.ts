import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    protected baseUrl = environment.apiUrl;

    constructor(
        protected http: HttpClient,
        private _translate: TranslateService
    ) { }

    get<T>(endpoint: string, params?: HttpParams | Record<string, any>): Observable<T> {
        let httpParams: HttpParams | undefined;
        if (params) {
            if (params instanceof HttpParams) {
                httpParams = params;
            } else {
                httpParams = new HttpParams({ fromObject: params });
            }
        }
        return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
            .pipe(catchError(this.handleError.bind(this)));
    }

    post<T>(endpoint: string, data?: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data ?? {})
            .pipe(catchError(this.handleError.bind(this)));
    }

    put<T>(endpoint: string, data?: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data || {})
            .pipe(catchError(this.handleError.bind(this)));
    }

    patch<T>(endpoint: string, data?: any): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data || {})
            .pipe(catchError(this.handleError.bind(this)));
    }

    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${endpoint}`)
            .pipe(catchError(this.handleError.bind(this)));
    }

    private handleError(error: any): Observable<never> {
        const status = error.status;
        let message = this._translate.instant('COMMON.ERROR.UNKNOWN');
        let isSystemError = false;
        let errors: string[] = [];

        if (status >= 400 && status < 500) {
            message = error.error?.errors?.[0]
                || error.error?.message
                || error.message
                || this._translate.instant('COMMON.ERROR.INVALID_DATA');
            errors = error.error?.errors || [];
            isSystemError = false;
        } else if (status >= 500) {
            message = this._translate.instant('COMMON.ERROR.SYSTEM_ERROR');
            isSystemError = true;
        } else if (status === 0) {
            message = this._translate.instant('COMMON.ERROR.CONNECTION_ERROR');
            isSystemError = true;
        } else {
            message = error.error?.message || this._translate.instant('COMMON.ERROR.UNKNOWN');
            errors = error.error?.errors || [];
        }

        return throwError(() => ({
            status,
            message,
            errors,
            isSystemError,
            originalError: error
        }));
    }
}