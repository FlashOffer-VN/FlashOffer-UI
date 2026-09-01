import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { serverAppConfig } from './app/app.config.server';

/**
 * Server entry point used by the build-time prerendering pipeline (SSG).
 *
 * The default export is a bootstrap function (not an app instance): the
 * Angular application builder's manifest loads `./main.server.mjs` and invokes
 * its `default` export to boot the app on the server during prerendering.
 *
 * The `BootstrapContext` MUST be accepted and forwarded — without it,
 * `bootstrapApplication` throws NG0401 ("Missing Platform") server-side.
 *
 * With `outputMode: "static"`, no runtime server file is generated — this
 * entry only exists to produce the static HTML snapshots at build time.
 */
const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, serverAppConfig, context);

export default bootstrap;