// "Join us" page: where the notice-board poster's QR code points. Testers, security researchers,
// contributors and Assamese speakers.
import { SITE } from '../site.config.mjs';
import { esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const ADVISORY = `${SITE.repo}/security/advisories/new`;
const ISSUES = `${SITE.repo}/issues/new`;
const ext = (href, label) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;

const S = {
  en: {
    eyebrow: 'You scanned the poster. Hi.',
    title: 'Come break Asomiya.',
    lead: 'Asomiya is a programming language in Assamese, built by three students from Assam. It works, but it needs people who poke it, break it and make it better. No experience needed for most of this.',
    roles: [
      [
        'The Breaker',
        'Tester',
        'Write small programs, try weird things, tell us what felt wrong.',
        '#test',
      ],
      [
        'The Hacker',
        'Security researcher',
        'Find a way to crash, freeze or escape the interpreter or the playground.',
        '#security',
      ],
      [
        'The Builder',
        'Contributor',
        'Fix bugs, add features, improve the docs or this website.',
        '#contribute',
      ],
      [
        'The Wordsmith',
        'Assamese speaker',
        'Tell us if a keyword or an error message doesn’t sound like real Assamese.',
        '#words',
      ],
    ],
    testTitle: 'Test it (5 minutes)',
    test: [
      `Open the ${'{PG}'} and run the examples. No install needed.`,
      `Follow the ${'{QS}'} and write your own program, in Assamese script or English letters.`,
      `Something confusing, broken or ugly? ${'{ISSUE}'} and tell us what you typed and what happened.`,
    ],
    testAsk:
      'Feedback we especially want: Was anything confusing? Which error message didn’t help? What would you build with it?',
    secTitle: 'Security research',
    secLead:
      'Asomiya runs other people’s code: in the browser playground, in the terminal, and inside apps that use the npm package. We have tried hard to make that safe. Prove us wrong.',
    scopeTitle: 'In scope',
    scope: [
      'The interpreter: escaping the sandbox, reading files or the network, crashing or hanging Node.js',
      'Denial of service from a single program or input (we already fixed one; find the next)',
      'The playground at asomiya.codes: script injection, share-link tricks, getting around the Content Security Policy',
      'Hidden-code tricks (Trojan Source), terminal escape sequences, look-alike names',
      'The asomiya npm package and its CLI',
    ],
    outTitle: 'Please don’t',
    out: [
      'Attack GitHub, npm or other people’s accounts or infrastructure',
      'Flood the website with traffic: test the playground on your own machine instead (`npm run website:serve`)',
      'Make a vulnerability public before we have had a chance to fix it',
    ],
    reportTitle: 'How to report',
    report: `Report privately through ${'{ADV}'} on GitHub. Include the program or steps that trigger it and what you expected. We aim to reply within a week, and we will credit you in the changelog and SECURITY.md unless you prefer to stay anonymous.`,
    contribTitle: 'Contribute code',
    contrib: [
      `Read ${'{CONTRIB}'}: how the project is organised and how to run the tests.`,
      `Pick an issue on ${'{ISSUES}'}, or suggest your own idea first.`,
      'Ideas we would love help with: a for-each loop, more built-in functions (text and lists), syntax highlighting for VS Code, and lessons for school students.',
    ],
    contribNote:
      'The code is TypeScript with more than 330 tests. Every change runs them on Linux, macOS and Windows.',
    wordsTitle: 'Help with the words',
    words: `Some keywords are still provisional, like যেতিয়ালৈকে (while), ফাংচন (function) and ঘূৰাইদিয়া (return). If you know a more natural Assamese word, or a romanised spelling we missed, ${'{ISSUE}'}. The full list is in the ${'{KW}'}.`,
    teamTitle: 'Who to talk to',
    team: 'Debashish Bordoloi, Arnab Sharmah and Siddhartha Borah. Find us on the',
    teamLink: 'Community page',
    cta: 'Start with the playground',
    cta2: 'Read the quick start',
  },
  as: {
    eyebrow: 'আপুনি পোষ্টাৰখন স্কেন কৰিলে। নমস্কাৰ।',
    title: 'আহক, অসমীয়া ভাঙি চাওক।',
    lead: 'অসমীয়া অসমৰ তিনিজন ছাত্ৰই বনোৱা অসমীয়া ভাষাৰ এটা প্ৰগ্ৰামিং ভাষা। ই চলে, কিন্তু ইয়াক খুঁচৰি চোৱা, ভাঙি চোৱা আৰু উন্নত কৰা মানুহৰ প্ৰয়োজন। ইয়াৰ বেছিভাগ কামৰ বাবে অভিজ্ঞতা নালাগে।',
    roles: [
      ['ভঙা মানুহ', 'পৰীক্ষক', 'সৰু প্ৰগ্ৰাম লিখক, অদ্ভুত কিবা চেষ্টা কৰক, কি বেয়া লাগিল জনাওক।', '#test'],
      [
        'হেকাৰ',
        'সুৰক্ষা গৱেষক',
        'ইণ্টাৰপ্ৰেটাৰ বা প্লেগ্ৰাউণ্ড বিকল কৰা, স্থবিৰ কৰা বা তাৰ পৰা ওলাই যোৱাৰ উপায় বিচাৰক।',
        '#security',
      ],
      [
        'নিৰ্মাতা',
        'অৱদানকাৰী',
        'ভুল শুধৰাওক, নতুন সুবিধা যোগ কৰক, নথি বা এই ছাইটটো উন্নত কৰক।',
        '#contribute',
      ],
      [
        'শব্দকাৰ',
        'অসমীয়া ভাষী',
        'কোনো মূল শব্দ বা ভুলৰ বাৰ্তা সঁচা অসমীয়া যেন নালাগিলে জনাওক।',
        '#words',
      ],
    ],
    testTitle: 'পৰীক্ষা কৰক (৫ মিনিট)',
    test: [
      `${'{PG}'} খুলি উদাহৰণবোৰ চলাওক। একো ইনষ্টল কৰিব নালাগে।`,
      `${'{QS}'} অনুসৰণ কৰি নিজৰ প্ৰগ্ৰাম লিখক, অসমীয়া লিপি বা ইংৰাজী আখৰত।`,
      `কিবা বুজিবলৈ টান, বিকল বা বেয়া লাগিল? ${'{ISSUE}'} আৰু কি লিখিলে আৰু কি হ’ল জনাওক।`,
    ],
    testAsk:
      'আমি বিশেষকৈ জানিব বিচাৰোঁ: কিবা বুজিবলৈ টান আছিল নেকি? কোনটো ভুলৰ বাৰ্তাই সহায় নকৰিলে? ইয়াৰে আপুনি কি বনাব বিচাৰিব?',
    secTitle: 'সুৰক্ষা গৱেষণা',
    secLead:
      'অসমীয়াই আনৰ ক’ড চলায়: ব্ৰাউজাৰৰ প্লেগ্ৰাউণ্ডত, টাৰ্মিনেলত, আৰু npm পেকেজ ব্যৱহাৰ কৰা এপত। আমি ইয়াক নিৰাপদ কৰিবলৈ বহুত চেষ্টা কৰিছোঁ। আমি ভুল বুলি প্ৰমাণ কৰক।',
    scopeTitle: 'পৰিসৰৰ ভিতৰত',
    scope: [
      'ইণ্টাৰপ্ৰেটাৰ: চেণ্ডবক্সৰ পৰা ওলাই যোৱা, ফাইল বা নেটৱৰ্ক পঢ়া, Node.js বিকল বা স্থবিৰ কৰা',
      'এটা প্ৰগ্ৰাম বা ইনপুটৰ পৰা সেৱা বন্ধ (DoS) (আমি এটা ইতিমধ্যে শুধৰাইছোঁ; পিছৰটো বিচাৰক)',
      'asomiya.codes ৰ প্লেগ্ৰাউণ্ড: স্ক্ৰিপ্ট সুমুওৱা, শ্বেয়াৰ লিংকৰ কৌশল, Content Security Policy এৰাই চলা',
      'লুকুৱাই থোৱা ক’ডৰ কৌশল (Trojan Source), টাৰ্মিনেলৰ এস্কেপ ছিকুৱেন্স, একে যেন লগা নাম',
      'asomiya npm পেকেজ আৰু ইয়াৰ CLI',
    ],
    outTitle: 'অনুগ্ৰহ কৰি এইবোৰ নকৰিব',
    out: [
      'GitHub, npm বা আনৰ একাউণ্ট আৰু পৰিকাঠামোত আক্ৰমণ',
      'ৱেবছাইটত অতিৰিক্ত ট্ৰেফিক পঠিওৱা: তাৰ সলনি নিজৰ কম্পিউটাৰত প্লেগ্ৰাউণ্ড পৰীক্ষা কৰক (`npm run website:serve`)',
      'আমি শুধৰোৱাৰ আগতেই দুৰ্বলতা ৰাজহুৱা কৰা',
    ],
    reportTitle: 'কেনেকৈ জনাব',
    report: `GitHub ত ${'{ADV}'}-ৰ জৰিয়তে গোপনে জনাওক। কি প্ৰগ্ৰাম বা খোজে সমস্যাটো আনে আৰু আপুনি কি আশা কৰিছিল লিখক। আমি এসপ্তাহৰ ভিতৰত উত্তৰ দিবলৈ চেষ্টা কৰিম, আৰু আপুনি নাম লুকুৱাব নিবিচাৰিলে সলনিৰ তালিকা আৰু SECURITY.md ত আপোনাৰ নাম উল্লেখ কৰিম।`,
    contribTitle: 'ক’ড অৱদান',
    contrib: [
      `${'{CONTRIB}'} পঢ়ক: প্ৰকল্পটো কেনেকৈ সজোৱা আৰু পৰীক্ষা কেনেকৈ চলাব।`,
      `${'{ISSUES}'}-ত এটা ইছ্যু বাছি লওক, বা আগতে নিজৰ ধাৰণা জনাওক।`,
      'য’ত সহায় বিচাৰোঁ: for-each লুপ, অধিক অন্তৰ্নিৰ্মিত ফাংচন (পাঠ আৰু তালিকা), VS Code ৰ বাবে ছিনটেক্স হাইলাইট, আৰু স্কুলৰ ছাত্ৰ-ছাত্ৰীৰ বাবে পাঠ।',
    ],
    contribNote:
      'ক’ডটো TypeScript ত, ৩৩০টাতকৈ অধিক পৰীক্ষাৰ সৈতে। প্ৰতিটো সলনিয়ে Linux, macOS আৰু Windows ত সেইবোৰ চলায়।',
    wordsTitle: 'শব্দৰ বাবে সহায়',
    words: `কিছুমান মূল শব্দ এতিয়াও অস্থায়ী, যেনে যেতিয়ালৈকে, ফাংচন আৰু ঘূৰাইদিয়া। অধিক স্বাভাৱিক অসমীয়া শব্দ বা আমি এৰি দিয়া ইংৰাজী বানান জানিলে ${'{ISSUE}'}। সম্পূৰ্ণ তালিকা ${'{KW}'}-ত আছে।`,
    teamTitle: 'কাৰ সৈতে কথা পাতিব',
    team: 'দেবাশীষ বৰদলৈ, অৰ্ণৱ শৰ্মা আৰু সিদ্ধাৰ্থ বৰা। আমাক বিচাৰি পাব',
    teamLink: 'সমাজ পৃষ্ঠাত',
    cta: 'প্লেগ্ৰাউণ্ডৰ পৰা আৰম্ভ কৰক',
    cta2: 'দ্ৰুত আৰম্ভণি পঢ়ক',
  },
};

function body(lang) {
  const s = S[lang];
  const fill = (text, h) =>
    esc(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(
        '{PG}',
        `<a href="${h.playground}">${lang === 'en' ? 'playground' : 'প্লেগ্ৰাউণ্ড'}</a>`,
      )
      .replace(
        '{QS}',
        `<a href="${h.link('learn/')}">${lang === 'en' ? 'quick start' : 'দ্ৰুত আৰম্ভণি'}</a>`,
      )
      .replace('{ISSUE}', ext(ISSUES, lang === 'en' ? 'Open an issue' : 'এটা ইছ্যু খোলক'))
      .replace('{ISSUES}', ext(`${SITE.repo}/issues`, 'GitHub'))
      .replace(
        '{ADV}',
        ext(ADVISORY, lang === 'en' ? 'private vulnerability reporting' : 'গোপন দুৰ্বলতা প্ৰতিবেদন'),
      )
      .replace('{CONTRIB}', ext(`${SITE.repo}/blob/main/CONTRIBUTING.md`, 'CONTRIBUTING.md'))
      .replace(
        '{KW}',
        `<a href="${h.link('reference/keywords/')}">${lang === 'en' ? 'keyword reference' : 'মূল শব্দৰ সন্দৰ্ভ'}</a>`,
      );
  const list = (items, h) =>
    `<ul class="join-list">${items.map((i) => `<li>${fill(i, h)}</li>`).join('')}</ul>`;
  return (h) => `
<section class="page-hero join-hero">
  <p class="eyebrow">${esc(s.eyebrow)}</p>
  <h1>${esc(s.title)}</h1>
  <p>${esc(s.lead)}</p>
</section>

<section class="section narrow">
  <ul class="roles">${s.roles
    .map(
      ([name, role, text, href]) =>
        `<li><a href="${href}"><span class="team-role">${esc(role)}</span><h3>${esc(name)}</h3><p>${esc(text)}</p></a></li>`,
    )
    .join('')}</ul>
</section>

<section class="section narrow" id="test">
  <h2>${esc(s.testTitle)}</h2>
  <ol class="join-list">${s.test.map((i) => `<li>${fill(i, h)}</li>`).join('')}</ol>
  <p class="muted">${esc(s.testAsk)}</p>
</section>

<section class="section narrow" id="security">
  <h2>${esc(s.secTitle)}</h2>
  <p>${esc(s.secLead)}</p>
  <h3>${esc(s.scopeTitle)}</h3>
  ${list(s.scope, h)}
  <h3>${esc(s.outTitle)}</h3>
  ${list(s.out, h)}
  <h3>${esc(s.reportTitle)}</h3>
  <p>${fill(s.report, h)}</p>
  <div class="actions"><a class="btn btn-primary" href="${ADVISORY}" target="_blank" rel="noopener noreferrer">${icon('github')}${lang === 'en' ? 'Report a vulnerability' : 'দুৰ্বলতা জনাওক'}</a></div>
</section>

<section class="section narrow" id="contribute">
  <h2>${esc(s.contribTitle)}</h2>
  ${list(s.contrib, h)}
  <p class="muted">${esc(s.contribNote)}</p>
</section>

<section class="section narrow" id="words">
  <h2>${esc(s.wordsTitle)}</h2>
  <p>${fill(s.words, h)}</p>
</section>

<section class="section narrow">
  <h2>${esc(s.teamTitle)}</h2>
  <p>${esc(s.team)} <a href="${h.link('community/')}">${esc(s.teamLink)}</a>.</p>
  <div class="actions">
    <a class="btn btn-primary" href="${h.playground}">${icon('play')}${esc(s.cta)}</a>
    <a class="btn btn-secondary" href="${h.link('learn/')}">${esc(s.cta2)}</a>
  </div>
</section>`;
}

export const JOIN = {
  id: 'join',
  path: 'join/',
  section: 'community',
  layout: 'page',
  title: { en: 'Join us: test, hack, build', as: 'যোগ দিয়ক: পৰীক্ষা, হেক, নিৰ্মাণ' },
  description: {
    en: 'Help Asomiya, the programming language in Assamese: test it, try to break it as a security researcher, contribute code, or improve the Assamese words.',
    as: 'অসমীয়া প্ৰগ্ৰামিং ভাষাক সহায় কৰক: পৰীক্ষা কৰক, সুৰক্ষা গৱেষক হিচাপে ভাঙিবলৈ চেষ্টা কৰক, ক’ড অৱদান দিয়ক, বা অসমীয়া শব্দ উন্নত কৰক।',
  },
  body: { en: body('en'), as: body('as') },
};
