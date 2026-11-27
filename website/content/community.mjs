// Community page: the team, social links, and how to contribute.
import { SITE, SOCIAL, SUPPORT } from '../site.config.mjs';
import { teamGrid } from '../lib/team.mjs';

const LABELS = {
  github: 'GitHub',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  x: 'X',
  youtube: 'YouTube',
};
import { esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const S = {
  en: {
    team: 'The team',
    follow: 'Follow along',
    followText: 'News, behind-the-scenes and new features:',
    contribute: 'Contribute',
    support: 'Support Asomiya',
    supportText:
      'Asomiya is free and always will be. If it helped you or your students, a coffee pays for the domain and hosting, and for the time to write lessons and tools for learners.',
    coffee: 'Buy me a coffee',
    contributeText:
      'Asomiya is open source and gets better with every voice. You don’t need to be an expert to help:',
    ways: [
      [
        'Suggest better words',
        'Are you a native Assamese speaker? Tell us if a keyword or message sounds unnatural. Some keywords are still provisional.',
      ],
      [
        'Report bugs',
        'Something doesn’t work as described? Open an issue with the program you ran.',
      ],
      ['Improve the docs', 'Fix a typo, clarify an explanation, or translate a page.'],
      ['Write code', 'Pick an open issue, read CONTRIBUTING.md and send a pull request.'],
    ],
    open: 'Open an issue',
    guide: 'Contributing guide',
    contributors: 'All contributors on GitHub',
    thanks: 'Acknowledgements',
    thanksText:
      'The idea of a playful language with native-language keywords was inspired by <a href="https://github.com/DulLabs/bhai-lang" target="_blank" rel="noopener noreferrer">BhaiLang</a>. Asomiya has its own grammar, semantics and implementation.',
    license: 'License',
    licenseText:
      'Asomiya is free software under the MIT License. You can use it, change it and share it, including in schools and commercial projects.',
  },
  as: {
    team: 'দলটো',
    follow: 'লগত থাকক',
    followText: 'বাতৰি, পিছফালৰ কাম-কাজ আৰু নতুন সুবিধা:',
    contribute: 'অৱদান আগবঢ়াওক',
    support: 'অসমীয়াক সহায় কৰক',
    supportText:
      'অসমীয়া বিনামূলীয়া, আৰু সদায় থাকিব। ই যদি আপোনাক বা আপোনাৰ ছাত্ৰ-ছাত্ৰীক সহায় কৰিছে, একাপ কফিয়ে ডমেইন আৰু হ’ষ্টিঙৰ খৰচ, আৰু শিকাৰুৰ বাবে পাঠ আৰু সঁজুলি লিখাৰ সময় যোগায়।',
    coffee: 'একাপ কফি খুৱাওক',
    contributeText:
      'অসমীয়া মুক্ত উৎসৰ, আৰু প্ৰতিজনৰ মতামতে ইয়াক উন্নত কৰে। সহায় কৰিবলৈ বিশেষজ্ঞ হ’ব নালাগে:',
    ways: [
      [
        'ভাল শব্দৰ পৰামৰ্শ দিয়ক',
        'অসমীয়া আপোনাৰ মাতৃভাষা নেকি? কোনো মূল শব্দ বা বাৰ্তা অস্বাভাৱিক লাগিলে জনাওক। কিছুমান শব্দ এতিয়াও অস্থায়ী।',
      ],
      ['ভুল জনাওক', 'কিবা যিদৰে কোৱা হৈছে তেনেকৈ কাম কৰা নাই? চলোৱা প্ৰগ্ৰামটোৰ সৈতে এটা ইছ্যু খোলক।'],
      ['নথি উন্নত কৰক', 'বানান ভুল শুধৰাওক, ব্যাখ্যা স্পষ্ট কৰক, বা এটা পৃষ্ঠা অনুবাদ কৰক।'],
      ['ক’ড লিখক', 'এটা খোলা ইছ্যু বাছি লওক, CONTRIBUTING.md পঢ়ক আৰু পুল ৰিকুৱেষ্ট পঠিয়াওক।'],
    ],
    open: 'ইছ্যু খোলক',
    guide: 'অৱদানৰ নিৰ্দেশিকা',
    contributors: 'GitHub ত সকলো অৱদানকাৰী',
    thanks: 'কৃতজ্ঞতা',
    thanksText:
      'নিজৰ ভাষাৰ মূল শব্দৰে খেলুৱৈ ভাষা এটাৰ ধাৰণাটো <a href="https://github.com/DulLabs/bhai-lang" target="_blank" rel="noopener noreferrer">BhaiLang</a>-ৰ পৰা অনুপ্ৰাণিত। অসমীয়াৰ নিজা ব্যাকৰণ, অৰ্থ আৰু ৰূপায়ণ আছে।',
    license: 'অনুজ্ঞাপত্ৰ',
    licenseText:
      'অসমীয়া MIT অনুজ্ঞাপত্ৰৰ অধীনত বিনামূলীয়া ছফ্টৱেৰ। স্কুল আৰু ব্যৱসায়িক প্ৰকল্পকে ধৰি ইয়াক ব্যৱহাৰ, সলনি আৰু বিতৰণ কৰিব পাৰে।',
  },
};

function body(lang) {
  const s = S[lang];
  return (h) => `
<section class="page-hero">
  <h1>${lang === 'en' ? 'Community' : 'সমাজ'}</h1>
  <p>${lang === 'en' ? 'The people behind Asomiya, and how you can join them.' : 'অসমীয়াৰ পিছৰ মানুহখিনি, আৰু আপুনি কেনেকৈ যোগ দিব পাৰে।'}</p>
</section>
<section class="section narrow">
  <h2 id="team">${s.team}</h2>
  ${teamGrid(lang)}
  <p class="center"><a class="text-link" href="${SITE.repo}/graphs/contributors" target="_blank" rel="noopener noreferrer">${s.contributors}</a></p>
</section>
<section class="section narrow">
  <h2 id="follow">${s.follow}</h2>
  <p>${s.followText}</p>
  <div class="social-row">${Object.entries(SOCIAL)
    .filter(([, url]) => url !== '')
    .map(
      ([name, url]) =>
        `<a class="social-pill" href="${esc(url)}" target="_blank" rel="noopener noreferrer me">${icon(name)}<span>${esc(LABELS[name] ?? name)}</span></a>`,
    )
    .join(
      '',
    )}<a class="social-pill" href="${SITE.npm}" target="_blank" rel="noopener noreferrer">${icon('npm')}<span>npm</span></a></div>
</section>
<section class="section narrow">
  <h2 id="contribute">${s.contribute}</h2>
  <p>${s.contributeText}</p>
  <div class="card-grid">${s.ways.map(([title, text]) => `<div class="card"><strong>${title}</strong><span>${text}</span></div>`).join('')}</div>
  <div class="hero-cta">
    <a class="btn btn-primary" href="${SITE.repo}/issues" target="_blank" rel="noopener noreferrer">${icon('github')}${s.open}</a>
    <a class="btn btn-secondary" href="${SITE.repo}/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">${s.guide}</a>
    <a class="btn btn-ghost" href="${h.link('join/')}">${lang === 'en' ? 'Test, hack or build with us' : 'আমাৰ সৈতে পৰীক্ষা, হেক বা নিৰ্মাণ কৰক'}</a>
  </div>
</section>
<section class="section narrow">
  <h2 id="support">${s.support}</h2>
  <p>${s.supportText}</p>
  <div class="hero-cta">
    <a class="btn btn-primary coffee-cta" href="${esc(SUPPORT.coffee)}" target="_blank" rel="noopener noreferrer">${icon('coffee')}${s.coffee}</a>
  </div>
</section>
<section class="section narrow">
  <h2 id="thanks">${s.thanks}</h2>
  <p>${s.thanksText}</p>
  <h2 id="license">${s.license}</h2>
  <p>${s.licenseText}</p>
</section>`;
}

export const COMMUNITY = {
  id: 'community',
  path: 'community/',
  section: 'community',
  layout: 'page',
  title: { en: 'Community', as: 'সমাজ' },
  description: {
    en: 'Meet the team behind Asomiya, follow the project and learn how to contribute.',
    as: 'অসমীয়াৰ পিছৰ দলটোৰ সৈতে চিনাকি হওক, প্ৰকল্পটো অনুসৰণ কৰক আৰু কেনেকৈ অৱদান দিব জানক।',
  },
  body: { en: body('en'), as: body('as') },
};
