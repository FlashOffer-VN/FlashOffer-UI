// src/app/core/models/offer-request.model.ts
import { ApiResponse } from './auth.model';
import { PagedResponse } from './paged-response.model';

export interface OfferRequest {
    id: string;
    userId: string;
    offerRequestCode?: string | null;
    productName: string;
    productLink: string | null;
    currentPrice: number;
    expectedPrice: number | null;
    quantity: number;
    unit: string;
    fullName: string;
    phone: string;
    zalo: string | null;
    email: string | null;
    note: string | null;
    status: OfferStatus;
    isOfferSent: boolean;
    businessFieldId?: string | null;
    createdAt: string;
    updatedAt?: string;
}

export enum OfferStatus {
    PENDING = 1,
    APPROVED = 2,
    REJECTED = 3,
    EXPIRED = 4
}

export interface CreateOfferRequest {
    productName: string;
    productLink?: string;
    currentPrice: number;
    expectedPrice?: number;
    quantity: number;
    unit: string;
    fullName: string;
    phone: string;
    zalo?: string;
    email?: string;
    note?: string;
}

export interface OfferRequestOfferSentStatus {
    id: string;
    offerRequestCode: string | null;
    status: OfferStatus;
    updatedAt: string;
}

export interface OfferRequestResponse extends ApiResponse<OfferRequest> { }

export interface OfferRequestListResponse extends ApiResponse<OfferRequest[]> { }

export interface OfferRequestPagedResponse extends PagedResponse<OfferRequest> { }

export interface OfferRequestStatusResponse extends ApiResponse<OfferRequestOfferSentStatus> { }