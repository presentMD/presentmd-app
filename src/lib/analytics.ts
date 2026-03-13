/**
 * Google Analytics initialisation helper.
 *
 * Accepts the Measurement ID as an explicit parameter so the function is
 * fully unit-testable without relying on the Vite build-time `__GA_ID__`
 * define.  In production `main.tsx` passes the injected value; in tests you
 * can call `initGA('G-TEST123')` directly.
 */
export function initGA(gaId: string): void {
  if (!gaId) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', gaId);
}
