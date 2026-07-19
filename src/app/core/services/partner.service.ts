import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import {
    Partner,
    PartnerStatus,
    BusinessType,
    CompanySize,
    CommissionType,
    ProductCategory,
    getPartnerStatusLabel,
    getBusinessTypeLabel,
    getCompanySizeLabel,
    getCommissionTypeLabel,
    getProductCategoryLabel
} from '../models/partner.model';
import { ApiResponse, PagedResponse } from '../models/paged-response.model';

@Injectable({
    providedIn: 'root'
})
export class PartnerService {
    constructor(private _apiService: ApiService) { }

    // ==============================
    // SEED DATA
    // ==============================

    private _mockPartners: Partner[] = [
        {
            id: 'partner-001',
            userId: 'user-001',
            partnerCode: 'P001',
            fullName: 'Nguyễn Văn An',
            phone: '0912345678',
            email: 'an.nguyen@company.com',
            position: 'Giám đốc',
            companyName: 'ABC Corporation',
            companyTax: '1234567890',
            companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
            businessType: BusinessType.SME,
            companySize: CompanySize.Size11_50,
            companyWebsite: 'www.abccorp.com',
            referralCode: 'REF001',
            note: 'Đối tác tiềm năng, có hệ thống phân phối rộng',
            status: PartnerStatus.Pending,
            createdAt: '2026-01-15T14:30:00Z',
            user: {
                id: 'user-001',
                username: 'an.nguyen',
                email: 'an.nguyen@company.com',
                fullName: 'Nguyễn Văn An',
                phone: '0912345678'
            },
            commission: {
                id: 'comm-001',
                partnerId: 'partner-001',
                type: CommissionType.Percentage,
                rate: 10,
                minOrderValue: 1000000,
                maxCommission: 5000000,
                specialConditions: 'Áp dụng cho đơn hàng đầu tiên'
            },
            products: [
                {
                    id: 'prod-001',
                    partnerId: 'partner-001',
                    name: 'Laptop Pro X',
                    description: 'Laptop cao cấp cho dân văn phòng',
                    category: ProductCategory.Electronics,
                    retailPrice: 15000000,
                    wholesalePrice: 13000000,
                    minOrderQuantity: 5
                },
                {
                    id: 'prod-002',
                    partnerId: 'partner-001',
                    name: 'Smartphone Y',
                    description: 'Điện thoại thông minh tầm trung',
                    category: ProductCategory.Electronics,
                    retailPrice: 10000000,
                    wholesalePrice: 8500000,
                    minOrderQuantity: 10
                }
            ]
        },
        {
            id: 'partner-002',
            userId: 'user-002',
            partnerCode: 'P002',
            fullName: 'Trần Thị Bích',
            phone: '0913456789',
            email: 'bich.tran@xyz.com',
            position: 'Trưởng phòng kinh doanh',
            companyName: 'XYZ Limited',
            companyTax: '9876543210',
            companyAddress: '456 Đường XYZ, Quận 2, TP.HCM',
            businessType: BusinessType.Corporation,
            companySize: CompanySize.Size51_200,
            companyWebsite: 'www.xyz.com',
            referralCode: 'REF002',
            note: '',
            status: PartnerStatus.Approved,
            approvedAt: '2026-01-18T10:00:00Z',
            createdAt: '2026-01-16T09:00:00Z',
            user: {
                id: 'user-002',
                username: 'bich.tran',
                email: 'bich.tran@xyz.com',
                fullName: 'Trần Thị Bích',
                phone: '0913456789'
            },
            commission: {
                id: 'comm-002',
                partnerId: 'partner-002',
                type: CommissionType.Fixed,
                rate: 500000,
                minOrderValue: 2000000,
                maxCommission: 2000000,
                specialConditions: ''
            },
            products: [
                {
                    id: 'prod-003',
                    partnerId: 'partner-002',
                    name: 'Áo sơ mi công sở',
                    description: 'Áo sơ mi cao cấp',
                    category: ProductCategory.Fashion,
                    retailPrice: 500000,
                    wholesalePrice: 350000,
                    minOrderQuantity: 20
                }
            ]
        },
        {
            id: 'partner-003',
            userId: 'user-003',
            partnerCode: 'P003',
            fullName: 'Lê Văn Cường',
            phone: '0914567890',
            email: 'cuong.le@123co.com',
            position: 'Chủ sở hữu',
            companyName: '123 Company',
            companyTax: '4567890123',
            companyAddress: '789 Đường 123, Quận 3, TP.HCM',
            businessType: BusinessType.SoleProprietor,
            companySize: CompanySize.Size1_10,
            companyWebsite: '',
            referralCode: 'REF003',
            note: 'Hồ sơ chưa đầy đủ',
            status: PartnerStatus.Rejected,
            createdAt: '2026-01-17T16:45:00Z',
            user: {
                id: 'user-003',
                username: 'cuong.le',
                email: 'cuong.le@123co.com',
                fullName: 'Lê Văn Cường',
                phone: '0914567890'
            }
        },
        {
            id: 'partner-004',
            userId: 'user-004',
            partnerCode: 'P004',
            fullName: 'Phạm Thị Dung',
            phone: '0915678901',
            email: 'dung.pham@definc.com',
            position: 'Phó giám đốc',
            companyName: 'DEF Inc.',
            companyTax: '5678901234',
            companyAddress: '101 Đường DEF, Quận 4, TP.HCM',
            businessType: BusinessType.Limited,
            companySize: CompanySize.Size200Plus,
            companyWebsite: 'www.definc.com',
            referralCode: 'REF004',
            note: 'Đối tác chiến lược',
            status: PartnerStatus.Active,
            approvedAt: '2026-01-20T14:00:00Z',
            createdAt: '2026-01-19T11:30:00Z',
            user: {
                id: 'user-004',
                username: 'dung.pham',
                email: 'dung.pham@definc.com',
                fullName: 'Phạm Thị Dung',
                phone: '0915678901'
            },
            commission: {
                id: 'comm-004',
                partnerId: 'partner-004',
                type: CommissionType.Tiered,
                rate: 15,
                minOrderValue: 5000000,
                maxCommission: 10000000,
                specialConditions: 'Tăng dần theo doanh số'
            },
            products: [
                {
                    id: 'prod-004',
                    partnerId: 'partner-004',
                    name: 'Nồi cơm điện cao cấp',
                    description: 'Nồi cơm điện đa năng',
                    category: ProductCategory.Home,
                    retailPrice: 2000000,
                    wholesalePrice: 1600000,
                    minOrderQuantity: 10
                },
                {
                    id: 'prod-005',
                    partnerId: 'partner-004',
                    name: 'Bộ dao kéo nhà bếp',
                    description: 'Bộ dao kéo 5 món',
                    category: ProductCategory.Home,
                    retailPrice: 500000,
                    wholesalePrice: 350000,
                    minOrderQuantity: 30
                }
            ]
        },
        {
            id: 'partner-005',
            userId: 'user-005',
            partnerCode: 'P005',
            fullName: 'Hoàng Văn Em',
            phone: '0916789012',
            email: 'em.hoang@ghigroup.com',
            position: 'Trưởng phòng kinh doanh',
            companyName: 'GHI Group',
            companyTax: '6789012345',
            companyAddress: '202 Đường GHI, Quận 5, TP.HCM',
            businessType: BusinessType.Partnership,
            companySize: CompanySize.Size11_50,
            companyWebsite: 'www.ghigroup.com',
            referralCode: 'REF005',
            note: '',
            status: PartnerStatus.Pending,
            createdAt: '2026-01-20T15:10:00Z',
            user: {
                id: 'user-005',
                username: 'em.hoang',
                email: 'em.hoang@ghigroup.com',
                fullName: 'Hoàng Văn Em',
                phone: '0916789012'
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
        status?: PartnerStatus
    ): Observable<PagedResponse<Partner>> {
        let filtered = [...this._mockPartners];

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(item =>
                item.fullName.toLowerCase().includes(searchLower) ||
                item.email.toLowerCase().includes(searchLower) ||
                item.companyName.toLowerCase().includes(searchLower) ||
                item.companyTax.includes(search) ||
                item.phone.includes(search) ||
                item.partnerCode.toLowerCase().includes(searchLower)
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

    getMockDetail(id: string): Observable<Partner | null> {
        const item = this._mockPartners.find(p => p.id === id);
        return of(item || null);
    }

    // ==============================
    // APPROVE PARTNER
    // ==============================

    approve(id: string): Observable<ApiResponse<Partner>> {
        const item = this._mockPartners.find(p => p.id === id);
        if (item) {
            item.status = PartnerStatus.Approved;
            item.approvedAt = new Date().toISOString();
        }
        return of({
            success: true,
            message: 'Duyệt Partner thành công',
            data: item!,
            errors: null,
            timestamp: new Date().toISOString()
        });
    }

    // ==============================
    // REJECT PARTNER
    // ==============================

    reject(id: string): Observable<ApiResponse<Partner>> {
        const item = this._mockPartners.find(p => p.id === id);
        if (item) {
            item.status = PartnerStatus.Rejected;
        }
        return of({
            success: true,
            message: 'Từ chối Partner thành công',
            data: item!,
            errors: null,
            timestamp: new Date().toISOString()
        });
    }

    // ==============================
    // ACTIVATE PARTNER
    // ==============================

    activate(id: string): Observable<ApiResponse<Partner>> {
        const item = this._mockPartners.find(p => p.id === id);
        if (item && item.status === PartnerStatus.Approved) {
            item.status = PartnerStatus.Active;
        }
        return of({
            success: true,
            message: 'Kích hoạt Partner thành công',
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
        status?: PartnerStatus
    ): Observable<PagedResponse<Partner>> {
        return this._apiService.get<PagedResponse<Partner>>(
            `/admin/partner?page=${pageNumber}&size=${pageSize}&search=${search}&status=${status || ''}`
        );
    }

    getDetail(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.get<ApiResponse<Partner>>(`/admin/partner/${id}`);
    }

    approveApi(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.post<ApiResponse<Partner>>(`/admin/partner/${id}/approve`, {});
    }

    rejectApi(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.post<ApiResponse<Partner>>(`/admin/partner/${id}/reject`, {});
    }

    activateApi(id: string): Observable<ApiResponse<Partner>> {
        return this._apiService.post<ApiResponse<Partner>>(`/admin/partner/${id}/activate`, {});
    }
}