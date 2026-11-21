// Site-wide settings. Edit SOCIAL to add or change your social links (empty = hidden).
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export const SITE = {
  url: 'https://asomiya.codes',
  repo: 'https://github.com/d43ash1sh/asomiya',
  npm: 'https://www.npmjs.com/package/asomiya',
  version: pkg.version,
};

/** Debashish's social links, shown in the footer and on the Community page. */
export const SOCIAL = {
  github: 'https://github.com/d43ash1sh',
  instagram: 'https://www.instagram.com/debashish.docx/',
  linkedin: 'https://www.linkedin.com/in/debashishbordoloi',
  x: '',
  youtube: '',
};

/** The team, shown on the home and Community pages. Links that are empty are not shown. */
export const TEAM = [
  {
    name: { en: 'Debashish Bordoloi', as: 'দেবাশীষ বৰদলৈ' },
    role: { en: 'Creator & maintainer', as: 'নিৰ্মাতা আৰু ৰক্ষণাবেক্ষণকাৰী' },
    links: {
      linkedin: 'https://www.linkedin.com/in/debashishbordoloi',
      github: 'https://github.com/d43ash1sh',
    },
  },
  {
    name: { en: 'Arnab Sharmah', as: 'অৰ্ণৱ শৰ্মা' },
    role: { en: 'Maintainer', as: 'ৰক্ষণাবেক্ষণকাৰী' },
    links: {
      linkedin: 'https://www.linkedin.com/in/arnab-sharmah-ba844b31a/',
      github: 'https://github.com/arnabsmh',
    },
  },
  {
    name: { en: 'Siddhartha Borah', as: 'সিদ্ধাৰ্থ বৰা' },
    role: { en: 'Maintainer', as: 'ৰক্ষণাবেক্ষণকাৰী' },
    links: {
      linkedin: 'https://www.linkedin.com/in/siddharthaborah/',
      github: 'https://github.com/siddharthaborah',
    },
  },
  {
    name: { en: 'Bigratom Saikia', as: 'Bigratom Saikia' },
    role: { en: 'Contributor', as: 'অৱদানকাৰী' },
    links: {
      linkedin: 'https://www.linkedin.com/in/bigratom-saikia-0415b8208/',
      github: 'https://github.com/saikiabigratom-design',
    },
  },
];

const extPkg = JSON.parse(
  readFileSync(new URL('../editors/vscode/package.json', import.meta.url), 'utf8'),
);

/**
 * The VS Code extension, shown on /extension/. Fill in `marketplace` and `openVsx` once it is
 * published there; until then the page offers the .vsix from GitHub Releases.
 */
export const EXTENSION = {
  id: `${extPkg.publisher}.${extPkg.name}`,
  name: extPkg.displayName,
  version: extPkg.version,
  released: '2026-11-20',
  engine: extPkg.engines.vscode.replace(/^\^/, ''),
  categories: extPkg.categories,
  marketplace: 'https://marketplace.visualstudio.com/items?itemName=asomiya.asomiya',
  openVsx: 'https://open-vsx.org/extension/asomiya/asomiya',
  vsix: `${SITE.repo}/releases/download/vscode-v${extPkg.version}/asomiya-vscode-${extPkg.version}.vsix`,
  source: `${SITE.repo}/tree/main/editors/vscode`,
  changelog: `${SITE.repo}/blob/main/editors/vscode/CHANGELOG.md`,
};
