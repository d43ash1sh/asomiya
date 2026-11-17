// Home page (layout: "home").
import { SITE } from '../site.config.mjs';
import { teamGrid } from '../lib/team.mjs';
import { icon } from '../lib/icons.mjs';

const S = {
  en: {
    news: 'New: write in English letters',
    title: 'The programming language<br />that speaks Assamese.',
    note: 'Free and open source. Runs in your browser.',
    more: 'Learn more',
    demoTitle: 'Small language.<br />Real programs.',
    demoSub:
      'Variables, conditions, loops and functions, written in Assamese script or in English letters. Every example on this site runs: press Try it.',
    sub: 'Asomiya is a programming language whose keywords, numbers and error messages are in Assamese. No Assamese keyboard? Type <code>dhora</code>, <code>kowa</code> and <code>jodi</code> instead. Learn to program in the language you think in.',
    start: 'Start learning',
    playground: 'Open the playground',
    featuresTitle: 'Small enough to learn in an afternoon',
    featuresSub: 'A friendly language with a real interpreter behind it.',
    features: [
      [
        'Assamese everywhere',
        'Keywords, built-in functions and error messages are Assamese words. Even numbers: <code>১০ + ২০</code> prints <code>৩০</code>.',
      ],
      [
        'Or type in English letters',
        '<code>dhora</code>, <code>kowa</code>, <code>jodi</code>. Several common spellings work for each word, because everyone types Assamese differently.',
      ],
      [
        'Errors that teach',
        'Every error has a code, says what went wrong in Assamese or English, and points at the exact spot. Typos get a “did you mean” hint.',
      ],
      [
        'A real language',
        'Variables, conditions, loops, functions, recursion, closures, lists and input, run by a real lexer, parser and interpreter.',
      ],
      [
        'Runs anywhere',
        'In the browser playground, in your terminal with the CLI and REPL, or inside a JavaScript app as a library.',
      ],
      [
        'Safe to run',
        'Programs can’t touch your files or the network, and endless loops are stopped. Anyone’s code is safe to try.',
      ],
    ],
    twoTitle: 'One language, two ways to write it',
    twoSub:
      'Both tabs hold the same program. Pick the one you like and every example on the site follows your choice.',
    twoPoints: [
      [
        'Assamese script',
        'Write with an Assamese keyboard: <code>ধৰা</code>, <code>কোৱা</code>, <code>যদি</code>. Numbers print as <code>১২৩</code>.',
      ],
      [
        'English letters',
        'Write <code>dhora</code>, <code>kowa</code>, <code>jodi</code> on any keyboard. Numbers print as <code>123</code>.',
      ],
      [
        'Both at once',
        'The two scripts work together in one program, so you can switch whenever you like.',
      ],
    ],
    errorsTitle: 'Mistakes are part of learning',
    errorsSub:
      'When something goes wrong, Asomiya tells you what happened, where, and often how to fix it.',
    errorsLink: 'How to read errors',
    stepsTitle: 'Start in three steps',
    steps: [
      ['Install', 'Install Node.js 20 or newer, then run <code>npm install -g asomiya</code>.'],
      ['Write', 'Save your program in a file ending in <code>.asom</code>.'],
      [
        'Run',
        'Run it with <code>asomiya run hello.asom</code>. Or skip all three and use the playground.',
      ],
    ],
    install: 'Installation guide',
    teamTitle: 'Made in Assam',
    teamSub:
      'Built by a small team and shaped by everyone who speaks Assamese. Suggest a better word, report a bug, or add a feature.',
    star: 'Star on GitHub',
    meet: 'Meet the team',
  },
  as: {
    news: 'নতুন: ইংৰাজী আখৰত লিখক',
    title: 'অসমীয়া কোৱা<br />এটা প্ৰগ্ৰামিং ভাষা।',
    note: 'বিনামূলীয়া আৰু মুক্ত উৎস। ব্ৰাউজাৰতে চলে।',
    more: 'অধিক জানক',
    demoTitle: 'সৰু ভাষা।<br />সঁচা প্ৰগ্ৰাম।',
    demoSub:
      'চলক, চৰ্ত, লুপ আৰু ফাংচন, অসমীয়া লিপি বা ইংৰাজী আখৰত লিখা। এই ছাইটৰ প্ৰতিটো উদাহৰণ চলে: চলাই চাওক টিপক।',
    sub: 'অসমীয়া এটা প্ৰগ্ৰামিং ভাষা, য’ত মূল শব্দ, সংখ্যা আৰু ভুলৰ বাৰ্তা সকলো অসমীয়াত। অসমীয়া কীব’ৰ্ড নাই? <code>dhora</code>, <code>kowa</code>, <code>jodi</code> লিখক। যি ভাষাত ভাবে, সেই ভাষাতে প্ৰগ্ৰামিং শিকক।',
    start: 'শিকিবলৈ আৰম্ভ কৰক',
    playground: 'প্লেগ্ৰাউণ্ড খোলক',
    featuresTitle: 'এটা আবেলিতে শিকিব পৰা সৰু ভাষা',
    featuresSub: 'সহজ ভাষা, যাৰ পিছত আছে এটা সঁচা ইণ্টাৰপ্ৰেটাৰ।',
    features: [
      [
        'সকলোতে অসমীয়া',
        'মূল শব্দ, অন্তৰ্নিৰ্মিত ফাংচন আৰু ভুলৰ বাৰ্তা অসমীয়া শব্দ। সংখ্যাও: <code>১০ + ২০</code>-য়ে <code>৩০</code> দেখুৱায়।',
      ],
      [
        'ইংৰাজী আখৰতো লিখিব পাৰি',
        '<code>dhora</code>, <code>kowa</code>, <code>jodi</code>। প্ৰতিটো শব্দৰ কেইবাটাও প্ৰচলিত বানান চলে, কাৰণ সকলোৱে অসমীয়া বেলেগ বেলেগকৈ লিখে।',
      ],
      [
        'ভুলৰ পৰা শিকিব পাৰি',
        'প্ৰতিটো ভুলৰ এটা ক’ড আছে, অসমীয়া বা ইংৰাজীত কি ভুল হ’ল কয়, আৰু ঠিক ক’ত দেখুৱায়। বানান ভুল হ’লে শুদ্ধ শব্দটোও কয়।',
      ],
      [
        'এটা সঁচা ভাষা',
        'চলক, চৰ্ত, লুপ, ফাংচন, ৰিকাৰ্চন, ক্ল’জাৰ, তালিকা আৰু ইনপুট, যিবোৰ চলায় সঁচা লেক্সাৰ, পাৰ্চাৰ আৰু ইণ্টাৰপ্ৰেটাৰে।',
      ],
      [
        'সকলোতে চলে',
        'ব্ৰাউজাৰৰ প্লেগ্ৰাউণ্ডত, CLI আৰু REPL ৰে টাৰ্মিনেলত, বা লাইব্ৰেৰী হিচাপে JavaScript এপৰ ভিতৰত।',
      ],
      [
        'চলাবলৈ নিৰাপদ',
        'প্ৰগ্ৰামে আপোনাৰ ফাইল বা নেটৱৰ্ক চুব নোৱাৰে, আৰু অন্তহীন লুপ বন্ধ কৰা হয়। যিকোনো ক’ড নিৰাপদে চলাই চাব পাৰি।',
      ],
    ],
    twoTitle: 'এটা ভাষা, লিখাৰ দুটা উপায়',
    twoSub: 'দুয়োটা টেবত একেটা প্ৰগ্ৰাম। যিটো ভাল লাগে বাছি লওক, ছাইটৰ প্ৰতিটো উদাহৰণে সেইটোকে মানিব।',
    twoPoints: [
      [
        'অসমীয়া লিপি',
        'অসমীয়া কীব’ৰ্ডেৰে লিখক: <code>ধৰা</code>, <code>কোৱা</code>, <code>যদি</code>। সংখ্যা <code>১২৩</code> হিচাপে দেখা যায়।',
      ],
      [
        'ইংৰাজী আখৰ',
        'যিকোনো কীব’ৰ্ডত <code>dhora</code>, <code>kowa</code>, <code>jodi</code> লিখক। সংখ্যা <code>123</code> হিচাপে দেখা যায়।',
      ],
      ['একেলগে দুয়োটা', 'একেটা প্ৰগ্ৰামতে দুয়োটা লিপি চলে, যেতিয়া ইচ্ছা সলনি কৰিব পাৰে।'],
    ],
    errorsTitle: 'ভুল কৰাটো শিকাৰে অংশ',
    errorsSub: 'কিবা ভুল হ’লে অসমীয়াই কয় কি হ’ল, ক’ত হ’ল, আৰু প্ৰায়েই কেনেকৈ শুধৰাব।',
    errorsLink: 'ভুলৰ বাৰ্তা কেনেকৈ পঢ়িব',
    stepsTitle: 'তিনিটা খোজত আৰম্ভ কৰক',
    steps: [
      [
        'ইনষ্টল',
        'Node.js ২০ বা নতুন সংস্কৰণ ইনষ্টল কৰক, তাৰ পিছত <code>npm install -g asomiya</code> চলাওক।',
      ],
      ['লিখক', 'প্ৰগ্ৰামটো <code>.asom</code>-ত শেষ হোৱা ফাইলত সাঁচি থওক।'],
      [
        'চলাওক',
        '<code>asomiya run hello.asom</code> দি চলাওক। বা এই তিনিওটা এৰি প্লেগ্ৰাউণ্ড ব্যৱহাৰ কৰক।',
      ],
    ],
    install: 'ইনষ্টল কৰাৰ নিৰ্দেশিকা',
    teamTitle: 'অসমত নিৰ্মিত',
    teamSub:
      'এটা সৰু দলে বনাইছে, আৰু অসমীয়া কোৱা সকলোৱে গঢ় দিছে। এটা ভাল শব্দৰ পৰামৰ্শ দিয়ক, ভুল জনাওক, বা নতুন সুবিধা যোগ কৰক।',
    star: 'GitHub ত ষ্টাৰ দিয়ক',
    meet: 'দলটোৰ সৈতে চিনাকি হওক',
  },
};

const HELLO_AS = `ধৰা ভাষা = "অসমীয়া"
ধৰা বয়স = ২০

কোৱা("নমস্কাৰ, পৃথিৱী!")
কোৱা("এই প্ৰগ্ৰামটোৰ ভাষা: " + ভাষা)

যদি (বয়স >= ১৮) {
    কোৱা("প্ৰাপ্তবয়স্ক")
} নহ'লে {
    কোৱা("অপ্ৰাপ্তবয়স্ক")
}`;

const HELLO_ROMAN = `dhora bhaxa = "Oxomiya"
dhora boyox = 20

kowa("Nomoskar, prithibi!")
kowa("ei programor bhaxa: " + bhaxa)

jodi (boyox >= 18) {
    kowa("praptoboyosko")
} nohole {
    kowa("oprapto-boyosko")
}`;

const LOOP_AS = `// ১ ৰ পৰা ৫ লৈকে বৰ্গ
ধৰা ক = ১
যেতিয়ালৈকে (ক <= ৫) {
    কোৱা(ক, "×", ক, "=", ক * ক)
    ক = ক + ১
}`;

const LOOP_ROMAN = `// squares from 1 to 5
dhora k = 1
jetialoike (k <= 5) {
    kowa(k, "×", k, "=", k * k)
    k = k + 1
}`;

const ASSAMESE_DIGITS = ['১', '২', '৩'];

/** The Assamese alphabet, used for the animated letter field in the hero. */
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
  return (h) => `
<section class="hero">
  ${letterField()}
  <div class="hero-bottom">
    <div class="hero-text">
      <h1 class="hero-title">${s.title}</h1>
      <p class="hero-sub">${s.sub}</p>
    </div>
    <div class="hero-side">
      <p class="hero-note">${s.note}</p>
      <div class="hero-row">
        <p class="install">
          <code>npm install -g asomiya</code>
          <button class="code-btn" type="button" data-copy="npm install -g asomiya" data-copied="${h.t.copied}" aria-label="${h.t.copy}">${icon('copy')}</button>
        </p>
        <a class="btn btn-primary" href="${h.link('learn/')}">${s.start}<span aria-hidden="true">›</span></a>
      </div>
    </div>
  </div>
  <a class="scroll-hint" href="#demo">${s.more}</a>
</section>

<section class="section" id="demo">
  <div class="split">
    <div>
      <h2>${s.demoTitle}</h2>
      <p class="lead">${s.demoSub}</p>
      <div class="actions">
        <a class="btn btn-secondary" href="${h.playground}">${icon('play')}${s.playground}</a>
        <a class="btn btn-ghost" href="${h.link('learn/english-letters/')}">${s.news}</a>
      </div>
    </div>
    <figure class="hero-code">
      <div class="window"><span></span><span></span><span></span><em>hello.asom</em></div>
      ${h.example(HELLO_AS, HELLO_ROMAN)}
    </figure>
  </div>
</section>

<section class="section">
  <header class="section-head">
    <h2>${s.featuresTitle}</h2>
    <p>${s.featuresSub}</p>
  </header>
  <ul class="features">
    ${s.features.map(([title, text]) => `<li><h3>${title}</h3><p>${text}</p></li>`).join('')}
  </ul>
</section>

<section class="band">
  <div class="split">
    <div>
      <h2>${s.twoTitle}</h2>
      <p class="lead">${s.twoSub}</p>
      <dl class="points">
        ${s.twoPoints.map(([title, text]) => `<div><dt>${title}</dt><dd>${text}</dd></div>`).join('')}
      </dl>
    </div>
    <div>${h.example(LOOP_AS, LOOP_ROMAN)}</div>
  </div>
</section>

<section class="section">
  <div class="split split-reverse">
    <div>
      <h2>${s.errorsTitle}</h2>
      <p class="lead">${s.errorsSub}</p>
      <a class="text-link" href="${h.link('learn/errors/')}">${s.errorsLink}</a>
    </div>
    <div>${h.example('কোৱা("নমস্কাৰ")\nকোৱা(নাম)', 'kowa("Nomoskar")\nkowaa("Oxom")', { expectError: true })}</div>
  </div>
</section>

<section class="band">
  <header class="section-head">
    <h2>${s.stepsTitle}</h2>
  </header>
  <ol class="steps">
    ${s.steps.map(([title, text], i) => `<li><span class="step-n" aria-hidden="true">${ASSAMESE_DIGITS[i]}</span><h3>${title}</h3><p>${text}</p></li>`).join('')}
  </ol>
  <p class="center"><a class="text-link" href="${h.link('learn/installation/')}">${s.install}</a></p>
</section>

<section class="section team-band">
  <header class="section-head">
    <h2>${s.teamTitle}</h2>
    <p>${s.teamSub}</p>
  </header>
  ${teamGrid(lang)}
  <div class="actions center">
    <a class="btn btn-primary" href="${SITE.repo}" target="_blank" rel="noopener noreferrer">${icon('github')}${s.star}</a>
    <a class="btn btn-secondary" href="${h.link('community/')}">${s.meet}</a>
  </div>
</section>`;
}

export const HOME = {
  id: 'home',
  path: '',
  section: 'home',
  layout: 'home',
  title: { en: 'A programming language in Assamese', as: 'অসমীয়া ভাষাত এটা প্ৰগ্ৰামিং ভাষা' },
  description: {
    en: 'Asomiya is a programming language in Assamese. Write code in Assamese script or in English letters, run it in your browser or terminal, and learn programming in your own language.',
    as: 'অসমীয়া ভাষাত এটা প্ৰগ্ৰামিং ভাষা। অসমীয়া লিপি বা ইংৰাজী আখৰত ক’ড লিখক, ব্ৰাউজাৰ বা টাৰ্মিনেলত চলাওক, আৰু নিজৰ ভাষাত প্ৰগ্ৰামিং শিকক।',
  },
  body: { en: body('en'), as: body('as') },
};
