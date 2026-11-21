/** localStorage is a convenience only: it can be missing or throw (private mode, blocked). */
export function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the setting just isn't remembered.
  }
}

// v2: the site is white by default; earlier saved choices (from the old dark landing page) reset.
export const THEME_KEY = 'asomiya-theme-v2';
/** Preferred script for code samples: 'as' (Assamese) or 'roman' (English letters). */
export const SCRIPT_KEY = 'asomiya-script';
