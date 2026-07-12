// src/app/core/services/ctv-registration.service.ts
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CtvRegistrationRequest, CtvRegistrationResponse, SalesChannel, SalesChannelOption } from '../models/ctv-registration.model';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class CtvRegistrationService {
    private endpoint = 'CtvRegistrations';
    private translate = inject(TranslateService);
    constructor(private api: ApiService) { }

    register(data: CtvRegistrationRequest): Observable<CtvRegistrationResponse> {
        return this.api.post<CtvRegistrationResponse>(this.endpoint, data);
    }

    getSalesChannels(): SalesChannelOption[] {
        return [
            { value: SalesChannel.SALES_CHANNEL_RETAIL, label: this.translate.instant('CTV_FORM.SALES_CHANNEL_RETAIL') },
            { value: SalesChannel.SALES_CHANNEL_WHOLESALE, label: this.translate.instant('CTV_FORM.SALES_CHANNEL_WHOLESALE') },
            { value: SalesChannel.SALES_CHANNEL_ONLINE, label: this.translate.instant('CTV_FORM.SALES_CHANNEL_ONLINE') },
            { value: SalesChannel.SALES_CHANNEL_OFFLINE, label: this.translate.instant('CTV_FORM.SALES_CHANNEL_OFFLINE') },
            { value: SalesChannel.SALES_CHANNEL_OTHER, label: this.translate.instant('CTV_FORM.SALES_CHANNEL_OTHER') }
        ];
    }
}
