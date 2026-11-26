// Every page of the site, shared by the build (website/build.mjs) and the preview-image generator
// (website/scripts/og-images.mjs).
import { AI_PAGE } from '../content/ai.mjs';
import { COMMUNITY } from '../content/community.mjs';
import { EXTENSION_PAGE } from '../content/extension.mjs';
import { HOME } from '../content/home.mjs';
import { JOIN } from '../content/join.mjs';
import { LEARN } from '../content/learn.mjs';
import { NOT_FOUND } from '../content/not-found.mjs';
import { PLAYGROUND } from '../content/playground.mjs';
import { REFERENCE } from '../content/reference.mjs';

export const LANGS = ['en', 'as'];

/** Gives a page definition its per-language URLs. */
function prepare(def) {
  return {
    ...def,
    basePath: def.path,
    localUrl: (lang) => (lang === 'as' ? `as/${def.path}` : def.path),
  };
}

/** Sections with a sidebar: groups of pages, read in order (for previous/next links). */
export const SECTIONS = [LEARN, REFERENCE].map((section) => ({
  ...section,
  groups: section.groups.map((g) => ({ ...g, pages: g.pages.map(prepare) })),
}));
for (const s of SECTIONS) s.pages = s.groups.flatMap((g) => g.pages);

export const SINGLE = [HOME, PLAYGROUND, COMMUNITY, JOIN, EXTENSION_PAGE, AI_PAGE, NOT_FOUND].map(
  prepare,
);

/** Every page that gets built and listed in the sitemap, with its section (if any). */
export function allPages() {
  const out = [];
  for (const lang of LANGS) {
    for (const section of SECTIONS) {
      for (const def of section.pages) out.push({ def, lang, section });
    }
    for (const def of SINGLE) {
      if (def.id !== 'not-found') out.push({ def, lang, section: undefined });
    }
  }
  return out;
}

/**
 * The preview image (og:image) for a page URL, relative to the site root:
 * '' → og/home.png, 'learn/loops/' → og/learn-loops.png, 'as/learn/loops/' → og/as-learn-loops.png.
 */
export function ogImageFile(url) {
  const name = url.replace(/\/$/, '').replace(/\//g, '-');
  if (name === '') return 'og/home.png';
  if (name === 'as') return 'og/as-home.png';
  return `og/${name}.png`;
}
