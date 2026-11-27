// Page shell: <head>, top navigation, sidebar, table of contents and footer.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { ANALYTICS, SITE, SOCIAL, SUPPORT } from '../site.config.mjs';
import { UI } from '../content/ui.mjs';
import { esc, rel } from './html.mjs';
import { icon, logo } from './icons.mjs';

/** Google's hosts for Analytics 4: the gtag script, and where it sends page views. */
const GA_SCRIPT = 'https://www.googletagmanager.com';
const GA_COLLECT = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://*.googletagmanager.com',
];
const ga = ANALYTICS.measurementId !== '';

/**
 * Content Security Policy. GitHub Pages can't send headers, so it goes in a <meta> tag. Only our
 * own scripts run (no inline script), plus Google Analytics when ANALYTICS is set; the playground
 * worker comes from this site, and the only network requests allowed are Analytics page views.
 */
const CSP = [
  "default-src 'none'",
  ga ? `script-src 'self' ${GA_SCRIPT}` : "script-src 'self'",
  "worker-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  ga ? `img-src 'self' data: ${GA_COLLECT.join(' ')}` : "img-src 'self' data:",
  "manifest-src 'self'",
  ga ? `connect-src ${GA_COLLECT.join(' ')}` : "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

// Geist for text, Red Hat Display for headings, Geist Mono for code, Noto Sans Bengali for Assamese.
const FONTS =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Red+Hat+Display:ital,wght@0,500;0,700;1,500;1,700&family=Geist+Mono:wght@400;500&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap';

const ROOT = new URL('../', import.meta.url);
const fingerprints = new Map();

/**
 * URL of a static asset with a content hash (`assets/site.js?v=1a2b3c4d`), so browsers fetch the
 * new file after a deploy instead of a stale cached copy.
 */
function asset(page, path) {
  if (!fingerprints.has(path)) {
    const source = path === 'assets/styles.css' ? 'styles.css' : `dist/${path}`;
    const file = new URL(source, ROOT);
    const hash = existsSync(file)
      ? createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 10)
      : 'dev';
    fingerprints.set(path, hash);
  }
  return `${rel(page.url, path)}?v=${fingerprints.get(path)}`;
}

/** Path of a page in the other language. */
export function otherLangPath(path, lang) {
  return lang === 'en' ? `as/${path}` : path.replace(/^as\//, '');
}

function navLinks(page, lang) {
  const t = UI[lang];
  const prefix = lang === 'as' ? 'as/' : '';
  const items = [
    ['learn', `${prefix}learn/`, t.nav.learn],
    ['reference', `${prefix}reference/`, t.nav.reference],
    ['playground', `${prefix}playground/`, t.nav.playground],
    ['extension', `${prefix}extension/`, t.nav.extension],
    ['ai', `${prefix}ai/`, t.nav.ai],
    ['community', `${prefix}community/`, t.nav.community],
  ];
  return items
    .map(
      ([section, href, label]) =>
        `<a href="${rel(page.url, href)}"${page.section === section ? ' aria-current="page"' : ''}>${esc(label)}</a>`,
    )
    .join('');
}

function header(page, lang) {
  const t = UI[lang];
  const home = rel(page.url, lang === 'as' ? 'as/' : '');
  const other = rel(page.url, otherLangPath(page.basePath, lang));
  return `<header class="topnav">
  <div class="topnav-inner">
    <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="drawer" aria-label="${esc(t.menu)}">${icon('menu')}</button>
    <a class="brand" href="${home}" aria-label="Asomiya — ${esc(t.homeLabel)}">
      ${logo(34)}
      <span class="brand-name">asomiya</span>
      <span class="brand-version">${esc(SITE.version)}</span>
    </a>
    <nav class="topnav-links" aria-label="${esc(t.mainNav)}">${navLinks(page, lang)}</nav>
    <div class="topnav-actions">
      <a class="btn btn-secondary btn-nav" href="${rel(page.url, lang === 'as' ? 'as/learn/' : 'learn/')}">${esc(t.quickstart)}</a>
      <a class="btn btn-primary btn-nav" href="${rel(page.url, lang === 'as' ? 'as/learn/installation/' : 'learn/installation/')}">${esc(t.install)}</a>
      <a class="lang-switch" href="${other}" hreflang="${lang === 'en' ? 'as' : 'en'}" lang="${lang === 'en' ? 'as' : 'en'}" title="${esc(t.switchLangTitle)}">${icon('globe')}<span>${esc(t.switchLang)}</span></a>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="${esc(t.toggleTheme)}" title="${esc(t.toggleTheme)}">${icon('sun', 'icon-sun')}${icon('moon', 'icon-moon')}</button>
      <a class="icon-btn" href="${SITE.repo}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icon('github')}</a>
    </div>
  </div>
</header>`;
}

/** Docs sidebar: grouped links of one section. */
export function sidebar(page, lang, groups) {
  return groups
    .map(
      (group) => `<div class="side-group">
  <p class="side-title">${esc(group.title[lang])}</p>
  <ul>${group.pages
    .map(
      (p) =>
        `<li><a href="${rel(page.url, p.localUrl(lang))}"${p.id === page.id ? ' aria-current="page"' : ''}>${esc(p.title[lang])}</a></li>`,
    )
    .join('')}</ul>
</div>`,
    )
    .join('');
}

function drawer(page, lang, groups) {
  const t = UI[lang];
  return `<div class="drawer" id="drawer">
  <nav class="drawer-nav" aria-label="${esc(t.mainNav)}">${navLinks(page, lang)}</nav>
  ${groups.length > 0 ? `<div class="drawer-side">${sidebar(page, lang, groups)}</div>` : ''}
</div>`;
}

function footer(page, lang, sections) {
  const t = UI[lang];
  const col = (title, links) =>
    `<div><p class="foot-title">${esc(title)}</p><ul>${links
      .map(
        ([label, href, external]) =>
          `<li><a href="${external ? href : rel(page.url, href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a></li>`,
      )
      .join('')}</ul></div>`;
  const socials = Object.entries(SOCIAL)
    .filter(([, url]) => url !== '')
    .map(
      ([name, url]) =>
        `<a class="icon-btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer me" aria-label="${esc(name)}">${icon(name)}</a>`,
    )
    .join('');
  return `<footer class="footer">
  <div class="footer-inner">
    <div class="foot-brand">
      <a class="brand" href="${rel(page.url, lang === 'as' ? 'as/' : '')}">${logo(34)}<span class="brand-name">asomiya</span></a>
      <p>${esc(t.footerTagline)}</p>
      <div class="socials">${socials}</div>
      <a class="coffee-btn" href="${esc(SUPPORT.coffee)}" target="_blank" rel="noopener noreferrer">${icon('coffee')}<span>${esc(t.coffee)}</span></a>
    </div>
    ${sections
      .map((s) =>
        col(
          s.title[lang],
          s.pages.slice(0, 6).map((p) => [p.title[lang], p.localUrl(lang)]),
        ),
      )
      .join('')}
    ${col(t.footMore, [
      [t.joinUs, lang === 'as' ? 'as/join/' : 'join/', false],
      [t.extension, lang === 'as' ? 'as/extension/' : 'extension/', false],
      [t.aiFoot, lang === 'as' ? 'as/ai/' : 'ai/', false],
      ['GitHub', SITE.repo, true],
      ['npm', SITE.npm, true],
      [t.coffee, SUPPORT.coffee, true],
      [t.changelog, `${SITE.repo}/blob/main/CHANGELOG.md`, true],
      [t.security, `${SITE.repo}/blob/main/SECURITY.md`, true],
    ])}
  </div>
  <div class="footer-bottom">
    <p>${t.copyright(new Date().getFullYear())}${ga ? ` ${t.privacy}` : ''}</p>
    <p>${t.madeWith}</p>
  </div>
  <div class="foot-mark" aria-hidden="true" data-reveal><span>asomiya</span></div>
</footer>`;
}

function toc(page, lang, entries) {
  if (entries.length < 2) return '';
  return `<aside class="toc" aria-label="${esc(UI[lang].onThisPage)}">
  <p class="toc-title">${esc(UI[lang].onThisPage)}</p>
  <ul>${entries
    .map((e) => `<li class="toc-${e.level}"><a href="#${e.id}">${e.text}</a></li>`)
    .join('')}</ul>
</aside>`;
}

function pager(page, lang, prev, next) {
  if (prev === undefined && next === undefined) return '';
  const t = UI[lang];
  const card = (p, dir) =>
    p === undefined
      ? '<span></span>'
      : `<a class="pager-${dir}" href="${rel(page.url, p.localUrl(lang))}"><span>${esc(dir === 'prev' ? t.previous : t.next)}</span><strong>${esc(p.title[lang])}</strong></a>`;
  return `<nav class="pager" aria-label="${esc(t.pagination)}">${card(prev, 'prev')}${card(next, 'next')}</nav>`;
}

/**
 * A full HTML document.
 * @param {object} o
 */
export function renderPage({
  page,
  lang,
  body,
  tocEntries,
  groups,
  sections,
  prev,
  next,
  scriptDefault,
}) {
  const t = UI[lang];
  const title =
    page.id === 'home' ? `Asomiya — ${page.title[lang]}` : `${page.title[lang]} · Asomiya`;
  const description = page.description[lang];
  const canonical = `${SITE.url}/${page.url}`;
  const alternates = ['en', 'as']
    .map(
      (l) =>
        `<link rel="alternate" hreflang="${l}" href="${SITE.url}/${l === 'en' ? page.basePath : `as/${page.basePath}`}" />`,
    )
    .join('\n    ');
  const layout = page.layout ?? 'docs';
  let main;
  if (layout === 'docs') {
    main = `<div class="docs">
  <aside class="sidebar" aria-label="${esc(t.sectionNav)}">${sidebar(page, lang, groups)}</aside>
  <article class="article">
    ${page.eyebrow ? `<p class="eyebrow">${esc(page.eyebrow[lang])}</p>` : ''}
    <h1>${esc(page.title[lang])}</h1>
    ${page.intro ? `<p class="lead">${page.intro[lang]}</p>` : ''}
    ${body}
    ${pager(page, lang, prev, next)}
    <p class="edit-link"><a href="${SITE.repo}/tree/main/website" target="_blank" rel="noopener noreferrer">${icon('github')} ${esc(t.editOnGithub)}</a></p>
  </article>
  ${toc(page, lang, tocEntries)}
</div>`;
  } else {
    main = body;
  }
  const scripts = [`<script src="${asset(page, 'assets/site.js')}" defer></script>`];
  if (layout === 'playground') {
    scripts.push(`<script src="${asset(page, 'assets/playground.js')}" defer></script>`);
  }
  return `<!doctype html>
<html lang="${lang}" data-script="${scriptDefault}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    ${ga ? `<meta name="ga-measurement-id" content="${esc(ANALYTICS.measurementId)}" />` : ''}
    <link rel="canonical" href="${canonical}" />
    ${alternates}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Asomiya" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${SITE.url}/${page.ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(title)}" />
    <meta property="og:locale" content="${lang === 'as' ? 'as_IN' : 'en_US'}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${SITE.url}/${page.ogImage}" />
    <meta name="theme-color" content="#fafaf9" />
    <link rel="icon" href="${rel(page.url, 'favicon.svg')}" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${FONTS}" />
    <link rel="stylesheet" href="${asset(page, 'assets/styles.css')}" />
    <script src="${asset(page, 'assets/theme.js')}"></script>
    ${scripts.join('\n    ')}
  </head>
  <body class="layout-${layout}">
    <a class="skip" href="#main">${esc(t.skip)}</a>
    ${header(page, lang)}
    ${drawer(page, lang, layout === 'docs' ? groups : [])}
    <main id="main">${main}</main>
    ${layout === 'playground' ? '' : footer(page, lang, sections)}
  </body>
</html>
`;
}
