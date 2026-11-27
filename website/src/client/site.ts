// Behaviour shared by every page: theme switch, mobile menu, copy buttons, "on this page" links.
import { save, SCRIPT_KEY, THEME_KEY } from './storage';
import './motion';
import { startAnalytics } from './analytics';

/** The site is white unless the visitor chose the dark theme. */
function isDark(): boolean {
  return document.documentElement.dataset['theme'] === 'dark';
}

function setupTheme(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
    button.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      document.documentElement.dataset['theme'] = next;
      save(THEME_KEY, next);
    });
  }
}

function setupMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  if (button === null) return;
  const close = (): void => {
    document.body.classList.remove('menu-open');
    button.setAttribute('aria-expanded', 'false');
  };
  button.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    button.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  for (const link of document.querySelectorAll('.drawer a')) link.addEventListener('click', close);
}

function setupCopyButtons(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    button.addEventListener('click', () => {
      const target = button.closest('.pane, .code-block')?.querySelector('code');
      const text = button.dataset['copy'] !== '' ? button.dataset['copy'] : target?.textContent;
      if (text === undefined) return;
      const label = button.textContent;
      navigator.clipboard.writeText(text).then(
        () => {
          button.textContent = button.dataset['copied'] ?? '✓';
          setTimeout(() => {
            button.textContent = label;
          }, 1500);
        },
        () => undefined,
      );
    });
  }
}

/** Highlights the current section in the "On this page" list while scrolling. */
function setupToc(): void {
  const links = new Map<string, HTMLAnchorElement>();
  for (const a of document.querySelectorAll<HTMLAnchorElement>('.toc a[href^="#"]')) {
    links.set(decodeURIComponent(a.hash.slice(1)), a);
  }
  if (links.size === 0 || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const a of links.values()) a.classList.remove('active');
        links.get(entry.target.id)?.classList.add('active');
      }
    },
    { rootMargin: '-80px 0px -70% 0px' },
  );
  for (const id of links.keys()) {
    const heading = document.getElementById(id);
    if (heading !== null) observer.observe(heading);
  }
}

/** Code samples come in Assamese script and English letters; one choice applies to all of them. */
function setupScriptTabs(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-script-tab]')) {
    button.addEventListener('click', () => {
      const script = button.dataset['scriptTab'];
      if (script !== 'as' && script !== 'roman') return;
      // Keep the clicked sample where it is on screen while others change height.
      const top = button.getBoundingClientRect().top;
      document.documentElement.dataset['script'] = script;
      save(SCRIPT_KEY, script);
      window.scrollBy(0, button.getBoundingClientRect().top - top);
    });
  }
}

setupTheme();
setupScriptTabs();
setupMenu();
setupCopyButtons();
setupToc();

startAnalytics();
