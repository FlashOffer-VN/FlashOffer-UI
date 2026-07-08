// src/app/core/models/auth.model.ts

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole | string;
    fullName?: string;
    status?: UserStatus;
    createdAt?: string;
    updatedAt?: string;
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

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// ✅ AuthResponse có thể chứa data
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        id?: number;
        token: string;
        refreshToken?: string;
        expiresAt: string;
        username: string;
        fullName: string;
        role: string;
        email?: string;
    };
    errors: string[] | null;
    timestamp: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    timestamp: string;
}