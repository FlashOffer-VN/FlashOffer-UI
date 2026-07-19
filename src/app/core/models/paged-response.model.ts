export interface PagedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    timestamp: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errors: string[] | null;
    timestamp: string;
}