#!/usr/bin/env node
/**
 * CI check: every public (non-auth) route in app.routes.ts must have a
 * matching entry in app.routes.server.ts, so new pages get prerendered
 * (and thus SEO-indexable) by default.
 *
 * Brace-aware tokenizer. Each object that declares a `path` AND contains
 * `children:` is a layout parent — its path is pushed onto a parent stack
 * when its `children:` is seen and popped when that object closes, giving
 * correct full paths for nested leaf routes. Routes under `admin`/`user`
 * are auth-gated and intentionally client-only (skipped).
 *
 * Usage: node scripts/check-server-routes.mjs
 * Exits non-zero (failing CI) if any public route is missing from the
 * server route config.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const routesSrc = readFileSync(resolve(root, 'src/app/app.routes.ts'), 'utf8');
const serverSrc = readFileSync(resolve(root, 'src/app/app.routes.server.ts'), 'utf8');

const AUTH_PARENTS = ['admin', 'user'];

function collectPublicRoutes(src) {
  const noComments = src.replace(/\/\/[^\n]*/g, '');
  const routes = [];
  const parentStack = []; // path segments of open layout parents

  const stack = []; // object frames { text: '', hasChildren: false }
  let i = 0;

  const pathOf = (text) => {
    const m = text.match(/path\s*:\s*'([^']*)'/);
    return m ? m[1] : null;
  };

  for (i = 0; i < noComments.length; i++) {
    const ch = noComments[i];
    if (ch === '{') {
      stack.push({ text: '', hasChildren: false });
      continue;
    }
    if (ch === '}') {
      const frame = stack.pop();
      if (frame) {
        if (frame.hasChildren) {
          // closing a layout parent — pop its segment
          parentStack.pop();
        } else {
          const path = pathOf(frame.text);
          if (path && !path.includes('**') && path !== '') {
            const full = ['', ...parentStack, path].filter(Boolean).join('/');
            const firstSeg = full.replace(/^\//, '').split('/')[0];
            if (!AUTH_PARENTS.includes(firstSeg)) {
              routes.push(full);
            }
          }
        }
      }
      continue;
    }
    if (stack.length) {
      const top = stack[stack.length - 1];
      top.text += ch;
      if (!top.hasChildren && /children\s*:\s*\[$/.test(top.text)) {
        top.hasChildren = true;
        // The `path` appears before `children:` in the object source, so it's
        // already in top.text. Push its segment now so nested leaves see it.
        const p = pathOf(top.text);
        if (p !== null) parentStack.push(p);
      }
    }
  }

  return routes;
}

const publicRoutes = collectPublicRoutes(routesSrc);
const serverRoutes = [...serverSrc.matchAll(/path:\s*'([^']*)'/g)].map((m) => m[1].replace(/^\//, ''));

const norm = (p) => p.replace(/^\//, '').replace(/:[^/]+/g, ':id');

const missing = [];
for (const r of publicRoutes) {
  const n = norm(r);
  const matched = serverRoutes.some((s) => norm(s) === n);
  if (!matched) missing.push(r);
}

if (missing.length) {
  console.error(
    `❌ SSR coverage: ${missing.length} public route(s) missing from app.routes.server.ts:\n` +
      missing.map((m) => `   - ${m}`).join('\n') +
      '\nAdd a matching { path, renderMode: RenderMode.Prerender } entry.'
  );
  process.exit(1);
}

console.log(`✅ SSR coverage: all public routes present in server config (${publicRoutes.length}).`);
