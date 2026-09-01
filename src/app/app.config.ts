// app.config.ts
import { ApplicationConfig, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgSelectModule } from '@ng-select/ng-select';

import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { QuillModule } from 'ngx-quill';
import { isBrowser } from './core/utils/platform';
import { storageGet, storageSet } from './core/utils/storage';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

function appInitializer(translate: TranslateService) {
  return () => {
    translate.addLangs(['en', 'vi']);
    translate.setDefaultLang('vi');

    let langToUse = 'vi';

    if (isBrowser()) {
      // Browser-only:detect via navigator/localStorage. On the server we
      // pick the default ('vi') — elsewhere prerendered HTML would vary per request.

      const browserLang = translate.getBrowserLang();
      const savedLang = storageGet('language');

      if (savedLang) {
        langToUse = savedLang;

      } else if (browserLang && (browserLang.includes('vi') || browserLang.includes('en'))) {
        langToUse = browserLang.includes('vi') ? 'vi' : 'en';
      }
    }

    storageSet('language', langToUse);

    // Return a promise so app bootstrap (and server-side prerender) waits
    // for translations to load before rendering the first frame — otherwise
    // the snapshot would show empty/raw translation keys.
    return lastValueFrom(translate.use(langToUse));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // withViewTransitions() is client-only; disable it server-side so prerender works.
      ...(isBrowser() ? [withViewTransitions()] : [])
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