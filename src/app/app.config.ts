// app.config.ts
import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgSelectModule } from '@ng-select/ng-select';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { QuillModule } from 'ngx-quill';

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
    provideRouter(
      routes,
      withViewTransitions()
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      NgSelectModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      QuillModule.forRoot({
        modules: {
          syntax: false,
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      deps: [TranslateService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};