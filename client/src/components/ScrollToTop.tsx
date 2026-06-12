import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollToTop — Scrolls the window to the top whenever the route changes.
 *
 * This ensures every page navigation starts from the top of the page
 * instead of retaining the scroll position from the previous page.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);

  return null;
}
