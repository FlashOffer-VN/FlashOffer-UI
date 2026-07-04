import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

function appInitializer(translate: TranslateService) {
  return () => {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');

    const browserLang = translate.getBrowserLang();
    const savedLang = localStorage.getItem('language');

    let langToUse = 'vi';

    if (savedLang) {
      langToUse = savedLang;
    } else if (browserLang && (browserLang.includes('vi') || browserLang.includes('en'))) {
      langToUse = browserLang.includes('vi') ? 'vi' : 'en';
    }

    translate.use(langToUse);
    localStorage.setItem('language', langToUse);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // ✅ Thêm withInterceptorsFromDi để hỗ trợ Interceptor cũ
    provideHttpClient(withInterceptorsFromDi()),

    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })),

    // ✅ Thêm APP_INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [TranslateService],
      multi: true
    },

    // ✅ THÊM MỚI: Đăng ký AuthInterceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};