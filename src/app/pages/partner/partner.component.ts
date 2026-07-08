// src/app/pages/partner/partner.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppService } from '@core/services/app.service';

@Component({
    selector: 'app-partner',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './partner.component.html',
    styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit {
    partners: any[] = [];
    isLoading = true;

    constructor(private _appService: AppService) { }

    ngOnInit(): void {
        // TODO: Call API to get partners
        this.loadPartners();
    }

    loadPartners(): void {
        this.isLoading = true;
        // Mock data - sẽ thay bằng API call
        setTimeout(() => {
            this.partners = [
                {
                    id: 1,
                    name: 'Công ty TNHH Công nghệ Xanh',
                    logo: 'fas fa-leaf',
                    category: 'Công nghệ',
                    rating: 4.8,
                    description: 'Giải pháp công nghệ hàng đầu cho doanh nghiệp',
                    products: ['Phần mềm quản lý', 'Giải pháp đám mây', 'AI & Machine Learning'],
                    verified: true,
                    establishedYear: 2018,
                    employees: 50,
                    address: 'Hà Nội, Việt Nam'
                },
                {
                    id: 2,
                    name: 'Logistics Thành Công',
                    logo: 'fas fa-truck',
                    category: 'Vận tải',
                    rating: 4.6,
                    description: 'Dịch vụ vận tải và kho bãi chuyên nghiệp',
                    products: ['Vận tải đường bộ', 'Kho bãi', 'Giao hàng nhanh'],
                    verified: true,
                    establishedYear: 2015,
                    employees: 200,
                    address: 'TP. Hồ Chí Minh, Việt Nam'
                },
                {
                    id: 3,
                    name: 'Thực phẩm Sạch 365',
                    logo: 'fas fa-seedling',
                    category: 'Thực phẩm',
                    rating: 4.9,
                    description: 'Cung cấp thực phẩm hữu cơ và sạch hàng đầu',
                    products: ['Rau củ hữu cơ', 'Thực phẩm đông lạnh', 'Đồ uống'],
                    verified: true,
                    establishedYear: 2019,
                    employees: 30,
                    address: 'Đà Lạt, Việt Nam'
                },
                {
                    id: 4,
                    name: 'Nội thất Xanh',
                    logo: 'fas fa-couch',
                    category: 'Nội thất',
                    rating: 4.5,
                    description: 'Nội thất văn phòng và gia đình chất lượng cao',
                    products: ['Bàn ghế văn phòng', 'Nội thất gia đình', 'Thiết kế nội thất'],
                    verified: false,
                    establishedYear: 2020,
                    employees: 25,
                    address: 'Đà Nẵng, Việt Nam'
                },
                {
                    id: 5,
                    name: 'Máy tính Hoàng Gia',
                    logo: 'fas fa-laptop',
                    category: 'Công nghệ',
                    rating: 4.7,
                    description: 'Cung cấp thiết bị công nghệ chính hãng',
                    products: ['Laptop', 'Máy tính bàn', 'Linh kiện máy tính'],
                    verified: true,
                    establishedYear: 2017,
                    employees: 40,
                    address: 'Hà Nội, Việt Nam'
                },
                {
                    id: 6,
                    name: 'Sản xuất Tân Tiến',
                    logo: 'fas fa-industry',
                    category: 'Sản xuất',
                    rating: 4.4,
                    description: 'Sản xuất linh kiện điện tử và thiết bị công nghiệp',
                    products: ['Linh kiện điện tử', 'Thiết bị công nghiệp', 'Tự động hóa'],
                    verified: false,
                    establishedYear: 2016,
                    employees: 150,
                    address: 'Bắc Ninh, Việt Nam'
                }
            ];
            this.isLoading = false;
        }, 500);
    }

    getStars(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }

    hasHalfStar(rating: number): boolean {
        return rating % 1 >= 0.5;
    }
}