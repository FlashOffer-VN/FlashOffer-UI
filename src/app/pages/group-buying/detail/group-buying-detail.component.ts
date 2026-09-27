import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { GroupBuyingDetailModalComponent } from '@pages/social/components/group-buying-detail-modal/group-buying-detail-modal.component';

/**
 * Trang công khai của một đơn mua chung — đích đến của link chia sẻ
 * (CTV gửi link cho khách để xem chi tiết và tham gia).
 */
@Component({
    selector: 'app-group-buying-detail-page',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, GroupBuyingDetailModalComponent],
    templateUrl: './group-buying-detail.component.html'
})
export class GroupBuyingDetailPageComponent implements OnInit {
    /** Mã đơn mua chung lấy từ URL: /mua-chung/:code */
    code: string | null = null;

    constructor(private _route: ActivatedRoute) { }

    ngOnInit(): void {
        this.code = this._route.snapshot.paramMap.get('code');
    }
}
