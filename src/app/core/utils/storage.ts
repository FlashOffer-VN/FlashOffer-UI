import { isBrowser } from './platform';

/**
 * SSR-safe wrappers around `localStorage`.
 *
 * `localStorage` only exists in the browser. During build-time prerendering
 * (and any future server-side rendering) a bare `localStorage.getItem(...)`
 * throws `ReferenceError`. Always use these helpers instead of touching
 * `localStorage` directly in services/components.
 */
export function storageGet(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch { /* quota / privacy mode — ignore */ }
}

export function storageRemove(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}