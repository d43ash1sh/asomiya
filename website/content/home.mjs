// Home page (layout: "home").
import { SITE, TEAM } from '../site.config.mjs';
import { icon } from '../lib/icons.mjs';

const S = {
  en: {
    pill: 'New in 0.2: write it in English letters',
    title: 'Code in <span class="grad">অসমীয়া</span>.',
    sub: 'Asomiya is a programming language where the keywords, numbers and error messages are in Assamese. Prefer English letters? Type <code>dhora</code>, <code>kowa</code> and <code>jodi</code> instead. Learn to code in the language you think in.',
    start: 'Get started',
    playground: 'Open the playground',
    stats: [
      ['2', 'scripts: অসমীয়া and English letters'],
      ['14', 'keywords, all in Assamese'],
      ['330+', 'automated tests'],
      ['MIT', 'free and open source'],
    ],
    featuresTitle: 'Everything you need to start programming',
    featuresSub: 'A small, friendly language with a real interpreter behind it.',
    features: [
      [
        'অ',
        'Assamese everywhere',
        'Keywords, built-in functions, error messages and even numbers: <code>১০ + ২০</code> prints <code>৩০</code>.',
      ],
      [
        'Aa',
        'Or type in English letters',
        '<code>dhora</code>, <code>kowa</code>, <code>jodi</code> … Several common spellings work, because everyone types Assamese differently.',
      ],
      [
        '?!',
        'Errors that teach',
        'Every error has a code, a clear message in Assamese or English, and points at the exact spot. Typos get a “did you mean” hint.',
      ],
      [
        '{ }',
        'A real language',
        'Variables, conditions, loops, functions, recursion, closures, lists and input. Not a translator: a real lexer, parser and interpreter.',
      ],
      [
        '▶',
        'Runs everywhere',
        'In your browser with the playground, in the terminal with the CLI and REPL, or inside your JavaScript app as a library.',
      ],
      [
        '🛡',
        'Safe by design',
        'Programs can’t touch your files or the network. Infinite loops and deep recursion are stopped, so anyone’s code is safe to run.',
      ],
    ],
    twoTitle: 'One language, two ways to write it',
    twoSub:
      'Both tabs below are the same program. Pick the one you like. The whole site remembers your choice.',
    twoPoints: [
      [
        'Assamese script',
        'Write with an Assamese keyboard: <code>ধৰা</code>, <code>কোৱা</code>, <code>যদি</code>. Numbers print as <code>১২৩</code>.',
      ],
      [
        'English letters',
        'No Assamese keyboard? Write <code>dhora</code>, <code>kowa</code>, <code>jodi</code>. Numbers print as <code>123</code>.',
      ],
      ['Mix them', 'Both scripts work in the same program, so you can switch whenever you like.'],
    ],
    errorsTitle: 'Mistakes are part of learning',
    errorsSub:
      'When something goes wrong, Asomiya tells you what happened, where it happened, and often how to fix it, in plain Assamese or English.',
    errorsLink: 'Read about errors',
    stepsTitle: 'Start in three steps',
    steps: [
      ['Install', 'Install Node.js 20 or newer, then the <code>asomiya</code> command.'],
      ['Write', 'Save your program in a file that ends with <code>.asom</code>.'],
      ['Run', 'Run it with <code>asomiya run</code>, or skip all of this and use the playground.'],
    ],
    communityTitle: 'Built in Assam, open to everyone',
    communitySub:
      'Asomiya is made by a small team and shaped by everyone who speaks Assamese. Suggest a better word, report a bug, or add a feature.',
    star: 'Star on GitHub',
    meet: 'Meet the team',
  },
  as: {
    pill: '০.২ ত নতুন: ইংৰাজী আখৰত লিখক',
    title: '<span class="grad">অসমীয়া</span> ভাষাত ক’ড লিখক।',
    sub: 'অসমীয়া এটা প্ৰগ্ৰামিং ভাষা, য’ত মূল শব্দ, সংখ্যা আৰু ভুলৰ বাৰ্তা সকলো অসমীয়াত। ইংৰাজী আখৰত লিখিবলৈ সহজ পায় নেকি? <code>dhora</code>, <code>kowa</code>, <code>jodi</code> লিখক। যি ভাষাত ভাবে, সেই ভাষাতে প্ৰগ্ৰামিং শিকক।',
    start: 'আৰম্ভ কৰক',
    playground: 'প্লেগ্ৰাউণ্ড খোলক',
    stats: [
      ['২', 'লিপি: অসমীয়া আৰু ইংৰাজী আখৰ'],
      ['১৪', 'মূল শব্দ, সকলো অসমীয়াত'],
      ['৩৩০+', 'স্বয়ংক্ৰিয় পৰীক্ষা'],
      ['MIT', 'বিনামূলীয়া আৰু মুক্ত উৎস'],
    ],
    featuresTitle: 'প্ৰগ্ৰামিং আৰম্ভ কৰিবলৈ যি লাগে সকলো',
    featuresSub: 'সৰু, সহজ এটা ভাষা, যাৰ পিছত আছে এটা সঁচা ইণ্টাৰপ্ৰেটাৰ।',
    features: [
      [
        'অ',
        'সকলোতে অসমীয়া',
        'মূল শব্দ, অন্তৰ্নিৰ্মিত ফাংচন, ভুলৰ বাৰ্তা, আনকি সংখ্যাও: <code>১০ + ২০</code> য়ে <code>৩০</code> দেখুৱায়।',
      ],
      [
        'Aa',
        'ইংৰাজী আখৰতো লিখিব পাৰি',
        '<code>dhora</code>, <code>kowa</code>, <code>jodi</code> … প্ৰতিটো শব্দৰ কেইবাটাও প্ৰচলিত বানান চলে, কাৰণ সকলোৱে অসমীয়া বেলেগ বেলেগকৈ লিখে।',
      ],
      [
        '?!',
        'ভুলৰ পৰা শিকিব পাৰি',
        'প্ৰতিটো ভুলৰ এটা ক’ড আছে, অসমীয়া বা ইংৰাজীত স্পষ্ট বাৰ্তা আছে, আৰু ঠিক ক’ত ভুল হৈছে দেখুৱায়। বানান ভুল হ’লে শুদ্ধ শব্দটোও কয়।',
      ],
      [
        '{ }',
        'এটা সঁচা ভাষা',
        'চলক, চৰ্ত, লুপ, ফাংচন, ৰিকাৰ্চন, ক্ল’জাৰ, তালিকা আৰু ইনপুট। অনুবাদক নহয়: সঁচা লেক্সাৰ, পাৰ্চাৰ আৰু ইণ্টাৰপ্ৰেটাৰ।',
      ],
      [
        '▶',
        'সকলোতে চলে',
        'প্লেগ্ৰাউণ্ডৰ জৰিয়তে ব্ৰাউজাৰত, CLI আৰু REPL ৰ জৰিয়তে টাৰ্মিনেলত, বা লাইব্ৰেৰী হিচাপে আপোনাৰ JavaScript এপত।',
      ],
      [
        '🛡',
        'সুৰক্ষিত',
        'প্ৰগ্ৰামে আপোনাৰ ফাইল বা নেটৱৰ্ক চুব নোৱাৰে। অন্তহীন লুপ আৰু গভীৰ ৰিকাৰ্চন বন্ধ কৰা হয়, সেয়েহে যিকোনো ক’ড চলোৱাটো নিৰাপদ।',
      ],
    ],
    twoTitle: 'এটা ভাষা, লিখাৰ দুটা উপায়',
    twoSub:
      'তলৰ দুয়োটা টেবত একেটা প্ৰগ্ৰাম। যিটো ভাল লাগে বাছি লওক। গোটেই ছাইটটোৱে আপোনাৰ বাছনি মনত ৰাখিব।',
    twoPoints: [
      [
        'অসমীয়া লিপি',
        'অসমীয়া কীব’ৰ্ডেৰে লিখক: <code>ধৰা</code>, <code>কোৱা</code>, <code>যদি</code>। সংখ্যা <code>১২৩</code> হিচাপে দেখা যায়।',
      ],
      [
        'ইংৰাজী আখৰ',
        'অসমীয়া কীব’ৰ্ড নাই? <code>dhora</code>, <code>kowa</code>, <code>jodi</code> লিখক। সংখ্যা <code>123</code> হিচাপে দেখা যায়।',
      ],
      ['মিহলাই লিখক', 'একেটা প্ৰগ্ৰামতে দুয়োটা লিপি চলে, যেতিয়া ইচ্ছা সলনি কৰিব পাৰে।'],
    ],
    errorsTitle: 'ভুল কৰাটো শিকাৰে অংশ',
    errorsSub:
      'কিবা ভুল হ’লে অসমীয়াই কয় কি হ’ল, ক’ত হ’ল, আৰু প্ৰায়েই কেনেকৈ শুধৰাব, সহজ অসমীয়া বা ইংৰাজীত।',
    errorsLink: 'ভুলৰ বিষয়ে পঢ়ক',
    stepsTitle: 'তিনিটা খোজত আৰম্ভ কৰক',
    steps: [
      ['ইনষ্টল', 'Node.js ২০ বা নতুন সংস্কৰণ ইনষ্টল কৰক, তাৰ পিছত <code>asomiya</code> কমাণ্ডটো।'],
      ['লিখক', 'প্ৰগ্ৰামটো <code>.asom</code> ত শেষ হোৱা এটা ফাইলত সাঁচি থওক।'],
      ['চলাওক', '<code>asomiya run</code> ৰে চলাওক, বা এইবোৰ একো নকৰি প্লেগ্ৰাউণ্ড ব্যৱহাৰ কৰক।'],
    ],
    communityTitle: 'অসমত নিৰ্মিত, সকলোৰে বাবে মুকলি',
    communitySub:
      'অসমীয়া এটা সৰু দলে বনাইছে, আৰু অসমীয়া কোৱা সকলোৱে ইয়াক গঢ় দিছে। এটা ভাল শব্দৰ পৰামৰ্শ দিয়ক, ভুল জনাওক, বা নতুন সুবিধা যোগ কৰক।',
    star: 'GitHub ত ষ্টাৰ দিয়ক',
    meet: 'দলটোৰ সৈতে চিনাকি হওক',
  },
};

const HELLO_AS = `ধৰা নাম = "দেবাশীষ"
ধৰা বয়স = ২৪

কোৱা("নমস্কাৰ, " + নাম)

যদি (বয়স >= ১৮) {
    কোৱা("মই এজন প্ৰাপ্তবয়স্ক")
} নহ'লে {
    কোৱা("মই এতিয়াও সৰু")
}`;

const HELLO_ROMAN = `dhora naam = "Debashish"
dhora boyox = 24

kowa("Nomoskar, " + naam)

jodi (boyox >= 18) {
    kowa("moi dangor")
} nohole {
    kowa("moi xoru")
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

function body(lang) {
  const s = S[lang];
  return (h) => `
<section class="hero">
  <div class="hero-inner">
    <div class="hero-text">
      <a class="pill" href="${h.link('learn/english-letters/')}"><span class="pill-dot"></span>${s.pill}${icon('arrow')}</a>
      <h1 class="hero-title">${s.title}</h1>
      <p class="hero-sub">${s.sub}</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="${h.link('learn/')}">${s.start}${icon('arrow')}</a>
        <a class="btn btn-secondary" href="${h.playground}">${icon('play')}${s.playground}</a>
      </div>
      <div class="install">
        <code><span class="prompt">$</span> npm install -g asomiya</code>
        <button class="code-btn" type="button" data-copy="npm install -g asomiya" data-copied="${h.t.copied}" aria-label="${h.t.copy}">${icon('copy')}</button>
      </div>
    </div>
    <div class="hero-code">
      <div class="window"><span></span><span></span><span></span><em>hello.asom</em></div>
      ${h.example(HELLO_AS, HELLO_ROMAN)}
    </div>
  </div>
</section>

<section class="stats">
  ${s.stats.map(([n, label]) => `<div><strong>${n}</strong><span>${label}</span></div>`).join('')}
</section>

<section class="section">
  <div class="section-head">
    <h2>${s.featuresTitle}</h2>
    <p>${s.featuresSub}</p>
  </div>
  <div class="features">
    ${s.features
      .map(
        ([glyph, title, text]) =>
          `<div class="feature"><span class="feature-icon" aria-hidden="true">${glyph}</span><h3>${title}</h3><p>${text}</p></div>`,
      )
      .join('')}
  </div>
</section>

<section class="section section-alt">
  <div class="split">
    <div>
      <h2>${s.twoTitle}</h2>
      <p class="section-lead">${s.twoSub}</p>
      <ul class="checklist">
        ${s.twoPoints.map(([title, text]) => `<li>${icon('check')}<div><strong>${title}</strong><p>${text}</p></div></li>`).join('')}
      </ul>
    </div>
    <div>${h.example(LOOP_AS, LOOP_ROMAN)}</div>
  </div>
</section>

<section class="section">
  <div class="split split-reverse">
    <div>
      <h2>${s.errorsTitle}</h2>
      <p class="section-lead">${s.errorsSub}</p>
      <a class="text-link" href="${h.link('learn/errors/')}">${s.errorsLink}${icon('arrow')}</a>
    </div>
    <div>${h.example('কোৱা("নমস্কাৰ")\nকোৱা(নাম)', 'kowa("Nomoskar")\nkowaa("Oxom")', { expectError: true })}</div>
  </div>
</section>

<section class="section section-alt">
  <div class="section-head"><h2>${s.stepsTitle}</h2></div>
  <ol class="steps">
    ${s.steps.map(([title, text], i) => `<li><span class="step-n">${lang === 'as' ? '১২৩'[i] : i + 1}</span><h3>${title}</h3><p>${text}</p></li>`).join('')}
  </ol>
  <div class="steps-cta">
    <a class="btn btn-primary" href="${h.link('learn/installation/')}">${s.start}${icon('arrow')}</a>
  </div>
</section>

<section class="section community-band">
  <div class="section-head">
    <h2>${s.communityTitle}</h2>
    <p>${s.communitySub}</p>
  </div>
  <div class="avatars">
    ${TEAM.map((m) => `<div class="avatar-card"><span class="avatar" aria-hidden="true">${m.initials}</span><strong>${m.name[lang]}</strong><span>${m.role[lang]}</span></div>`).join('')}
  </div>
  <div class="hero-cta center">
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
