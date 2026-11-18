// Static site generator for asomiya.codes. Run with `npm run website:build` (after the library and
// the browser bundles are built). Writes HTML for every page in English (/) and Assamese (/as/).
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { COMMUNITY } from './content/community.mjs';
import { HOME } from './content/home.mjs';
import { JOIN } from './content/join.mjs';
import { LEARN } from './content/learn.mjs';
import { NOT_FOUND } from './content/not-found.mjs';
import { PLAYGROUND } from './content/playground.mjs';
import { REFERENCE } from './content/reference.mjs';
import { createHelpers } from './lib/helpers.mjs';
import { renderPage } from './lib/layout.mjs';
import { SITE } from './site.config.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');
const LANGS = ['en', 'as'];

/** Gives a page definition its per-language URLs. */
function prepare(def) {
  return {
    ...def,
    basePath: def.path,
    localUrl: (lang) => (lang === 'as' ? `as/${def.path}` : def.path),
  };
}

/** Sections with a sidebar: groups of pages, read in order (for previous/next links). */
const SECTIONS = [LEARN, REFERENCE].map((section) => ({
  ...section,
  groups: section.groups.map((g) => ({ ...g, pages: g.pages.map(prepare) })),
}));
for (const s of SECTIONS) s.pages = s.groups.flatMap((g) => g.pages);

const SINGLE = [HOME, PLAYGROUND, COMMUNITY, JOIN, NOT_FOUND].map(prepare);

function write(path, html) {
  const file = join(OUT, path.endsWith('.html') ? path : join(path, 'index.html'));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function build(def, lang, section) {
  const page = { ...def, url: def.localUrl(lang) };
  const h = createHelpers(page, lang);
  const body = def.body[lang](h);
  const pages = section?.pages ?? [];
  const index = pages.findIndex((p) => p.id === def.id);
  return renderPage({
    page,
    lang,
    body,
    tocEntries: h.toc.filter((e) => e.level === 2 || e.level === 3),
    groups: section?.groups ?? [],
    sections: SECTIONS,
    prev: index > 0 ? pages[index - 1] : undefined,
    next: index >= 0 ? pages[index + 1] : undefined,
    // English pages show code in English letters first; Assamese pages in Assamese script.
    scriptDefault: lang === 'as' ? 'as' : 'roman',
  });
}

const urls = [];
for (const lang of LANGS) {
  for (const section of SECTIONS) {
    for (const def of section.pages) {
      write(def.localUrl(lang), build(def, lang, section));
      urls.push(def.localUrl(lang));
    }
  }
  for (const def of SINGLE) {
    if (def.id === 'not-found') continue;
    write(def.localUrl(lang), build(def, lang, undefined));
    urls.push(def.localUrl(lang));
  }
}

// GitHub Pages serves /404.html for unknown paths. Its links must work from any depth, so it is
// built as if it were at the site root.
const notFound = SINGLE.find((p) => p.id === 'not-found');
// GitHub Pages serves /404.html at whatever URL was requested, so relative links would break.
// Make them root-absolute (the site is served from the root of asomiya.codes).
const notFoundHtml = build({ ...notFound, localUrl: () => '' }, 'en', undefined).replace(
  /(href|src)="(?!https?:|#|\/|mailto:)([^"]*)"/g,
  (_, attr, url) => `${attr}="/${url === './' ? '' : url}"`,
);
write('404.html', notFoundHtml);

// Static files.
mkdirSync(join(OUT, 'assets'), { recursive: true });
copyFileSync(join(ROOT, 'styles.css'), join(OUT, 'assets', 'styles.css'));
for (const file of readdirSync(join(ROOT, 'public'))) {
  copyFileSync(join(ROOT, 'public', file), join(OUT, file));
}

writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}/${u}</loc></url>`).join('\n')}
</urlset>
`,
);
writeFileSync(
  join(OUT, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`,
);

console.log(`Built ${urls.length} pages into website/dist`);
