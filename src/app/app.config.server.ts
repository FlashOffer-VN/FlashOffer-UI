import { ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { TranslateLoader } from '@ngx-translate/core';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ServerTranslateLoader } from './server-translate.loader';

/**
 * Server-side configuration used during build-time prerendering (SSG).
 *
 * It carries over every provider from the browser `appConfig` (router, HTTP,
 * translate, guards, interceptors…) so the server render behaves like the
 * client app, and adds `provideServerRendering(withRoutes(...))` so the
 * build knows which routes to prerender.

 * With `outputMode: "static"` in angular.json, each Prerender route becomes
 * a static HTML snapshot at build time (no runtime server file is generated).
 */
export const serverAppConfig: ApplicationConfig = {
  providers: [
    ...(appConfig.providers ?? []),
    // Override the HTTP translate loader on the server: use the fs-based loader
    // so prerendered HTML contains real translated text (last provider wins
    // for non-multi tokens).
    {
      provide: TranslateLoader,
      useClass: ServerTranslateLoader,
    },
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};