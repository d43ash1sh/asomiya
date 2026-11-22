// Loaded in <head> before the page paints, so a saved theme applies without a flash.
import { load, SCRIPT_KEY, THEME_KEY } from './storage';

const theme = load(THEME_KEY);
if (theme === 'light' || theme === 'dark') document.documentElement.dataset['theme'] = theme;

const script = load(SCRIPT_KEY);
if (script === 'as' || script === 'roman') document.documentElement.dataset['script'] = script;

// Sections fade in as they scroll into view (site.ts). Hidden only when that can work, and never for
// visitors who asked for less motion.
if (
  'IntersectionObserver' in window &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  document.documentElement.classList.add('js-motion');
}
