// NiHao — GA4 analytics helper. Lightweight, privacy-safe, production-only.
// One GA4 tag (no GTM). As of V3.4.1 the gtag <script> + base config live in
// index.html <head> (so Google's installer detects it). This helper reuses that
// tag when present and only falls back to dynamic injection if it's missing.
// The head tag uses send_page_view:false, so SPA route page views are sent
// manually here (no double counting). No personal data is ever sent.
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let initialized = false;

/** Routes we never track (admin/private). */
function isExcludedPath(path: string): boolean {
  return path.startsWith('/admin');
}

/** True only when we should run GA at all. */
function analyticsEnabled(): boolean {
  return Boolean(import.meta.env.PROD && GA_ID);
}

/** Has the static head tag already loaded gtag? */
function headTagPresent(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Idempotent init. If the index.html head tag is present (normal production),
 * gtag + config already exist — we do nothing extra. If it's missing (e.g. a
 * build without the env var at build time), we fall back to injecting the tag
 * once so analytics still works. Either way this runs at most once.
 */
export function initAnalytics(): void {
  if (initialized || !analyticsEnabled()) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  initialized = true;

  // Head tag already set up dataLayer/gtag/config → reuse it, no duplicate.
  if (headTagPresent()) return;

  // Fallback: head tag absent → inject once (same config as the head tag).
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: any[]) { window.dataLayer.push(args); };

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.gtag('js', new Date());
  window.gtag('config', GA_ID as string, {
    send_page_view: false,
    anonymize_ip: true,
  });
}

/** Manual page view on route change (no PII — path only). */
export function trackPageView(path: string): void {
  if (!analyticsEnabled() || !window.gtag) return;
  if (isExcludedPath(path)) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
}

/** Minimal custom event. Params must never contain personal data. */
export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!analyticsEnabled() || !window.gtag) return;
  if (isExcludedPath(window.location.pathname)) return;
  window.gtag('event', name, params || {});
}
