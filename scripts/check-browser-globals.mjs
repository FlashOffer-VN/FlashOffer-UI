#!/usr/bin/env node
/**
 * CI check: fail if `localStorage`, `window.`, `document.`, or `navigator.`
 * appear in src/app code outside the SSR-safe helpers — i.e. in a file that
 * does NOT import `isBrowser` / `isPlatformBrowser` and is not on the
 * allowlist. This enforces the SSR-first pattern so prerendering never
 * crashes on a stray browser global.
 *
 * Usage: node scripts/check-browser-globals.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const APP_DIR = resolve(root, 'src/app');

// Files that intentionally touch browser globals and are SSR-guarded by design.
const ALLOWLIST = new Set([
  'core/utils/platform.ts', // the isBrowser() helper itself
  'core/utils/storage.ts', // the guarded localStorage wrapper
  'shared/components/contact-floating/contact-floating.component.ts', // uses isPlatformBrowser
]);

// Files that are allowed to use these globals because they are created at
// runtime (domino provides document during prerender, and these are guarded).
const PATTERNS = [/\blocalStorage\b/, /\bwindow\./, /\bdocument\./, /\bnavigator\./];
const GUARD_IMPORTS = [/isBrowser/, /isPlatformBrowser/];

function walk(dir, base) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, base));
    else if (name.endsWith('.ts')) out.push(p);
  }
  return out;
}

const files = walk(APP_DIR, APP_DIR);
const offenders = [];

for (const file of files) {
  const rel = file.replace(APP_DIR + '/', '');
  if (ALLOWLIST.has(rel)) continue;

  const src = readFileSync(file, 'utf8');
  const hits = PATTERNS.filter((re) => re.test(src));
  if (!hits.length) continue;

  const guarded = GUARD_IMPORTS.some((re) => re.test(src));
  if (!guarded) {
    offenders.push(`${rel}  (uses ${hits.map((r) => r.source).join(', ')})`);
  }
}

if (offenders.length) {
  console.error(
    '❌ Browser-global scan failed. These files touch `window`/`document`/`localStorage`' +
      ' without importing the SSR-safe `isBrowser()` guard — they will crash `ng build` (prerender):\n' +
      offenders.map((o) => `   - ${o}`).join('\n') +
      '\n\nFix: import { isBrowser } from "@core/utils/platform" and guard the usage, ' +
      'or use storageGet/storageSet from "@core/utils/storage".'
  );
  process.exit(1);
}

console.log(`✅ Browser-global scan clean (${files.length} files).`);
