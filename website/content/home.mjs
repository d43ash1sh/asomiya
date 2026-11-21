// Home page (layout: "home"): a product landing page. Hero, a program running over a pixel-art tea
// garden, numbered feature sections with live-looking windows, the four steps, the pipeline, where it
// runs, and the team. Every code sample and output here comes from the real interpreter at build time.
import { formatDiagnostic, parse, runSource, toPython } from '../../dist/index.js';
import { EXTENSION, SITE, TEAM } from '../site.config.mjs';
import { highlight } from '../lib/highlight.mjs';
import { esc, shareHash } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

// ── the programs shown on the page ──────────────────────────────────────

const HELLO = `ধৰা ঠাই = "অসম"
কোৱা("নমস্কাৰ, " + ঠাই + "!")

ধৰা ক = 1
যেতিয়ালৈকে (ক <= 3) {
    কোৱা(ক, "বাৰ নমস্কাৰ")
    ক = ক + 1
}`;

const TYPO = `ধৰা ঠাই = "অসম"
কোৱা(ঠই)`;

const PRICE = `ধৰা দাম = 120
ধৰা সংখ্যা = 3
কোৱা("মুঠ:", দাম * সংখ্যা)`;

/** Runs a program with the real interpreter; the build stops if a sample that should work fails. */
function run(source, stdin = []) {
  const lines = [...stdin];
  const result = runSource(source, { readLine: () => lines.shift() ?? null, digits: 'ascii' });
  if (result.error !== null) throw new Error(`Home page sample failed:\n${source}`);
  return result.output;
}

function errorOf(source, lang) {
  const result = runSource(source, { digits: 'ascii' });
  if (result.error === null) throw new Error('Home page error sample ran without an error');
  return formatDiagnostic(result.error.diagnostic, { lang, source, fileName: 'hello.asom' });
}

/** The learner's part of the Python version (the helper functions come first in the file). */
function pythonOf(source) {
  const py = toPython(parse(source), { digits: 'ascii' });
  const mark = py.indexOf('# ── the program');
  return (mark === -1 ? py : py.slice(py.indexOf('\n', mark) + 1)).trim();
}

// ── text ────────────────────────────────────────────────────────────────

const S = {
  en: {
    title: 'Programs that speak <em>Assamese</em>,<br />from your very first <em>line</em>',
    sub: 'Asomiya is a small programming language with Assamese keywords, numbers and error messages. No Assamese keyboard? Type <code>dhora</code>, <code>kowa</code> and <code>jodi</code> instead.',
    docs: 'Read the docs',
    tryIt: 'Try it in your browser',
    ranIn: 'hello.asom · ran in the browser',
    noErrors: '0 errors',
    chipAs: '@অসমীয়া',
    chipRoman: '@roman',
    run: 'Run this program',
    cards: [
      [
        'Playground',
        'Write and run Asomiya in your browser. Nothing to install, and you can share a link to your program.',
        'Open it',
        'pg',
      ],
      [
        'Terminal',
        'Install from npm, then run any .asom file or start the interactive prompt with asomiya.',
        'Install',
        'install',
      ],
      [
        'VS Code',
        'Colours, mistakes underlined as you type, help on hover, Run, and a live Python view.',
        'Extension',
        'ext',
      ],
    ],
    stats: [
      ['372', 'Tests on every change'],
      ['2', 'Scripts: Assamese and English letters'],
      ['40', 'Error codes, each explained'],
      ['0', 'Accounts, ads or tracking'],
    ],
    writeIn: 'Write it however you type',
    scripts: ['অসমীয়া script', 'English letters', 'English digits 123', 'Python'],
    s1: {
      tag: '#01 - WRITE IN ASSAMESE',
      title: 'Keywords you already know, in the script you already read.',
      items: [
        ['Assamese keywords', 'যদি, নহ’লে, যেতিয়ালৈকে, ফাংচন. A program reads like a sentence.'],
        [
          'English letters too',
          'jodi, nohole, jetialoike. Every spelling works, so a phone keyboard is enough.',
        ],
        ['Ordinary numbers', '10 + 20 prints 30. Assamese digits work too, if you prefer them.'],
        [
          'Questions and answers',
          'সোধা asks the person running the program, and waits for their answer.',
        ],
      ],
      link: 'The full keyword list',
      window: 'asomiya · hello.asom',
      out: 'OUTPUT',
    },
    s2: {
      tag: '#02 - MISTAKES THAT TEACH',
      title: 'Every error says what went wrong, where, and how to fix it.',
      items: [
        [
          'In Assamese or English',
          'Learners read the message in their own language. One setting switches it.',
        ],
        ['Points at the spot', 'The line and the exact word are shown, not a stack trace.'],
        ['A code for each one', 'R001, P001… each has a page that explains it with an example.'],
      ],
      link: 'All error codes',
      window: 'asomiya · error R001',
    },
    s3: {
      tag: '#03 - SHOW IN PYTHON',
      title: 'See your program in Python. The next language is easier.',
      items: [
        ['Side by side', 'Any program, translated to Python that prints exactly the same output.'],
        [
          'Checked on random programs',
          'Tests run 1,500 random programs in both and compare the output.',
        ],
        ['Take it with you', 'Save the .py file from the playground, the terminal or VS Code.'],
      ],
      link: 'How Python export works',
      window: 'asomiya → python',
    },
    s4: {
      tag: '#04 - HOW IT WORKS',
      title: 'Four steps from nothing to your first program.',
      steps: [
        ['Install', 'One npm package. No account, no sign-up.', 'npm install -g asomiya'],
        ['Write', 'Make a file called hello.asom in any editor.', 'code hello.asom'],
        ['Run', 'Run it. Answers to সোধা are typed right there.', 'asomiya run hello.asom'],
        ['See it in Python', 'Print the same program as Python.', 'asomiya python hello.asom'],
      ],
    },
    hood: {
      tag: 'UNDER THE HOOD',
      title: 'Read once, checked carefully, run safely.',
      text: 'Asomiya is a tree-walking interpreter written in TypeScript. It reads Unicode properly, so joined letters like ক্ষ and য় are one character. Programs cannot touch your files or the network, and a loop that never ends is stopped.',
      link: 'How it is built',
      stages: [
        ['LEXER', 'UNICODE · NFC', 'Assamese and English words, both kinds of digits'],
        ['PARSER', 'SYNTAX TREE', 'Brackets, blocks and precedence, with clear errors'],
        ['EVALUATOR', 'STEP BUDGET', 'Runs the tree, stops endless loops, no file access'],
        ['PYTHON', 'SAME OUTPUT', 'Translates the tree to Python you can read'],
      ],
    },
    where: {
      tag: 'WHERE IT RUNS',
      title: 'Works wherever you write code.',
      items: [
        ['Browser', 'asomiya.codes/playground', 'pg'],
        ['Terminal', 'npm install -g asomiya', 'install'],
        ['VS Code', 'Marketplace: asomiya.asomiya', 'ext'],
        ['VSCodium & Cursor', 'Open VSX: asomiya/asomiya', 'ext'],
        ['Node.js library', "import { runSource } from 'asomiya'", 'npm'],
        ['Python', 'asomiya python hello.asom', 'learn'],
      ],
    },
    values: [
      [
        'Assamese first',
        'Words were chosen with Assamese speakers, and we still ask: if a word sounds wrong, tell us.',
        'Built for learners',
        'Free forever',
      ],
      [
        'Safe by design',
        'Programs can’t read files, open the network or freeze your browser. Stop always works.',
        'No file access',
        'Endless loops stopped',
      ],
      [
        'Open source',
        'MIT licensed and built in the open on GitHub. Issues and pull requests are welcome.',
        'MIT license',
        'No tracking',
      ],
    ],
    teamTitle: 'Who’s building it',
    askTitle: 'Still wondering?',
    askText: 'Ask your favourite AI what it thinks of Asomiya, then try it yourself.',
    askPrompt:
      'What is the Asomiya programming language at asomiya.codes, and is it good for learning to program in Assamese?',
  },
  as: {
    title: '<em>অসমীয়া</em> কোৱা প্ৰগ্ৰাম,<br />প্ৰথম <em>শাৰীৰে</em> পৰা',
    sub: 'অসমীয়া এটা সৰু প্ৰগ্ৰামিং ভাষা, য’ত মূল শব্দ, সংখ্যা আৰু ভুলৰ বাৰ্তা সকলো অসমীয়াত। অসমীয়া কীব’ৰ্ড নাই? <code>dhora</code>, <code>kowa</code>, <code>jodi</code> লিখক।',
    docs: 'নথিপত্ৰ পঢ়ক',
    tryIt: 'ব্ৰাউজাৰতে চলাই চাওক',
    ranIn: 'hello.asom · ব্ৰাউজাৰত চলিল',
    noErrors: '0 টা ভুল',
    chipAs: '@অসমীয়া',
    chipRoman: '@roman',
    run: 'এই প্ৰগ্ৰামটো চলাওক',
    cards: [
      [
        'প্লেগ্ৰাউণ্ড',
        'ব্ৰাউজাৰতে অসমীয়া লিখক আৰু চলাওক। একো ইনষ্টল কৰিব নালাগে, আৰু প্ৰগ্ৰামৰ লিংক শ্বেয়াৰ কৰিব পাৰি।',
        'খোলক',
        'pg',
      ],
      [
        'টাৰ্মিনেল',
        'npm ৰ পৰা ইনষ্টল কৰক, তাৰ পিছত যিকোনো .asom ফাইল চলাওক বা asomiya লিখি প্ৰম্পট খোলক।',
        'ইনষ্টল',
        'install',
      ],
      [
        'VS Code',
        'ৰং, লিখোঁতে ভুলৰ তলত ৰেখা, মাউছ ৰাখিলে সহায়, চলোৱা, আৰু Python ৰূপ।',
        'এক্সটেনশ্যন',
        'ext',
      ],
    ],
    stats: [
      ['372', 'প্ৰতিটো সলনিত পৰীক্ষা'],
      ['2', 'লিপি: অসমীয়া আৰু ইংৰাজী আখৰ'],
      ['40', 'ভুলৰ ক’ড, প্ৰতিটোৰে ব্যাখ্যা'],
      ['0', 'একাউণ্ট, বিজ্ঞাপন বা ট্ৰেকিং'],
    ],
    writeIn: 'যেনেকৈ টাইপ কৰে তেনেকৈ লিখক',
    scripts: ['অসমীয়া লিপি', 'ইংৰাজী আখৰ', 'ইংৰাজী অংক 123', 'Python'],
    s1: {
      tag: '#01 - অসমীয়াত লিখক',
      title: 'চিনাকি শব্দ, চিনাকি লিপিত।',
      items: [
        ['অসমীয়া মূল শব্দ', 'যদি, নহ’লে, যেতিয়ালৈকে, ফাংচন। প্ৰগ্ৰাম এটা বাক্যৰ দৰে পঢ়িব পাৰি।'],
        ['ইংৰাজী আখৰতো', 'jodi, nohole, jetialoike। সকলো বানান চলে, গতিকে ফোনৰ কীব’ৰ্ডেই যথেষ্ট।'],
        ['সাধাৰণ সংখ্যা', '10 + 20 য়ে 30 ছপা কৰে। বিচাৰিলে অসমীয়া অংকও চলে।'],
        ['প্ৰশ্ন আৰু উত্তৰ', 'সোধা য়ে প্ৰগ্ৰাম চলোৱা মানুহজনক সোধে, আৰু উত্তৰলৈ ৰৈ থাকে।'],
      ],
      link: 'মূল শব্দৰ সম্পূৰ্ণ তালিকা',
      window: 'asomiya · hello.asom',
      out: 'ফলাফল',
    },
    s2: {
      tag: '#02 - শিকোৱা ভুল',
      title: 'প্ৰতিটো ভুলে কয় কি হ’ল, ক’ত হ’ল, আৰু কেনেকৈ শুধৰাব।',
      items: [
        ['অসমীয়া বা ইংৰাজীত', 'শিকাৰুৱে নিজৰ ভাষাত বাৰ্তা পঢ়ে। এটা ছেটিঙে ভাষা সলনি কৰে।'],
        ['ঠাইখিনি দেখুৱায়', 'শাৰী আৰু ঠিক শব্দটো দেখুৱায়, দীঘলীয়া ষ্টেক ট্ৰেচ নহয়।'],
        ['প্ৰতিটোৰে ক’ড', 'R001, P001… প্ৰতিটোৰে উদাহৰণসহ ব্যাখ্যাৰ পৃষ্ঠা আছে।'],
      ],
      link: 'সকলো ভুলৰ ক’ড',
      window: 'asomiya · ভুল R001',
    },
    s3: {
      tag: '#03 - PYTHON ত চাওক',
      title: 'আপোনাৰ প্ৰগ্ৰাম Python ত চাওক। পিছৰ ভাষাটো সহজ হ’ব।',
      items: [
        ['কাষে কাষে', 'যিকোনো প্ৰগ্ৰাম Python লৈ, যিয়ে একেবাৰে একে ফলাফল ছপা কৰে।'],
        ['যাদৃচ্ছিক প্ৰগ্ৰামত পৰীক্ষিত', 'পৰীক্ষাত 1500 টা যাদৃচ্ছিক প্ৰগ্ৰাম দুয়োটাতে চলাই ফলাফল মিলোৱা হয়।'],
        ['লগত লৈ যাওক', 'প্লেগ্ৰাউণ্ড, টাৰ্মিনেল বা VS Code ৰ পৰা .py ফাইল ছেভ কৰক।'],
      ],
      link: 'Python ৰূপ কেনেকৈ কাম কৰে',
      window: 'asomiya → python',
    },
    s4: {
      tag: '#04 - কেনেকৈ কাম কৰে',
      title: 'একোৱেই নাইৰ পৰা প্ৰথম প্ৰগ্ৰামলৈ চাৰিটা খোজ।',
      steps: [
        ['ইনষ্টল', 'এটা npm পেকেজ। একাউণ্ট নালাগে।', 'npm install -g asomiya'],
        ['লিখক', 'যিকোনো এডিটৰত hello.asom নামৰ ফাইল এটা বনাওক।', 'code hello.asom'],
        ['চলাওক', 'চলাওক। সোধা ৰ উত্তৰ তাতেই টাইপ কৰক।', 'asomiya run hello.asom'],
        ['Python ত চাওক', 'একেটা প্ৰগ্ৰাম Python হিচাপে ছপা কৰক।', 'asomiya python hello.asom'],
      ],
    },
    hood: {
      tag: 'ভিতৰত কি আছে',
      title: 'এবাৰ পঢ়ে, ভালদৰে পৰীক্ষা কৰে, নিৰাপদে চলায়।',
      text: 'অসমীয়া TypeScript ত লিখা এটা ট্ৰি-ৱাকিং ইণ্টাৰপ্ৰেটাৰ। ই ইউনিক’ড ঠিকমতে পঢ়ে, গতিকে ক্ষ, য় ৰ দৰে যুক্ত আখৰ এটা আখৰ হিচাপে ধৰা হয়। প্ৰগ্ৰামে আপোনাৰ ফাইল বা নেটৱৰ্ক চুব নোৱাৰে, আৰু শেষ নোহোৱা লুপ ৰখোৱা হয়।',
      link: 'কেনেকৈ বনোৱা হৈছে',
      stages: [
        ['LEXER', 'UNICODE · NFC', 'অসমীয়া আৰু ইংৰাজী শব্দ, দুয়ো ধৰণৰ অংক'],
        ['PARSER', 'SYNTAX TREE', 'বন্ধনী, ব্লক আৰু ক্ৰম, স্পষ্ট ভুলৰ বাৰ্তাৰে'],
        ['EVALUATOR', 'STEP BUDGET', 'গছজোপা চলায়, অন্তহীন লুপ ৰখায়, ফাইল নুচুয়'],
        ['PYTHON', 'SAME OUTPUT', 'গছজোপা পঢ়িব পৰা Python লৈ ৰূপান্তৰ কৰে'],
      ],
    },
    where: {
      tag: 'ক’ত চলে',
      title: 'য’তেই ক’ড লিখে, তাতেই চলে।',
      items: [
        ['ব্ৰাউজাৰ', 'asomiya.codes/playground', 'pg'],
        ['টাৰ্মিনেল', 'npm install -g asomiya', 'install'],
        ['VS Code', 'Marketplace: asomiya.asomiya', 'ext'],
        ['VSCodium আৰু Cursor', 'Open VSX: asomiya/asomiya', 'ext'],
        ['Node.js লাইব্ৰেৰী', "import { runSource } from 'asomiya'", 'npm'],
        ['Python', 'asomiya python hello.asom', 'learn'],
      ],
    },
    values: [
      [
        'প্ৰথমে অসমীয়া',
        'শব্দবোৰ অসমীয়া মানুহৰ সৈতে বাছি লোৱা হৈছে, আৰু এতিয়াও সোধো: কোনো শব্দ অস্বাভাৱিক লাগিলে জনাওক।',
        'শিকাৰুৰ বাবে',
        'চিৰদিন বিনামূলীয়া',
      ],
      [
        'নিৰাপদ',
        'প্ৰগ্ৰামে ফাইল পঢ়িব, নেটৱৰ্ক খুলিব বা ব্ৰাউজাৰ ৰখাব নোৱাৰে। ৰখাওক সদায় কাম কৰে।',
        'ফাইল নুচুয়',
        'অন্তহীন লুপ ৰখায়',
      ],
      [
        'মুক্ত উৎস',
        'MIT অনুজ্ঞাপত্ৰ, GitHub ত খোলাখুলিকৈ বনোৱা। ইছ্যু আৰু পুল ৰিকুৱেষ্ট স্বাগতম।',
        'MIT অনুজ্ঞাপত্ৰ',
        'ট্ৰেকিং নাই',
      ],
    ],
    teamTitle: 'কোনে বনাইছে',
    askTitle: 'এতিয়াও ভাবি আছে?',
    askText: 'আপোনাৰ প্ৰিয় AI ক অসমীয়াৰ বিষয়ে সোধক, তাৰ পিছত নিজে চলাই চাওক।',
    askPrompt:
      'What is the Asomiya programming language at asomiya.codes, and is it good for learning to program in Assamese?',
  },
};

// ── building blocks ─────────────────────────────────────────────────────

/** A window with a title bar, like a terminal or an editor tab. */
const windowBox = (title, inner, cls = '') =>
  `<div class="ds-window ${cls}"><div class="ds-window-bar"><span class="ds-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(title)}</span></div>${inner}</div>`;

const copyCmd = (h, cmd, cls = '') =>
  `<div class="ds-cmd ${cls}"><code><span class="ds-prompt" aria-hidden="true">$</span> ${esc(cmd)}</code><button class="ds-copy" type="button" data-copy="${esc(cmd)}" data-copied="${esc(h.t.copied)}" aria-label="${esc(h.t.copy)}">${esc(h.t.copy.toLowerCase())}</button></div>`;

function featureSection(id, s, windowHtml, linkHref, scene) {
  return `<section class="ds-feature" id="${id}">
  <p class="ds-tag">${esc(s.tag)}</p>
  <h2 class="ds-h2">${esc(s.title)}</h2>
  <div class="ds-split">
    <ul class="ds-list">${s.items
      .map(([title, text]) => `<li><h3>${esc(title)}</h3><p>${esc(text)}</p></li>`)
      .join('')}</ul>
    <div class="ds-stage ds-stage-${scene}">${windowHtml}</div>
  </div>
  <a class="ds-more" href="${linkHref}">${esc(s.link)} <span aria-hidden="true">→</span></a>
</section>`;
}

function body(lang) {
  const s = S[lang];
  // The page shows Assamese script in both languages: that is the point of the language.
  const hello = HELLO;
  const helloOut = run(hello);
  return (h) => {
    const href = {
      pg: h.playground,
      install: h.link('learn/installation/'),
      ext: h.link('extension/'),
      npm: SITE.npm,
      learn: h.link('learn/'),
    };
    const ext = (key) => (key === 'npm' ? ' target="_blank" rel="noopener noreferrer"' : '');
    const runLink = `${h.playground}${shareHash(hello)}`;
    const firstLine = (helloOut.split('\n').find((l) => l.includes('!')) ?? '').replace(
      /^.*\? /,
      '',
    );
    const askUrl = (base) => `${base}${encodeURIComponent(s.askPrompt)}`;

    const s1Window = windowBox(
      s.s1.window,
      `<pre class="ds-code"><code>${highlight(hello)}</code></pre><div class="ds-out"><span>${esc(s.s1.out)}</span><pre>${esc(helloOut.trim())}</pre></div>`,
    );
    const s2Window = windowBox(
      s.s2.window,
      `<pre class="ds-code"><code>${highlight(TYPO)}</code></pre><div class="ds-out ds-out-error"><pre>${esc(errorOf(TYPO, lang))}</pre></div><div class="ds-verify"><span>${lang === 'as' ? 'শুধৰণি' : 'FIX'}</span><code>${esc('কোৱা(ঠাই)')}</code><b>✓ ${lang === 'as' ? 'চলিল' : 'RUNS'}</b></div>`,
    );
    const s3Window = windowBox(
      s.s3.window,
      `<div class="ds-diff"><p class="ds-diff-head">asomiya</p><pre class="ds-code"><code>${highlight(PRICE)}</code></pre><p class="ds-diff-head">python</p><pre class="ds-code ds-py"><code>${esc(pythonOf(PRICE))}</code></pre><div class="ds-out"><span>${esc(s.s1.out)}</span><pre>${esc(run(PRICE).trim())}</pre></div></div>`,
    );

    return `
<section class="ds-hero">
  <h1 class="ds-h1">${s.title}</h1>
  <p class="ds-sub">${s.sub}</p>
  <p class="ds-actions">
    <a class="btn btn-secondary" href="${h.link('learn/')}">${esc(s.docs)}</a>
    <a class="btn btn-primary" href="${h.playground}">${esc(s.tryIt)}</a>
  </p>
  ${copyCmd(h, 'npm install -g asomiya', 'ds-cmd-dark')}
</section>

<section class="ds-showcase" aria-label="${esc(s.run)}">
  <div class="ds-scene ds-scene-day">
    <div class="ds-chat">
      <div class="ds-answer">
        <p lang="as">${esc(firstLine)}</p>
        <p class="ds-answer-meta"><span>✓ ${esc(s.ranIn)}</span><span>${esc(s.noErrors)}</span></p>
      </div>
      <div class="ds-input">
        <code>${highlight(hello.split('\n')[1])}</code>
        <div class="ds-input-row">
          <span class="ds-plus" aria-hidden="true">+</span>
          <span class="ds-chip">${esc(s.chipAs)}</span>
          <span class="ds-chip">${esc(s.chipRoman)}</span>
          <a class="ds-send" href="${runLink}" aria-label="${esc(s.run)}">${icon('play')}</a>
        </div>
      </div>
    </div>
  </div>
  <div class="ds-cards">${s.cards
    .map(
      ([title, text, link, key]) =>
        `<div class="ds-card"><h3>${esc(title)}</h3><p>${esc(text)}</p><a href="${href[key]}">${esc(link)}<span aria-hidden="true">→</span></a></div>`,
    )
    .join('')}</div>
</section>

<section class="ds-stats">${s.stats
      .map(([n, label]) => `<div><strong>${esc(n)}</strong><span>${esc(label)}</span></div>`)
      .join('')}</section>

<section class="ds-formats">
  <p>${esc(s.writeIn)}</p>
  <ul>${s.scripts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
</section>

${featureSection('write', s.s1, s1Window, h.link('reference/keywords/'), 'day')}
${featureSection('errors', s.s2, s2Window, h.link('reference/errors/'), 'dusk')}
${featureSection('python', s.s3, s3Window, h.link('reference/cli/'), 'day')}

<section class="ds-feature" id="how">
  <p class="ds-tag">${esc(s.s4.tag)}</p>
  <h2 class="ds-h2">${esc(s.s4.title)}</h2>
  <ol class="ds-steps">${s.s4.steps
    .map(
      ([title, text, cmd], i) =>
        `<li><span class="ds-step-n">0${i + 1}</span><h3>${esc(title)}</h3><p>${esc(text)}</p>${copyCmd(h, cmd)}</li>`,
    )
    .join('')}</ol>
</section>

<section class="ds-hood">
  <div class="ds-hood-text">
    <p class="ds-tag">${esc(s.hood.tag)}</p>
    <h2 class="ds-h2">${esc(s.hood.title)}</h2>
    <p>${esc(s.hood.text)}</p>
    <a class="ds-more" href="${SITE.repo}/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer">${esc(s.hood.link)} <span aria-hidden="true">→</span></a>
  </div>
  <div class="ds-stage ds-stage-dusk ds-pipeline">${s.hood.stages
    .map(
      ([name, kind, text]) =>
        `<div class="ds-stage-card"><p><b>${esc(name)}</b><span>${esc(kind)}</span></p><p>${esc(text)}</p></div>`,
    )
    .join('')}</div>
</section>

<section class="ds-feature" id="where">
  <p class="ds-tag">${esc(s.where.tag)}</p>
  <h2 class="ds-h2">${esc(s.where.title)}</h2>
  <div class="ds-grid">${s.where.items
    .map(
      ([title, detail, key]) =>
        `<a class="ds-tile" href="${href[key]}"${ext(key)}><strong>${esc(title)}</strong><code>${esc(detail)}</code></a>`,
    )
    .join('')}</div>
</section>

<section class="ds-values">${s.values
      .map(
        ([title, text, a, b]) =>
          `<div><h3>${esc(title)}</h3><p>${esc(text)}</p><p class="ds-badges"><span>${esc(a)}</span><span>${esc(b)}</span></p></div>`,
      )
      .join('')}</section>

<section class="ds-feature" id="team">
  <p class="ds-tag">${lang === 'as' ? 'দল' : 'TEAM'}</p>
  <h2 class="ds-h2">${esc(s.teamTitle)}</h2>
  <div class="ds-grid ds-grid-4">${TEAM.map(
    (m) =>
      `<div class="ds-tile ds-person"><strong>${esc(m.name[lang])}</strong><span>${esc(m.role[lang])}</span><p>${Object.entries(
        m.links,
      )
        .filter(([, url]) => url)
        .map(
          ([kind, url]) =>
            `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${kind === 'linkedin' ? 'LinkedIn' : 'GitHub'}</a>`,
        )
        .join(' · ')}</p></div>`,
  ).join('')}</div>
</section>

<section class="ds-ask">
  <h2 class="ds-h2">${esc(s.askTitle)}</h2>
  <p>${esc(s.askText)}</p>
  <p class="ds-ask-row">
    <a class="btn btn-secondary" href="${askUrl('https://chatgpt.com/?q=')}" target="_blank" rel="noopener noreferrer">Ask ChatGPT</a>
    <a class="btn btn-secondary" href="${askUrl('https://www.google.com/search?udm=50&q=')}" target="_blank" rel="noopener noreferrer">Ask Gemini</a>
    <a class="btn btn-secondary" href="${askUrl('https://claude.ai/new?q=')}" target="_blank" rel="noopener noreferrer">Ask Claude</a>
    <a class="btn btn-secondary" href="${askUrl('https://www.perplexity.ai/search?q=')}" target="_blank" rel="noopener noreferrer">Ask Perplexity</a>
  </p>
  <p class="ds-actions"><a class="btn btn-primary" href="${h.playground}">${esc(s.tryIt)}</a></p>
  <p class="ds-small"><a href="${EXTENSION.marketplace || h.link('extension/')}"${EXTENSION.marketplace ? ' target="_blank" rel="noopener noreferrer"' : ''}>VS Code</a> · <a href="${SITE.npm}" target="_blank" rel="noopener noreferrer">npm</a> · <a href="${SITE.repo}" target="_blank" rel="noopener noreferrer">GitHub</a> · v${esc(SITE.version)}</p>
</section>`;
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
