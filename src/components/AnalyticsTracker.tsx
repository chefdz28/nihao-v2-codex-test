import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '@/lib/analytics';

/**
 * Initializes GA4 once and sends a manual page_view on each route change.
 * Renders nothing. No-ops entirely outside production or without a GA ID.
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  // init once on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // page view on every route change (path only — no PII)
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}
