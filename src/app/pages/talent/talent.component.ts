import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-talent',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './talent.component.html',
    styleUrls: ['./talent.component.css']
})
export class TalentComponent {
    // Mock data - CTV nổi bật
    ctvList = [
        {
            id: 1,
            name: 'Nguyễn Thị Lan',
            avatar: '👩‍💼',
            role: 'Chuyên viên bán hàng',
            experience: 5,
            rating: 4.9,
            skills: ['Bán hàng', 'Chăm sóc khách hàng', 'Đàm phán'],
            status: 'available'
        },
        {
            id: 2,
            name: 'Trần Văn Minh',
            avatar: '👨‍💼',
            role: 'Chuyên viên Marketing',
            experience: 3,
            rating: 4.7,
            skills: ['Digital Marketing', 'Content', 'SEO'],
            status: 'available'
        },
        {
            id: 3,
            name: 'Lê Thị Hoa',
            avatar: '👩‍🎓',
            role: 'Chuyên viên Tuyển dụng',
            experience: 4,
            rating: 4.8,
            skills: ['Tuyển dụng', 'HR', 'Đào tạo'],
            status: 'busy'
        },
        {
            id: 4,
            name: 'Phạm Văn Đức',
            avatar: '👨‍💻',
            role: 'Chuyên viên IT',
            experience: 6,
            rating: 5.0,
            skills: ['Lập trình', 'Hệ thống', 'Bảo mật'],
            status: 'available'
        }
    ];

    // Gói dịch vụ
    packages = [
        {
            id: 1,
            name: 'Cơ bản',
            price: '2.000.000',
            features: ['Tìm kiếm CTV cơ bản', 'Hồ sơ CTV', 'Hỗ trợ 24/7'],
            popular: false
        },
        {
            id: 2,
            name: 'Nâng cao',
            price: '5.000.000',
            features: ['Tìm kiếm CTV nâng cao', 'Đánh giá CTV', 'Hồ sơ chi tiết', 'Hỗ trợ 24/7', 'Báo cáo hiệu quả'],
            popular: true
        },
        {
            id: 3,
            name: 'Doanh nghiệp',
            price: 'Liên hệ',
            features: ['Toàn bộ tính năng', 'CTV độc quyền', 'Tư vấn chiến lược', 'Hỗ trợ 24/7', 'Báo cáo chi tiết', 'Đào tạo CTV'],
            popular: false
        }
    ];

    getStars(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }

    isNumeric(value: any): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
}