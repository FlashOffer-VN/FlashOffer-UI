import { TranslateLoader } from '@ngx-translate/core';
import { Observable, from } from 'rxjs';

/**
 * Server-side translate loader for build-time prerendering (SSG).
 *
 * Reads translation JSON straight from `src/assets/i18n/` at build time.
 * The browser uses the normal HTTP loader; on the server (Node prerender
 * worker) `assets/i18n/*.json` can't be fetched over HTTP, so without this
 * the prerendered HTML would contain raw translation keys (e.g. `NAV_*`)
 * instead of the real Vietnamese text — bad for SEO.
 *
 * Only imported by `app.config.server.ts`, never bundled into the client.
 */
export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<Record<string, string>> {
    return from(
      import('fs').then(async (fs) => {
        const path = await import('path');
        const file = path.resolve(process.cwd(), 'src', 'assets', 'i18n', `${lang}.json`);
        const raw = await fs.promises.readFile(file, 'utf8');
        return JSON.parse(raw) as Record<string, string>;
      }),
    );
  }
}