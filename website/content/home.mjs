// Home page (layout: "home"): one plain column, written by Debashish in the first person.
import { EXTENSION, SITE, TEAM } from '../site.config.mjs';
import { esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const S = {
  en: {
    heroTitle: 'The programming language<br />that speaks Assamese.',
    heroSub:
      'Asomiya is a programming language whose keywords, numbers and error messages are in Assamese. No Assamese keyboard? Type <code>dhora</code>, <code>kowa</code> and <code>jodi</code> instead. Learn to program in the language you think in.',
    heroNote: 'Free and open source. Runs in your browser.',
    start: 'Start learning',
    more: 'Learn more',
    tagline: 'A programming language in Assamese.',
    intro: `Hi, I’m Debashish Bordoloi. With Arnab Sharmah and Siddhartha Borah, I’m building Asomiya: a small programming language where the keywords, the numbers and the error messages are Assamese. You can write it in Assamese script, or in English letters if you don’t have an Assamese keyboard.`,
    tryIt: 'Try it in your browser',
    learn: 'Learn the language',
    install: 'Install',
    todayTitle: 'What works today',
    today: [
      `Variables, conditions, loops, functions and lists. The <a href="{learn}">tutorial</a> goes through them one by one.`,
      `Run programs in the <a href="{pg}">playground</a>, in your terminal (<code>npm install -g asomiya</code>), or in VS Code with the <a href="{ext}">Asomiya extension</a>.`,
      `Error messages in Assamese or in English. Each one has a code, so you can <a href="{errors}">look it up</a>.`,
      `Show in Python: see any program as Python, so the next language is easier.`,
    ],
    shot: 'Asomiya in VS Code: the program, its output in the Asomiya panel, and the help that appears when you point at a word.',
    whyTitle: 'Why Assamese?',
    why: `Programming languages almost always borrow English words. Nothing about running code needs that. Variables can be called <code>বয়স</code>, a loop can start with <code>যেতিয়ালৈকে</code>, and <code>১০ + ২০</code> prints <code>৩০</code>. I want Assamese speakers to be able to learn the ideas of programming first, in the language they already think in, and pick up English keywords later.`,
    helpTitle: 'Help me make it better',
    help: `Asomiya is young and open source. If something is confusing, a word sounds wrong in Assamese, or you find a bug, please tell us: open an issue on <a href="{gh}">GitHub</a> or message me on <a href="{li}">LinkedIn</a>. Students and teachers who want to test it can start on the <a href="{join}">Join page</a>.`,
    teamTitle: 'Who’s building it',
  },
  as: {
    heroTitle: 'অসমীয়া কোৱা<br />এটা প্ৰগ্ৰামিং ভাষা।',
    heroSub:
      'অসমীয়া এটা প্ৰগ্ৰামিং ভাষা, য’ত মূল শব্দ, সংখ্যা আৰু ভুলৰ বাৰ্তা সকলো অসমীয়াত। অসমীয়া কীব’ৰ্ড নাই? <code>dhora</code>, <code>kowa</code>, <code>jodi</code> লিখক। যি ভাষাত ভাবে, সেই ভাষাতে প্ৰগ্ৰামিং শিকক।',
    heroNote: 'বিনামূলীয়া আৰু মুক্ত উৎস। ব্ৰাউজাৰতে চলে।',
    start: 'শিকিবলৈ আৰম্ভ কৰক',
    more: 'অধিক জানক',
    tagline: 'অসমীয়া ভাষাত এটা প্ৰগ্ৰামিং ভাষা।',
    intro: `নমস্কাৰ, মই দেবাশীষ বৰদলৈ। অৰ্ণৱ শৰ্মা আৰু সিদ্ধাৰ্থ বৰাৰ সৈতে মই অসমীয়া নামৰ এটা সৰু প্ৰগ্ৰামিং ভাষা বনাই আছোঁ, য’ত মূল শব্দ, সংখ্যা আৰু ভুলৰ বাৰ্তা সকলো অসমীয়াত। ইয়াক অসমীয়া লিপিত লিখিব পাৰি, আৰু অসমীয়া কীব’ৰ্ড নাথাকিলে ইংৰাজী আখৰতো লিখিব পাৰি।`,
    tryIt: 'ব্ৰাউজাৰতে চলাই চাওক',
    learn: 'ভাষাটো শিকক',
    install: 'ইনষ্টল',
    todayTitle: 'এতিয়া কি কি কৰিব পাৰি',
    today: [
      `চলক, চৰ্ত, লুপ, ফাংচন আৰু তালিকা। <a href="{learn}">পাঠবোৰত</a> এটা এটাকৈ শিকোৱা হৈছে।`,
      `<a href="{pg}">প্লেগ্ৰাউণ্ডত</a>, টাৰ্মিনেলত (<code>npm install -g asomiya</code>), বা <a href="{ext}">অসমীয়া এক্সটেনশ্যনেৰে</a> VS Code ত প্ৰগ্ৰাম চলাওক।`,
      `ভুলৰ বাৰ্তা অসমীয়া বা ইংৰাজীত। প্ৰতিটোৰে এটা ক’ড আছে, গতিকে <a href="{errors}">বিচাৰি চাব</a> পাৰি।`,
      `Python ত দেখুওৱা: যিকোনো প্ৰগ্ৰাম Python ত কেনেকুৱা হয় চাওক, যাতে পিছৰ ভাষাটো সহজ হয়।`,
    ],
    shot: 'VS Code ত অসমীয়া: প্ৰগ্ৰাম, অসমীয়া পেনেলত ইয়াৰ ফলাফল, আৰু কোনো শব্দৰ ওপৰত মাউছ ৰাখিলে ওলোৱা সহায়।',
    whyTitle: 'কিয় অসমীয়াত?',
    why: `প্ৰগ্ৰামিং ভাষাবোৰে প্ৰায় সদায় ইংৰাজী শব্দ ধাৰ কৰে, যদিও ক’ড চলাবলৈ তাৰ কোনো প্ৰয়োজন নাই। চলকৰ নাম <code>বয়স</code> হ’ব পাৰে, লুপ <code>যেতিয়ালৈকে</code> ৰে আৰম্ভ হ’ব পাৰে, আৰু <code>১০ + ২০</code> য়ে <code>৩০</code> ছপা কৰে। মই বিচাৰোঁ অসমীয়া মানুহে প্ৰথমে নিজে ভবা ভাষাতে প্ৰগ্ৰামিঙৰ ধাৰণাবোৰ শিকক, আৰু ইংৰাজী শব্দবোৰ পিছত শিকক।`,
    helpTitle: 'উন্নত কৰাত সহায় কৰক',
    help: `অসমীয়া এতিয়াও নতুন আৰু মুক্ত উৎস। কিবা বুজাত অসুবিধা হ’লে, কোনো শব্দ অসমীয়াত অস্বাভাৱিক লাগিলে, বা ভুল পালে আমাক জনাওক: <a href="{gh}">GitHub</a> ত ইছ্যু খোলক বা <a href="{li}">LinkedIn</a> ত মোক বাৰ্তা দিয়ক। পৰীক্ষা কৰিব বিচৰা ছাত্ৰ-ছাত্ৰী আৰু শিক্ষকসকলে <a href="{join}">যোগ দিয়ক পৃষ্ঠাৰ</a> পৰা আৰম্ভ কৰিব পাৰে।`,
    teamTitle: 'কোনে বনাইছে',
  },
};

const HELLO_AS = `ধৰা নাম = সোধা("আপোনাৰ নাম কি? ")
কোৱা("নমস্কাৰ, " + নাম + "!")

ধৰা ক = ১
যেতিয়ালৈকে (ক <= ৩) {
    কোৱা(ক, "বাৰ নমস্কাৰ")
    ক = ক + ১
}`;

const HELLO_ROMAN = `dhora naam = xudha("Apunar naam ki? ")
kowa("Nomoskar, " + naam + "!")

dhora k = 1
jetialoike (k <= 3) {
    kowa(k, "bar nomoskar")
    k = k + 1
}`;

/** The Assamese alphabet, for the animated letter field in the hero. */
const ALPHABET = [...'অআইঈউঊঋএঐওঔকখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযৰলৱশষসহ', 'ক্ষ', 'ড়', 'ঢ়', 'য়'];
const COLS = 16;
const ROWS = 7;

/**
 * A grid of Assamese letters that light up in slow diagonal waves (CSS only: each letter gets a
 * delay class from its diagonal, because inline styles are blocked by the Content Security Policy).
 * অ আ ক খ, the letters of the logo, glow gold.
 */
function letterField() {
  const cells = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const letter = ALPHABET[(r * 7 + c * 3) % ALPHABET.length];
      const gold = ['অ', 'আ', 'ক', 'খ'].includes(letter) ? ' g' : '';
      cells.push(`<span class="d${(r + c) % 12}${gold}">${letter}</span>`);
    }
  }
  return `<div class="letter-field" aria-hidden="true" lang="as">${cells.join('')}</div>`;
}

function body(lang) {
  const s = S[lang];
  return (h) => {
    const links = {
      '{learn}': h.link('learn/'),
      '{pg}': h.playground,
      '{ext}': h.link('extension/'),
      '{errors}': h.link('reference/errors/'),
      '{gh}': SITE.repo,
      '{li}': 'https://www.linkedin.com/in/debashishbordoloi',
      '{join}': h.link('join/'),
    };
    const fill = (text) =>
      text
        .replace(/\{[a-z]+\}/g, (key) => esc(links[key] ?? key))
        .replace(
          /<a href="(https?:[^"]+)">/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">',
        );
    return `
<section class="hero">
  ${letterField()}
  <div class="hero-bottom">
    <div class="hero-text">
      <h1 class="hero-title">${s.heroTitle}</h1>
      <p class="hero-sub">${s.heroSub}</p>
    </div>
    <div class="hero-side">
      <p class="hero-note">${esc(s.heroNote)}</p>
      <div class="hero-row">
        <p class="install">
          <code>npm install -g asomiya</code>
          <button class="code-btn" type="button" data-copy="npm install -g asomiya" data-copied="${h.t.copied}" aria-label="${h.t.copy}">${icon('copy')}</button>
        </p>
        <a class="btn btn-primary" href="${h.link('learn/')}">${esc(s.start)}<span aria-hidden="true">›</span></a>
      </div>
    </div>
  </div>
  <a class="scroll-hint" href="#intro">${esc(s.more)}</a>
</section>

<article class="home" id="intro">
  <p class="home-lead">${esc(s.intro)}</p>

  ${h.example(HELLO_AS, HELLO_ROMAN, { stdin: lang === 'as' ? 'অনন্যা' : 'Ananya' })}

  <p class="home-actions">
    <a class="btn btn-primary" href="${h.playground}">${esc(s.tryIt)}</a>
    <a class="btn btn-secondary" href="${h.link('learn/')}">${esc(s.learn)}</a>
    <a class="btn btn-secondary" href="${h.link('learn/installation/')}">${esc(s.install)}</a>
  </p>

  <h2 id="today">${esc(s.todayTitle)}</h2>
  <ul class="home-list">${s.today.map((t) => `<li>${fill(t)}</li>`).join('')}</ul>

  <figure class="home-figure">
    <img src="${h.asset('assets/screens/vscode-hover-dark.png')}" width="2880" height="1800" alt="${esc(s.shot)}" loading="lazy">
    <figcaption>${esc(s.shot)}</figcaption>
  </figure>

  <h2 id="why">${esc(s.whyTitle)}</h2>
  <p>${s.why}</p>

  <h2 id="help">${esc(s.helpTitle)}</h2>
  <p>${fill(s.help)}</p>

  <h2 id="team">${esc(s.teamTitle)}</h2>
  <ul class="home-team">${TEAM.map(
    (m) =>
      `<li><strong>${esc(m.name[lang])}</strong>, ${esc(m.role[lang].toLowerCase())}${Object.entries(
        m.links,
      )
        .filter(([, url]) => url)
        .map(
          ([kind, url]) =>
            ` · <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${kind === 'linkedin' ? 'LinkedIn' : 'GitHub'}</a>`,
        )
        .join('')}</li>`,
  ).join('')}</ul>
  <p class="home-small"><a href="${EXTENSION.marketplace || h.link('extension/')}"${EXTENSION.marketplace ? ' target="_blank" rel="noopener noreferrer"' : ''}>VS Code</a> · <a href="${SITE.npm}" target="_blank" rel="noopener noreferrer">npm</a> · <a href="${SITE.repo}" target="_blank" rel="noopener noreferrer">GitHub</a> · v${esc(SITE.version)}</p>
</article>`;
  };
}

export const HOME = {
  id: 'home',
  path: '',
  section: 'home',
  layout: 'home',
  title: { en: 'A programming language in Assamese', as: 'অসমীয়া ভাষাত এটা প্ৰগ্ৰামিং ভাষা' },
  description: {
    en: 'Asomiya is a small programming language in Assamese. Write code in Assamese script or in English letters, and run it in your browser, your terminal or VS Code.',
    as: 'অসমীয়া ভাষাত এটা সৰু প্ৰগ্ৰামিং ভাষা। অসমীয়া লিপি বা ইংৰাজী আখৰত ক’ড লিখক, আৰু ব্ৰাউজাৰ, টাৰ্মিনেল বা VS Code ত চলাওক।',
  },
  body: { en: body('en'), as: body('as') },
};
