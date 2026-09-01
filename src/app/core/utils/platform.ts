/**
 * True when running in the browser (vs. on the server / during SSR prerender).
 *
 * Canonical SSR-safety guard: any code touching `window`, `document`,
 * `localStorage`, or `navigator` must be gated behind `isBrowser()`.\ Without
 * it, `ng build` (which prerenders routes server-side) crashes with
 * `ReferenceError`, since those globals don't exist in the Node render process.

 * Module-level `typeof` checks (no DI) work from any call site — including
 * service methods at runtime, which `inject(PLATFORM_ID)` cannot do.
 *
 * ```ts
 * if (isBrowser()) {
 *   localStorage.setItem('language', lang);
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}