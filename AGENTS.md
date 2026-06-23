# AGENTS.md

## Cursor Cloud specific instructions

FlashOffer-UI is an Angular 20 + Tailwind frontend. Standard scripts are in `package.json` (`start`, `build`, `test`, `test:ci`). Node 22 and npm are preinstalled. Notes below cover only non-obvious, environment-specific details.

### Install / run / build
- Install deps with `npm ci --legacy-peer-deps` (peer-dep conflicts otherwise; matches CI).
- Dev server: `npm start` (alias for `ng serve`, serves on port `4200`). Build: `npm run build`.
- The dev `src/environments/environment.ts` points `apiUrl` at `https://localhost:7298/api`. The current default route is a component showcase (`/demo`) that does not call the API, so the API need not be running to view the UI.

### Lint
- `npm run lint` fails with "Cannot find lint target" — no ESLint target is configured. CI tolerates this (`npm run lint || echo ...`); it is not an environment problem.

### Tests (known pre-existing failure)
- `npm run test:ci` (Karma + ChromeHeadless) currently **fails to compile** due to a pre-existing source/test mismatch: `src/app/app.spec.ts` imports `App` but `src/app/app.ts` exports `AppComponent`. This is a repo bug, not an environment issue; CI tolerates it (`npm run test:ci || echo ...`).
- Chrome is available at `/usr/local/bin/google-chrome`; set `CHROME_BIN` to that path if Karma cannot find a browser.
