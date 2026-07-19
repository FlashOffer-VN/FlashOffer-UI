import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    protected baseUrl = environment.apiUrl;

    constructor(protected http: HttpClient) { }

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