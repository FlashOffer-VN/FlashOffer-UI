import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectWrapperComponent } from '@shared/components/select/ng-select-wrapper.component';

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, TranslateModule, NgSelectWrapperComponent],
    templateUrl: './suppliers.component.html',
    styleUrls: ['./suppliers.component.css']
})
export class SuppliersComponent {
    // Mock data - sẽ thay bằng API sau
    suppliers = [
        {
            id: 1,
            name: 'Công ty TNHH Công nghệ Xanh',
            category: 'Công nghệ',
            rating: 4.8,
            products: ['Phần mềm quản lý', 'Giải pháp đám mây'],
            logo: '🌱',
            verified: true
        },
        {
            id: 2,
            name: 'Logistics Thành Công',
            category: 'Vận tải',
            rating: 4.6,
            products: ['Vận tải đường bộ', 'Kho bãi'],
            logo: '🚚',
            verified: true
        },
        {
            id: 3,
            name: 'Thực phẩm Sạch 365',
            category: 'Thực phẩm',
            rating: 4.9,
            products: ['Thực phẩm hữu cơ', 'Đồ uống'],
            logo: '🥬',
            verified: true
        },
        {
            id: 4,
            name: 'Nội thất Xanh',
            category: 'Nội thất',
            rating: 4.5,
            products: ['Bàn ghế văn phòng', 'Nội thất gia đình'],
            logo: '🪑',
            verified: false
        },
        {
            id: 5,
            name: 'Máy tính Hoàng Gia',
            category: 'Công nghệ',
            rating: 4.7,
            products: ['Laptop', 'Máy tính bàn'],
            logo: '💻',
            verified: true
        },
        {
            id: 6,
            name: 'Sản xuất Tân Tiến',
            category: 'Sản xuất',
            rating: 4.4,
            products: ['Linh kiện điện tử', 'Thiết bị công nghiệp'],
            logo: '⚙️',
            verified: false
        }
    ];

    featuredProducts = [
        { name: 'Phần mềm quản lý bán hàng', supplier: 'Công nghệ Xanh', price: 'Liên hệ' },
        { name: 'Vận tải đường bộ Bắc-Nam', supplier: 'Logistics Thành Công', price: 'Theo yêu cầu' },
        { name: 'Rau củ hữu cơ sạch', supplier: 'Thực phẩm Sạch 365', price: '200.000đ/kg' },
        { name: 'Bàn làm việc thông minh', supplier: 'Nội thất Xanh', price: '2.500.000đ' }
    ];

    searchTerm = '';
    selectedCategory = '';

    readonly categories = [...new Set(this.suppliers.map(supplier => supplier.category))];

    readonly categoryOptions = this.categories.map(category => ({
        label: category,
        value: category
    }));

    get filteredSuppliers() {
        const term = this.searchTerm.trim().toLowerCase();
        return this.suppliers.filter(supplier => {
            const matchesCategory = !this.selectedCategory || supplier.category === this.selectedCategory;
            const searchableText = `${supplier.name} ${supplier.category} ${supplier.products.join(' ')}`.toLowerCase();
            return matchesCategory && (!term || searchableText.includes(term));
        });
    }

    getStars(rating: number): number[] {
        return Array(Math.floor(rating)).fill(0);
    }
}