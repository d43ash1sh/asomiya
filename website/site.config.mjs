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
  linkedin: '',
  x: '',
  youtube: '',
};

/** The team. Links that are empty are not shown. */
export const TEAM = [
  {
    name: { en: 'Debashish Bordoloi', as: 'দেবাশীষ বৰদলৈ' },
    role: { en: 'Creator', as: 'নিৰ্মাতা' },
    initials: 'DB',
    links: SOCIAL,
  },
  {
    name: { en: 'Arnab Sharmah', as: 'অৰ্ণৱ শৰ্মা' },
    role: { en: 'Collaborator & contributor', as: 'সহযোগী আৰু অৱদানকাৰী' },
    initials: 'AS',
    links: {
      github: 'https://github.com/arnabsmh',
      instagram: 'https://www.instagram.com/arnab__sarmaa/',
    },
  },
  {
    name: { en: 'Siddhartha Borah', as: 'সিদ্ধাৰ্থ বৰা' },
    role: { en: 'Collaborator & contributor', as: 'সহযোগী আৰু অৱদানকাৰী' },
    initials: 'SB',
    links: { github: 'https://github.com/siddharthaborah' },
  },
];
