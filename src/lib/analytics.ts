// NiHao — GA4 analytics helper. Lightweight, privacy-safe, production-only.
// One GA4 tag (no GTM). The script is injected dynamically from here so it only
// loads in production AND only when a Measurement ID is configured, and never
// blocks first paint. No personal data is ever sent (no email/name/user id/
// progress details/voice).
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

/** Inject the GA4 script once (async) and configure with manual page_view. */
export function initAnalytics(): void {
  if (initialized || !analyticsEnabled()) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  initialized = true;

  // dataLayer + gtag shim (no duplicate init — guarded by `initialized`)
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.gtag = function gtag(...args: any[]) { window.dataLayer.push(args); };

  // async script, does not block first paint
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.gtag('js', new Date());
  // send_page_view:false → we send page views manually on route change to avoid
  // double counting in this SPA. anonymize_ip for privacy.
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
