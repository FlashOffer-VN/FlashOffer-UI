import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<any>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private api: ApiService, private router: Router) {
        this.loadStoredUser();
    }

    login(data: LoginRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('auth/login', data).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.api.post<AuthResponse>('auth/register', data).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private handleAuthResponse(response: AuthResponse): void {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
    }

    private loadStoredUser(): void {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.currentUserSubject.next(JSON.parse(userStr));
        }
    }
}