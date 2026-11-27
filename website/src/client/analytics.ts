// Visitor counts with Google Analytics 4. The measurement ID comes from a <meta> tag the page
// generator writes (website/site.config.mjs → ANALYTICS). No inline script: this file sets up
// gtag and loads Google's script itself, so the Content Security Policy stays strict.

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

/** Visitors who ask not to be tracked (Do Not Track or Global Privacy Control) are not counted. */
function optedOut(): boolean {
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
}

/** Local previews (npm run website:serve) are never counted. */
function isLocal(): boolean {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

export function startAnalytics(): void {
  const id = document.querySelector<HTMLMetaElement>('meta[name="ga-measurement-id"]')?.content;
  if (id === undefined || !/^G-[A-Z0-9]+$/.test(id) || optedOut() || isLocal()) return;

  const dataLayer = (window.dataLayer ??= []);
  // gtag must push the `arguments` object itself, as Google's snippet does (not an array).
  function gtag(...args: unknown[]): void;
  function gtag(): void {
    // eslint-disable-next-line prefer-rest-params
    dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.append(script);
}
