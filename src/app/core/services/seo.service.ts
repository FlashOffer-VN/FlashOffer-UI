import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    constructor(
        private _title: Title,
        private _meta: Meta
    ) { }

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
        this._meta.updateTag({ property: 'og:title', content: data.title });
        this._meta.updateTag({ property: 'og:description', content: data.description });
        this._meta.updateTag({ property: 'og:type', content: 'website' });
        this._meta.updateTag({ property: 'og:url', content: data.url || window.location.href });
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
        this._meta.updateTag({ rel: 'canonical', href: data.url || window.location.href });
    }
}