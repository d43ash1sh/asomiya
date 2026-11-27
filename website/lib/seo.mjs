// Search-engine helpers: page titles that say what Asomiya is, and schema.org structured data
// (JSON-LD) so Google knows this is a free programming language with lessons, and who makes it.
import { SITE, SOCIAL, TEAM } from '../site.config.mjs';
import { UI } from '../content/ui.mjs';

/** People search for "Assamese programming language" / "coding in Assamese", so titles say it. */
const SUFFIX = { en: 'Asomiya, coding in Assamese', as: 'অসমীয়া প্ৰগ্ৰামিং' };
const HOME_TITLE = {
  en: 'Asomiya — A programming language in Assamese | Learn to code in Assamese',
  as: 'অসমীয়া (Asomiya) — অসমীয়া ভাষাত প্ৰগ্ৰামিং শিকক',
};

export function pageTitle(page, lang) {
  if (page.id === 'home') return HOME_TITLE[lang];
  if (page.id === 'not-found') return `${page.title[lang]} · Asomiya`;
  return `${page.title[lang]} · ${SUFFIX[lang]}`;
}

const creator = {
  '@type': 'Person',
  '@id': `${SITE.url}/#creator`,
  name: TEAM[0].name.en,
  url: TEAM[0].links.github,
  sameAs: Object.values(SOCIAL).filter((url) => url !== ''),
};

const language = {
  '@type': 'ComputerLanguage',
  '@id': `${SITE.url}/#language`,
  name: 'Asomiya',
  alternateName: ['অসমীয়া', 'Asomiya programming language', 'Assamese programming language'],
  url: `${SITE.url}/`,
  description:
    'A small, free programming language whose keywords, numbers and error messages are in Assamese. Programs can be written in Assamese script or in English letters.',
  inLanguage: ['as', 'en'],
  creator: { '@id': creator['@id'] },
};

/** The interpreter, playground and tools, as a free app. */
const app = {
  '@type': 'SoftwareApplication',
  '@id': `${SITE.url}/#app`,
  name: 'Asomiya',
  url: `${SITE.url}/playground/`,
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'Programming language',
  operatingSystem: 'Web browser, Windows, macOS, Linux',
  softwareVersion: SITE.version,
  license: 'https://opensource.org/licenses/MIT',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  downloadUrl: SITE.npm,
  codeRepository: SITE.repo,
  inLanguage: ['as', 'en'],
  author: { '@id': creator['@id'] },
  about: { '@id': language['@id'] },
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: 'Asomiya',
  alternateName: 'অসমীয়া',
  url: `${SITE.url}/`,
  inLanguage: ['en', 'as'],
  publisher: { '@id': creator['@id'] },
};

const SECTION_PATH = { learn: 'learn/', reference: 'reference/' };

/** schema.org data for one page, as the body of a <script type="application/ld+json">. */
export function jsonLd(page, lang) {
  const t = UI[lang];
  const url = `${SITE.url}/${page.url}`;
  const home = `${SITE.url}/${lang === 'as' ? 'as/' : ''}`;
  const graph = [];
  if (page.id === 'home') {
    graph.push(website, language, app, creator);
  } else {
    const crumbs = [{ name: 'Asomiya', item: home }];
    const sectionPath = SECTION_PATH[page.section];
    if (sectionPath !== undefined && page.basePath !== sectionPath) {
      crumbs.push({
        name: t.nav[page.section],
        item: `${home}${sectionPath}`,
      });
    }
    crumbs.push({ name: page.title[lang], item: url });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })),
    });
    if (sectionPath !== undefined) {
      graph.push({
        '@type': page.section === 'learn' ? 'LearningResource' : 'TechArticle',
        headline: page.title[lang],
        name: page.title[lang],
        description: page.description[lang],
        url,
        inLanguage: lang,
        isAccessibleForFree: true,
        author: { '@id': creator['@id'] },
        about: { '@id': language['@id'] },
        isPartOf: { '@id': website['@id'] },
        ...(page.section === 'learn'
          ? { learningResourceType: 'Tutorial', educationalLevel: 'Beginner' }
          : {}),
      });
    }
  }
  // "<" is escaped so the data can never close the script tag early.
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  );
}
