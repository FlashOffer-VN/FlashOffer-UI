import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { isBrowser } from '../utils/platform';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private _title = inject(Title);
    private _meta = inject(Meta);
    private _doc = inject(DOCUMENT);

    /**
     * Trả về URL đầy robust across browser/server (SSR/prerender).
     * Dùng `document.location` (có trên cả 2 môi trường — server gets it from
     * the platform INITIAL_CONFIG.url) thay vì `window.location` (chỉ tồn tại browser).
     */
    private currentUrl(): string {
        if (this._doc?.location?.href) {
            return this._doc.location.href;
        }
        // Fallback cuối — tránh throw trên server nếu DOM emulation thiếu location.

        if (typeof window !== 'undefined' && window.location?.href) {
            return window.location.href;
        }
        return '';
    }

    /**
     * Cập nhật SEO cho trang
     * @param data - Thông tin SEO
     */
    setSEO(data: {
        title: string;
        description: string;
        image?: string;
        url?: string;
        keywords?: string;
    }): void {
        // 1. Title
        this._title.setTitle(data.title);

        // 2. Meta Description
        this._meta.updateTag({ name: 'description', content: data.description });

        // 3. Keywords (nếu có)
        if (data.keywords) {
            this._meta.updateTag({ name: 'keywords', content: data.keywords });
        }

        // 4. Open Graph (Facebook, Zalo, LinkedIn)
        const url = data.url || this.currentUrl();
        this._meta.updateTag({ property: 'og:title', content: data.title });
        this._meta.updateTag({ property: 'og:description', content: data.description });
        this._meta.updateTag({ property: 'og:type', content: 'website' });
        this._meta.updateTag({ property: 'og:url', content: url });
        if (data.image) {
            this._meta.updateTag({ property: 'og:image', content: data.image });
            this._meta.updateTag({ property: 'og:image:width', content: '1200' });
            this._meta.updateTag({ property: 'og:image:height', content: '630' });
        }

        // 5. Twitter Card
        this._meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this._meta.updateTag({ name: 'twitter:title', content: data.title });
        this._meta.updateTag({ name: 'twitter:description', content: data.description });
        if (data.image) {
            this._meta.updateTag({ name: 'twitter:image', content: data.image });
        }

        // 6. Canonical URL
        this._meta.updateTag({ rel: 'canonical', href: url });
    }
}