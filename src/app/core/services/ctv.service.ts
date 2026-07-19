import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import {
    CtvRegistration,
    CTVRegistrationStatus,
    SalesChannel,
    getCTVStatusLabel,
    getSalesChannelLabel
} from '../models/ctv.model';
import { ApiResponse, PagedResponse } from '../models/paged-response.model';

@Injectable({
    providedIn: 'root'
})
export class CtvService {
    constructor(private _apiService: ApiService) { }

    // ==============================
    // SEED DATA
    // ==============================

    private _mockCtvs: CtvRegistration[] = [
        {
            id: 'ctv-001',
            userId: 'user-001',
            fullName: 'Nguyễn Văn An',
            phone: '0912345678',
            zalo: '0912345678',
            email: 'an.nguyen@gmail.com',
            salesChannel: SalesChannel.Online,
            experience: '3 năm kinh nghiệm bán hàng online, từng làm cho Shopee',
            status: CTVRegistrationStatus.Pending,
            isApproved: false,
            createdAt: '2026-01-15T14:30:00Z',
            user: {
                id: 'user-001',
                username: 'an.nguyen',
                email: 'an.nguyen@gmail.com',
                fullName: 'Nguyễn Văn An',
                phone: '0912345678'
            }
        },
        {
            id: 'ctv-002',
            userId: 'user-002',
            fullName: 'Trần Thị Bích',
            phone: '0913456789',
            zalo: '0913456789',
            email: 'bich.tran@gmail.com',
            salesChannel: SalesChannel.Retail,
            experience: '5 năm quản lý cửa hàng thời trang',
            status: CTVRegistrationStatus.Approved,
            isApproved: true,
            approvedAt: '2026-01-18T10:00:00Z',
            createdAt: '2026-01-16T09:00:00Z',
            user: {
                id: 'user-002',
                username: 'bich.tran',
                email: 'bich.tran@gmail.com',
                fullName: 'Trần Thị Bích',
                phone: '0913456789'
            }
        },
        {
            id: 'ctv-003',
            userId: 'user-003',
            fullName: 'Lê Văn Cường',
            phone: '0914567890',
            zalo: '0914567890',
            email: 'cuong.le@gmail.com',
            salesChannel: SalesChannel.Wholesale,
            experience: '10 năm kinh doanh bán sỉ',
            status: CTVRegistrationStatus.Rejected,
            isApproved: false,
            createdAt: '2026-01-17T16:45:00Z',
            user: {
                id: 'user-003',
                username: 'cuong.le',
                email: 'cuong.le@gmail.com',
                fullName: 'Lê Văn Cường',
                phone: '0914567890'
            }
        },
        {
            id: 'ctv-004',
            userId: 'user-004',
            fullName: 'Phạm Thị Dung',
            phone: '0915678901',
            zalo: '0915678901',
            email: 'dung.pham@gmail.com',
            salesChannel: SalesChannel.Offline,
            experience: '2 năm kinh nghiệm bán hàng trực tiếp',
            status: CTVRegistrationStatus.Pending,
            isApproved: false,
            createdAt: '2026-01-18T08:20:00Z',
            user: {
                id: 'user-004',
                username: 'dung.pham',
                email: 'dung.pham@gmail.com',
                fullName: 'Phạm Thị Dung',
                phone: '0915678901'
            }
        },
        {
            id: 'ctv-005',
            userId: 'user-005',
            fullName: 'Hoàng Văn Em',
            phone: '0916789012',
            zalo: '0916789012',
            email: 'em.hoang@gmail.com',
            salesChannel: SalesChannel.Online,
            experience: '4 năm kinh nghiệm bán hàng trên Tiki',
            status: CTVRegistrationStatus.Approved,
            isApproved: true,
            approvedAt: '2026-01-20T14:00:00Z',
            createdAt: '2026-01-19T11:30:00Z',
            user: {
                id: 'user-005',
                username: 'em.hoang',
                email: 'em.hoang@gmail.com',
                fullName: 'Hoàng Văn Em',
                phone: '0916789012'
            }
        },
        {
            id: 'ctv-006',
            userId: 'user-006',
            fullName: 'Ngô Thị Phương',
            phone: '0917890123',
            zalo: '0917890123',
            email: 'phuong.ngo@gmail.com',
            salesChannel: SalesChannel.Retail,
            experience: '7 năm kinh nghiệm bán hàng',
            status: CTVRegistrationStatus.Pending,
            isApproved: false,
            createdAt: '2026-01-20T15:10:00Z',
            user: {
                id: 'user-006',
                username: 'phuong.ngo',
                email: 'phuong.ngo@gmail.com',
                fullName: 'Ngô Thị Phương',
                phone: '0917890123'
            }
        }
    ];

    // ==============================
    // GET LIST (MOCK DATA)
    // ==============================

    getMockData(
        pageNumber = 1,
        pageSize = 10,
        search = '',
        status?: CTVRegistrationStatus
    ): Observable<PagedResponse<CtvRegistration>> {
        let filtered = [...this._mockCtvs];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(item =>
                item.fullName.toLowerCase().includes(searchLower) ||
                item.email?.toLowerCase().includes(searchLower) ||
                item.phone.includes(search)
            );
        }

        // Filter by status
        if (status !== undefined) {
            filtered = filtered.filter(item => item.status === status);
        }

        // Sort by createdAt descending
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Paginate
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const items = filtered.slice(start, end);

        return of({
            success: true,
            message: 'Success',
            data: items,
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount: filtered.length,
            totalPages: Math.ceil(filtered.length / pageSize),
            hasPreviousPage: pageNumber > 1,
            hasNextPage: end < filtered.length,
            timestamp: new Date().toISOString()
        });
    }

    // ==============================
    // GET DETAIL (MOCK DATA)
    // ==============================

    getMockDetail(id: string): Observable<CtvRegistration | null> {
        const item = this._mockCtvs.find(c => c.id === id);
        return of(item || null);
    }

    // ==============================
    // APPROVE CTV
    // ==============================

    approve(id: string): Observable<ApiResponse<CtvRegistration>> {
        const item = this._mockCtvs.find(c => c.id === id);
        if (item) {
            item.status = CTVRegistrationStatus.Approved;
            item.isApproved = true;
            item.approvedAt = new Date().toISOString();
        }
        return of({
            success: true,
            message: 'Duyệt CTV thành công',
            data: item!,
            errors: null,
            timestamp: new Date().toISOString()
        });
    }

    // ==============================
    // REJECT CTV
    // ==============================

    reject(id: string): Observable<ApiResponse<CtvRegistration>> {
        const item = this._mockCtvs.find(c => c.id === id);
        if (item) {
            item.status = CTVRegistrationStatus.Rejected;
            item.isApproved = false;
        }
        return of({
            success: true,
            message: 'Từ chối CTV thành công',
            data: item!,
            errors: null,
            timestamp: new Date().toISOString()
        });
    }

    // ==============================
    // API THẬT (CHUYỂN ĐỔI SAU)
    // ==============================

    getData(
        pageNumber = 1,
        pageSize = 10,
        search = '',
        status?: CTVRegistrationStatus
    ): Observable<PagedResponse<CtvRegistration>> {
        return this._apiService.get<PagedResponse<CtvRegistration>>(
            `/admin/ctv?page=${pageNumber}&size=${pageSize}&search=${search}&status=${status || ''}`
        );
    }

    getDetail(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.get<ApiResponse<CtvRegistration>>(`/admin/ctv/${id}`);
    }

    approveApi(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.post<ApiResponse<CtvRegistration>>(`/admin/ctv/${id}/approve`, {});
    }

    rejectApi(id: string): Observable<ApiResponse<CtvRegistration>> {
        return this._apiService.post<ApiResponse<CtvRegistration>>(`/admin/ctv/${id}/reject`, {});
    }
}