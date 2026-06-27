import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

function appInitializer(translate: TranslateService) {
  return () => {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi'); // Primary default

    const browserLang = translate.getBrowserLang();
    const savedLang = localStorage.getItem('language');

    let langToUse = 'vi'; // Final fallback

    if (savedLang) {
      langToUse = savedLang;
    } else if (browserLang && (browserLang.includes('vi') || browserLang.includes('en'))) {
      langToUse = browserLang.includes('vi') ? 'vi' : 'en';
    }

    translate.use(langToUse); // Set initial language
    localStorage.setItem('language', langToUse); // Persist initial determined language
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [TranslateService],
      multi: true
    }
  ]
};