import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * V3.4.3 — scrolls the window to the top whenever the route PATHNAME changes, so
 * navigating (e.g. from a footer link while scrolled down) opens the new page at
 * the top instead of mid-page. Hash-only changes (#section on the same page) are
 * intentionally ignored so in-page anchor links still work. Renders nothing.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 'instant' avoids a janky animated scroll; fall back to 'auto' where the
    // ScrollBehavior type doesn't include 'instant'.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]); // pathname only → not triggered by hash-only changes

  return null;
}
