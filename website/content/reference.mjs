// The "Reference" section. Keyword, built-in and error tables are generated from the interpreter's
// own data, so they can't drift from the implementation.
import {
  BUILTIN_NAMES,
  BUILTIN_ROMAN,
  DEFAULT_MAX_CALL_DEPTH,
  DEFAULT_MAX_STEPS,
  KEYWORD_GLOSSARY,
  MESSAGES,
  phaseOf,
  renderMessage,
} from '../../dist/index.js';
import { samples } from '../../scripts/error-samples.mjs';

const codes = (list) => list.map((w) => `<code>${w}</code>`).join(', ');

const KEYWORD_MEANING = {
  let: { en: 'Create a variable', as: 'চলক বনোৱা' },
  print: { en: 'Print values on a line', as: 'এটা শাৰীত মান ছপা কৰা' },
  if: { en: 'Run a block if a condition is true', as: 'চৰ্ত সঁচা হ’লে ব্লক চলোৱা' },
  else: { en: 'Otherwise', as: 'অন্যথা' },
  while: { en: 'Repeat while a condition is true', as: 'চৰ্ত সঁচা হৈ থকালৈকে বাৰে বাৰে চলোৱা' },
  break: { en: 'Leave the loop', as: 'লুপৰ পৰা ওলাই অহা' },
  continue: { en: 'Skip to the next round of the loop', as: 'লুপৰ পৰৱৰ্তী পাকলৈ যোৱা' },
  function: { en: 'Define a function', as: 'ফাংচন বনোৱা' },
  return: { en: 'Give back a value from a function', as: 'ফাংচনৰ পৰা মান ঘূৰাই দিয়া' },
  true: { en: 'Boolean true', as: 'সঁচা' },
  false: { en: 'Boolean false', as: 'মিছা' },
  null: { en: 'No value (empty)', as: 'মান নাই' },
  and: { en: 'Logical AND (same as &&)', as: 'দুয়োটা সঁচা (&& ৰ দৰে)' },
  or: { en: 'Logical OR (same as ||)', as: 'অন্ততঃ এটা সঁচা (|| ৰ দৰে)' },
};

const BUILTIN_DOCS = {
  length: {
    sig: '(x)',
    en: 'Length of text (in letters) or of a list.',
    as: 'পাঠৰ (আখৰত) বা তালিকাৰ দৈৰ্ঘ্য।',
  },
  typeOf: { sig: '(x)', en: 'The type of a value, as text.', as: 'মানটোৰ প্ৰকাৰ, পাঠ হিচাপে।' },
  toNumber: {
    sig: '(x)',
    en: 'Text → number. Gives খালী if the text isn’t a number.',
    as: 'পাঠ → সংখ্যা। সংখ্যা নহ’লে খালী দিয়ে।',
  },
  toText: { sig: '(x)', en: 'Any value → text.', as: 'যিকোনো মান → পাঠ।' },
  toInteger: {
    sig: '(x)',
    en: 'Drops the decimal part (towards zero).',
    as: 'দশমিকৰ পিছৰ অংশ বাদ দিয়ে।',
  },
  append: { sig: '(list, x)', en: 'Adds x to the end of a list.', as: 'তালিকাৰ শেষত x যোগ কৰে।' },
  input: {
    sig: '(question?)',
    en: 'Shows the question and reads one line of input.',
    as: 'প্ৰশ্নটো দেখুৱাই এটা শাৰী ইনপুট পঢ়ে।',
  },
};

const overview = {
  id: 'reference',
  path: 'reference/',
  title: { en: 'Reference', as: 'সন্দৰ্ভ' },
  eyebrow: { en: 'API reference', as: 'সন্দৰ্ভ' },
  description: {
    en: 'Complete reference for the Asomiya language: keywords, built-in functions, errors, CLI and JavaScript API.',
    as: 'অসমীয়া ভাষাৰ সম্পূৰ্ণ সন্দৰ্ভ: মূল শব্দ, অন্তৰ্নিৰ্মিত ফাংচন, ভুল, CLI আৰু JavaScript API।',
  },
  intro: {
    en: 'Exact details about every part of Asomiya. New to the language? Start with <a href="../learn/">Learn</a>.',
    as: 'অসমীয়াৰ প্ৰতিটো অংশৰ সঠিক বিৱৰণ। ভাষাটো নতুন নেকি? <a href="../../as/learn/">শিকক</a>-ৰ পৰা আৰম্ভ কৰক।',
  },
  body: {
    en: (h) => `
<div class="card-grid">
  <a class="card" href="${h.link('reference/keywords/')}"><strong>Keywords</strong><span>All 15 keywords, in Assamese and English letters.</span></a>
  <a class="card" href="${h.link('reference/builtins/')}"><strong>Built-in functions</strong><span>দৈৰ্ঘ্য, প্ৰকাৰ, সংখ্যা, পাঠ, পূৰ্ণাংক, সংযোজন, সোধা.</span></a>
  <a class="card" href="${h.link('reference/errors/')}"><strong>Error codes</strong><span>Every error, with its message and an example.</span></a>
  <a class="card" href="${h.link('reference/cli/')}"><strong>CLI and REPL</strong><span>Commands, options and exit codes.</span></a>
  <a class="card" href="${h.link('reference/javascript-api/')}"><strong>JavaScript API</strong><span>Run Asomiya from your own code.</span></a>
  <a class="card" href="${h.link('reference/limits/')}"><strong>Limits and safety</strong><span>What protects you when running any program.</span></a>
</div>`,
    as: (h) => `
<div class="card-grid">
  <a class="card" href="${h.link('reference/keywords/')}"><strong>মূল শব্দ</strong><span>১৫টা মূল শব্দ, অসমীয়া আৰু ইংৰাজী আখৰত।</span></a>
  <a class="card" href="${h.link('reference/builtins/')}"><strong>অন্তৰ্নিৰ্মিত ফাংচন</strong><span>দৈৰ্ঘ্য, প্ৰকাৰ, সংখ্যা, পাঠ, পূৰ্ণাংক, সংযোজন, সোধা।</span></a>
  <a class="card" href="${h.link('reference/errors/')}"><strong>ভুলৰ ক’ড</strong><span>প্ৰতিটো ভুল, বাৰ্তা আৰু উদাহৰণসহ।</span></a>
  <a class="card" href="${h.link('reference/cli/')}"><strong>CLI আৰু REPL</strong><span>কমাণ্ড, বিকল্প আৰু এক্সিট ক’ড।</span></a>
  <a class="card" href="${h.link('reference/javascript-api/')}"><strong>JavaScript API</strong><span>নিজৰ ক’ডৰ পৰা অসমীয়া চলাওক।</span></a>
  <a class="card" href="${h.link('reference/limits/')}"><strong>সীমা আৰু সুৰক্ষা</strong><span>যিকোনো প্ৰগ্ৰাম চলাওঁতে কিহে সুৰক্ষা দিয়ে।</span></a>
</div>`,
  },
};

function keywordTable(h, lang) {
  const head =
    lang === 'en'
      ? ['Assamese', 'English letters', 'Meaning', 'Status']
      : ['অসমীয়া', 'ইংৰাজী আখৰ', 'অৰ্থ', 'অৱস্থা'];
  const status = (s) =>
    s === 'stable'
      ? `<span class="badge badge-ok">${lang === 'en' ? 'stable' : 'স্থিৰ'}</span>`
      : `<span class="badge badge-warn">${lang === 'en' ? 'provisional' : 'অস্থায়ী'}</span>`;
  return h.table(
    head,
    KEYWORD_GLOSSARY.map((k) => [
      codes([k.word, ...k.aliases]),
      codes(k.roman),
      h.esc(KEYWORD_MEANING[k.id]?.[lang] ?? k.concept),
      status(k.status),
    ]),
  );
}

const keywords = {
  id: 'keywords',
  path: 'reference/keywords/',
  title: { en: 'Keywords', as: 'মূল শব্দ' },
  description: {
    en: 'Every Asomiya keyword in Assamese script and English letters, with its meaning.',
    as: 'অসমীয়া লিপি আৰু ইংৰাজী আখৰত অসমীয়াৰ প্ৰতিটো মূল শব্দ, অৰ্থসহ।',
  },
  intro: {
    en: 'Keywords are reserved words: you can’t use them as names. Each one can be written in Assamese script or in any of its English-letter spellings (lower-case only).',
    as: 'মূল শব্দবোৰ সংৰক্ষিত: নাম হিচাপে ব্যৱহাৰ কৰিব নোৱাৰি। প্ৰতিটো অসমীয়া লিপিত বা ইংৰাজী আখৰৰ যিকোনো বানানত (কেৱল সৰু আখৰত) লিখিব পাৰি।',
  },
  body: {
    en: (h) => `
${keywordTable(h, 'en')}
${h.note('note', '<p><strong>Provisional</strong> words work and are documented, but a more natural Assamese word may replace them after review by native speakers. Have a suggestion? <a href="https://github.com/d43ash1sh/asomiya/issues" target="_blank" rel="noopener noreferrer">Open an issue</a>.</p>')}
${h.h2('symbols', 'Symbols')}
<p>Brackets <code>( ) { } [ ]</code>, the comma, operators (see <a href="${h.link('learn/operators/')}">Operators</a>), comments <code>// …</code> and <code>/* … */</code>, and statement separators: a new line, <code>;</code> or the danda <code>।</code>.</p>`,
    as: (h) => `
${keywordTable(h, 'as')}
${h.note('note', '<p><strong>অস্থায়ী</strong> শব্দবোৰ চলে আৰু নথিভুক্ত, কিন্তু অসমীয়া কোৱা লোকৰ পৰ্যালোচনাৰ পিছত অধিক স্বাভাৱিক শব্দই সেইবোৰৰ ঠাই ল’ব পাৰে। পৰামৰ্শ আছে? <a href="https://github.com/d43ash1sh/asomiya/issues" target="_blank" rel="noopener noreferrer">ইছ্যু খোলক</a>।</p>')}
${h.h2('symbols', 'চিহ্ন')}
<p>বন্ধনী <code>( ) { } [ ]</code>, কমা, অপাৰেটৰ (চাওক <a href="${h.link('learn/operators/')}">অপাৰেটৰ</a>), মন্তব্য <code>// …</code> আৰু <code>/* … */</code>, আৰু বাক্য পৃথক কৰা চিহ্ন: নতুন শাৰী, <code>;</code> বা দাড়ি <code>।</code>।</p>`,
  },
};

function builtinTable(h, lang) {
  return h.table(
    lang === 'en'
      ? ['Assamese', 'English letters', 'What it does']
      : ['অসমীয়া', 'ইংৰাজী আখৰ', 'কাম'],
    Object.entries(BUILTIN_NAMES).map(([key, name]) => [
      `<code>${name}${BUILTIN_DOCS[key].sig}</code>`,
      codes(BUILTIN_ROMAN[key]),
      h.esc(BUILTIN_DOCS[key][lang]),
    ]),
  );
}

const builtins = {
  id: 'builtins',
  path: 'reference/builtins/',
  title: { en: 'Built-in functions', as: 'অন্তৰ্নিৰ্মিত ফাংচন' },
  description: {
    en: 'The seven built-in functions of Asomiya, with examples.',
    as: 'অসমীয়াৰ সাতটা অন্তৰ্নিৰ্মিত ফাংচন, উদাহৰণসহ।',
  },
  intro: {
    en: 'Built-in functions are always available. Unlike keywords, they are ordinary names: you can create your own variable with the same name inside a block, but you can’t reassign them (<code>R020</code>).',
    as: 'অন্তৰ্নিৰ্মিত ফাংচনবোৰ সদায় উপলব্ধ। মূল শব্দৰ দৰে নহয়, এইবোৰ সাধাৰণ নাম: ব্লকৰ ভিতৰত একে নামৰ নিজৰ চলক বনাব পাৰি, কিন্তু নতুন মান দিব নোৱাৰি (<code>R020</code>)।',
  },
  body: {
    en: (h) => `
${builtinTable(h, 'en')}
${h.h2('examples', 'Examples')}
${h.example('ধৰা ল = [১, ২]\nসংযোজন(ল, ৩)\nকোৱা(দৈৰ্ঘ্য(ল), দৈৰ্ঘ্য("অসম"), প্ৰকাৰ(ল))\nকোৱা(সংখ্যা("৪২") + ১, সংখ্যা("অসম"))\nকোৱা(পাঠ(৭) + "!", পূৰ্ণাংক(-৩.৭))', 'dhora l = [1, 2]\nxonjojon(l, 3)\nkowa(doirghyo(l), doirghyo("Oxom"), prokar(l))\nkowa(xonkhya("42") + 1, xonkhya("Oxom"))\nkowa(path(7) + "!", purnanko(-3.7))')}
${h.h2('print', 'কোৱা (print)')}
<p><code>কোৱা</code> is a keyword, not a function, but you call it the same way. It prints its values separated by spaces, then a new line. <code>কোৱা()</code> prints an empty line.</p>`,
    as: (h) => `
${builtinTable(h, 'as')}
${h.h2('examples', 'উদাহৰণ')}
${h.example('ধৰা ল = [১, ২]\nসংযোজন(ল, ৩)\nকোৱা(দৈৰ্ঘ্য(ল), দৈৰ্ঘ্য("অসম"), প্ৰকাৰ(ল))\nকোৱা(সংখ্যা("৪২") + ১, সংখ্যা("অসম"))\nকোৱা(পাঠ(৭) + "!", পূৰ্ণাংক(-৩.৭))', 'dhora l = [1, 2]\nxonjojon(l, 3)\nkowa(doirghyo(l), doirghyo("Oxom"), prokar(l))\nkowa(xonkhya("42") + 1, xonkhya("Oxom"))\nkowa(path(7) + "!", purnanko(-3.7))')}
${h.h2('print', 'কোৱা')}
<p><code>কোৱা</code> এটা মূল শব্দ, ফাংচন নহয়, কিন্তু একে ধৰণেৰে মাতিব পাৰি। ই মানবোৰ খালী ঠাইৰে পৃথক কৰি ছপা কৰে আৰু শেষত নতুন শাৰী দিয়ে। <code>কোৱা()</code>-এ এটা খালী শাৰী ছপা কৰে।</p>`,
  },
};

const PHASE_TITLES = {
  lexer: { en: 'Lexical errors (L)', as: 'শব্দ-বিশ্লেষণৰ ভুল (L)' },
  parser: { en: 'Syntax errors (P)', as: 'বাক্য-গঠনৰ ভুল (P)' },
  runtime: { en: 'Runtime errors (R)', as: 'চলোৱাৰ সময়ৰ ভুল (R)' },
};

function errorList(h, lang) {
  let out = '';
  let phase = null;
  for (const code of Object.keys(MESSAGES)) {
    const sample = samples[code];
    if (sample === undefined) throw new Error(`No sample for ${code} in scripts/error-samples.mjs`);
    const [params, example] = sample;
    const p = phaseOf(code);
    if (p !== phase) {
      out += h.h2(p, PHASE_TITLES[p][lang]);
      phase = p;
    }
    const other = lang === 'en' ? 'as' : 'en';
    out += `<div class="error-item" id="${code}">
  <p class="error-code"><a href="#${code}">${code}</a></p>
  <p class="error-msg">${h.esc(renderMessage(code, params, lang))}</p>
  <p class="error-alt" lang="${other}">${h.esc(renderMessage(code, params, other))}</p>
  <p class="error-example"><span>${lang === 'en' ? 'Example' : 'উদাহৰণ'}</span> <code>${h.esc(example)}</code></p>
</div>`;
  }
  return out;
}

const errorsRef = {
  id: 'errors-reference',
  path: 'reference/errors/',
  title: { en: 'Error codes', as: 'ভুলৰ ক’ড' },
  description: {
    en: 'Every Asomiya error code with its Assamese and English message and an example.',
    as: 'অসমীয়াৰ প্ৰতিটো ভুলৰ ক’ড, অসমীয়া আৰু ইংৰাজী বাৰ্তা আৰু উদাহৰণসহ।',
  },
  intro: {
    en: 'Every error has a stable code. The messages below come straight from the interpreter, filled in with example values. Exit codes: <code>0</code> success, <code>1</code> the program had an error, <code>2</code> wrong command-line usage or unreadable file.',
    as: 'প্ৰতিটো ভুলৰ এটা স্থিৰ ক’ড আছে। তলৰ বাৰ্তাবোৰ পোনপটীয়াকৈ ইণ্টাৰপ্ৰেটাৰৰ পৰা লোৱা, উদাহৰণৰ মানসহ। এক্সিট ক’ড: <code>0</code> সফল, <code>1</code> প্ৰগ্ৰামত ভুল, <code>2</code> কমাণ্ড ভুলকৈ দিয়া বা ফাইল পঢ়িব নোৱাৰা।',
  },
  body: { en: (h) => errorList(h, 'en'), as: (h) => errorList(h, 'as') },
};

const cli = {
  id: 'cli',
  path: 'reference/cli/',
  title: { en: 'CLI and REPL', as: 'CLI আৰু REPL' },
  description: {
    en: 'The asomiya command: run files, start the REPL, options and exit codes.',
    as: 'asomiya কমাণ্ড: ফাইল চলোৱা, REPL আৰম্ভ কৰা, বিকল্প আৰু এক্সিট ক’ড।',
  },
  body: {
    en: (h) => `
${h.h2('usage', 'Usage')}
${h.pre(`asomiya run <file> [options]      run a program
asomiya python <file> [options]   print the same program in Python
asomiya [repl] [options]          start the REPL (default)
asomiya --version | --help`)}
${h.h2('options', 'Options')}
${h.table(
  ['Option', 'Meaning', 'Default'],
  [
    ['<code>-l, --lang &lt;as|en&gt;</code>', 'Language of error messages', '<code>as</code>'],
    ['<code>--ascii-digits</code>', 'Always print numbers with 0-9', 'auto'],
    ['<code>--assamese-digits</code>', 'Always print numbers with ০-৯', 'auto'],
    [
      '<code>--max-steps &lt;n&gt;</code>',
      'Execution step budget (0 = unlimited)',
      `<code>${DEFAULT_MAX_STEPS}</code>`,
    ],
    [
      '<code>--max-depth &lt;n&gt;</code>',
      'Maximum function call depth',
      `<code>${DEFAULT_MAX_CALL_DEPTH}</code>`,
    ],
  ],
)}
<p>By default (“auto”), programs written in Assamese script print <code>১২৩</code> and programs written in English letters print <code>123</code>.</p>
${h.h2('exit-codes', 'Exit codes')}
${h.table(
  ['Code', 'Meaning'],
  [
    ['<code>0</code>', 'The program finished'],
    ['<code>1</code>', 'The program had an error'],
    ['<code>2</code>', 'Wrong usage, or the file couldn’t be read'],
  ],
)}
${h.h2('python', 'Translating to Python')}
<p><code>asomiya python program.asom</code> prints the program in Python (the playground’s <strong>Python</strong> button does the same). The Python program prints exactly what the Asomiya program prints and stops with an error where it would. Where Python behaves differently, such as printing <code>3.0</code> for <code>৩</code> or counting <code>ক্ষ</code> as three characters, the code calls a small helper function that is included in the file. The digit options choose how its numbers print. Save it and run it with <code>python3 program.py</code>.</p>
${h.h2('repl', 'REPL')}
<p>A complete statement runs as soon as you press Enter. An open <code>{</code> or <code>(</code> waits for more lines. <code>সোধা</code> reads the next line you type.</p>
${h.table(
  ['Command', 'Effect'],
  [
    ['<code>.সহায়</code> / <code>.help</code>', 'Show help'],
    ['<code>.বাতিল</code> / <code>.cancel</code>', 'Discard an unfinished multi-line input'],
    ['<code>.প্ৰস্থান</code> / <code>.exit</code>, Ctrl+D', 'Quit'],
    ['Ctrl+C', 'Quit immediately, even while a program runs'],
  ],
)}
${h.note('note', '<p>The REPL has no arrow-key history on purpose: line editors redraw the line using column arithmetic that doesn’t match how terminals draw Assamese, which garbles the screen.</p>')}`,
    as: (h) => `
${h.h2('usage', 'ব্যৱহাৰ')}
${h.pre(`asomiya run <file> [options]      প্ৰগ্ৰাম চলাওক
asomiya python <file> [options]   একেটা প্ৰগ্ৰাম Python-ত দেখুৱাওক
asomiya [repl] [options]          REPL আৰম্ভ কৰক (ডিফল্ট)
asomiya --version | --help`)}
${h.h2('options', 'বিকল্প')}
${h.table(
  ['বিকল্প', 'অৰ্থ', 'ডিফল্ট'],
  [
    ['<code>-l, --lang &lt;as|en&gt;</code>', 'ভুলৰ বাৰ্তাৰ ভাষা', '<code>as</code>'],
    ['<code>--ascii-digits</code>', 'সদায় 0-9 ৰে সংখ্যা দেখুওৱা', 'স্বয়ংক্ৰিয়'],
    ['<code>--assamese-digits</code>', 'সদায় ০-৯ ৰে সংখ্যা দেখুওৱা', 'স্বয়ংক্ৰিয়'],
    [
      '<code>--max-steps &lt;n&gt;</code>',
      'চলোৱাৰ খোজৰ সীমা (0 = অসীম)',
      `<code>${DEFAULT_MAX_STEPS}</code>`,
    ],
    [
      '<code>--max-depth &lt;n&gt;</code>',
      'ফাংচন মতাৰ সৰ্বোচ্চ গভীৰতা',
      `<code>${DEFAULT_MAX_CALL_DEPTH}</code>`,
    ],
  ],
)}
<p>স্বয়ংক্ৰিয়ভাৱে, অসমীয়া লিপিৰ প্ৰগ্ৰামে <code>১২৩</code> আৰু ইংৰাজী আখৰৰ প্ৰগ্ৰামে <code>123</code> দেখুৱায়।</p>
${h.h2('exit-codes', 'এক্সিট ক’ড')}
${h.table(
  ['ক’ড', 'অৰ্থ'],
  [
    ['<code>0</code>', 'প্ৰগ্ৰামটো শেষ হ’ল'],
    ['<code>1</code>', 'প্ৰগ্ৰামত ভুল আছিল'],
    ['<code>2</code>', 'ভুল ব্যৱহাৰ, বা ফাইল পঢ়িব পৰা নগ’ল'],
  ],
)}
${h.h2('python', 'Python-লৈ অনুবাদ')}
<p><code>asomiya python program.asom</code>-এ প্ৰগ্ৰামটো Python-ত দেখুৱায় (প্লেগ্ৰাউণ্ডৰ <strong>Python</strong> বুটামেও একে কাম কৰে)। Python প্ৰগ্ৰামটোৱে অসমীয়া প্ৰগ্ৰামটোৱে যি ছপা কৰে, ঠিক সেয়াই ছপা কৰে, আৰু য’ত অসমীয়াত ভুল হয় তাতেই ৰৈ যায়। য’ত Python বেলেগ, যেনে <code>৩</code>-ৰ ঠাইত <code>3.0</code> ছপা কৰা বা <code>ক্ষ</code>-ক তিনিটা আখৰ বুলি গণা, তাত ফাইলটোতে থকা এটা সৰু সহায়ক ফাংচন ব্যৱহাৰ হয়। অংকৰ বিকল্পবোৰে ইয়াৰ সংখ্যা কেনেকৈ ছপা হ’ব ঠিক কৰে। সাঁচি থৈ <code>python3 program.py</code> দি চলাওক।</p>
${h.h2('repl', 'REPL')}
<p>সম্পূৰ্ণ বাক্য এটা Enter টিপাৰ লগে লগে চলে। খোলা <code>{</code> বা <code>(</code> থাকিলে আৰু শাৰীৰ বাবে অপেক্ষা কৰে। <code>সোধা</code>-ই আপুনি লিখা পৰৱৰ্তী শাৰীটো পঢ়ে।</p>
${h.table(
  ['কমাণ্ড', 'কাম'],
  [
    ['<code>.সহায়</code> / <code>.help</code>', 'সহায় দেখুওৱা'],
    ['<code>.বাতিল</code> / <code>.cancel</code>', 'অসম্পূৰ্ণ ইনপুট বাতিল কৰা'],
    ['<code>.প্ৰস্থান</code> / <code>.exit</code>, Ctrl+D', 'ওলাই যোৱা'],
    ['Ctrl+C', 'লগে লগে ওলাই যোৱা, প্ৰগ্ৰাম চলি থাকিলেও'],
  ],
)}`,
  },
};

const API_SNIPPET = `import { runSource } from 'asomiya';

const { output, error } = runSource('কোৱা(১০ + ২০)');
console.log(output); // "৩০\\n"

runSource('kowa(10 + 20)').output; // "30\\n"`;

const ADVANCED_SNIPPET = `import { Interpreter, parse, formatDiagnostic, AsomiyaError } from 'asomiya';

const source = 'কোৱা(সোধা("নাম? "))';
const interpreter = new Interpreter({
  write: (text) => process.stdout.write(text),
  readLine: () => 'ৰীতা',
  maxSteps: 1_000_000,
});

try {
  interpreter.run(parse(source));
} catch (e) {
  if (e instanceof AsomiyaError) {
    console.error(formatDiagnostic(e.diagnostic, { lang: 'en', source }));
  } else throw e;
}`;

const api = {
  id: 'javascript-api',
  path: 'reference/javascript-api/',
  title: { en: 'JavaScript API', as: 'JavaScript API' },
  description: {
    en: 'Use the asomiya npm package to run Asomiya programs from JavaScript or TypeScript.',
    as: 'JavaScript বা TypeScript ৰ পৰা অসমীয়া প্ৰগ্ৰাম চলাবলৈ asomiya npm পেকেজ ব্যৱহাৰ কৰক।',
  },
  body: {
    en: (h) => `
${h.shell('npm install asomiya')}
${h.h2('run-source', 'runSource')}
<p>The simplest way: run a whole program and get everything it printed. Errors are returned, not thrown.</p>
${h.pre(API_SNIPPET)}
${h.h2('interpreter', 'Interpreter')}
<p>For full control (streaming output, input, limits), use the interpreter directly:</p>
${h.pre(ADVANCED_SNIPPET)}
${h.table(
  ['Option', 'Meaning'],
  [
    ['<code>write(text)</code>', 'Receives printed text'],
    [
      '<code>readLine()</code>',
      'Supplies one line per <code>সোধা</code> call; <code>null</code> means end of input',
    ],
    ['<code>maxSteps</code>', `Step budget (default <code>${DEFAULT_MAX_STEPS}</code>)`],
    [
      '<code>maxCallDepth</code>',
      `Call depth limit (default <code>${DEFAULT_MAX_CALL_DEPTH}</code>)`,
    ],
    [
      '<code>digits</code>',
      '<code>"auto"</code> (default), <code>"assamese"</code> or <code>"ascii"</code>',
    ],
  ],
)}
<p>The package also exports the lexer (<code>tokenize</code>), parser (<code>parse</code>), the keyword glossary and the error catalogue. It is fully typed and ships ES modules for Node.js 20+.</p>`,
    as: (h) => `
${h.shell('npm install asomiya')}
${h.h2('run-source', 'runSource')}
<p>আটাইতকৈ সহজ উপায়: গোটেই প্ৰগ্ৰামটো চলাওক আৰু ই ছপা কৰা সকলোখিনি পাওক। ভুলবোৰ ঘূৰাই দিয়া হয়, থ্ৰ’ কৰা নহয়।</p>
${h.pre(API_SNIPPET)}
${h.h2('interpreter', 'Interpreter')}
<p>সম্পূৰ্ণ নিয়ন্ত্ৰণৰ বাবে (আউটপুট, ইনপুট, সীমা) ইণ্টাৰপ্ৰেটাৰটো পোনপটীয়াকৈ ব্যৱহাৰ কৰক:</p>
${h.pre(ADVANCED_SNIPPET)}
${h.table(
  ['বিকল্প', 'অৰ্থ'],
  [
    ['<code>write(text)</code>', 'ছপা কৰা পাঠ গ্ৰহণ কৰে'],
    [
      '<code>readLine()</code>',
      'প্ৰতিবাৰ <code>সোধা</code> মাতিলে এটা শাৰী দিয়ে; <code>null</code> মানে ইনপুট শেষ',
    ],
    ['<code>maxSteps</code>', `খোজৰ সীমা (ডিফল্ট <code>${DEFAULT_MAX_STEPS}</code>)`],
    [
      '<code>maxCallDepth</code>',
      `ফাংচন মতাৰ গভীৰতাৰ সীমা (ডিফল্ট <code>${DEFAULT_MAX_CALL_DEPTH}</code>)`,
    ],
    [
      '<code>digits</code>',
      '<code>"auto"</code> (ডিফল্ট), <code>"assamese"</code> বা <code>"ascii"</code>',
    ],
  ],
)}
<p>পেকেজটোৱে লেক্সাৰ (<code>tokenize</code>), পাৰ্চাৰ (<code>parse</code>), মূল শব্দৰ তালিকা আৰু ভুলৰ তালিকাও দিয়ে। ই সম্পূৰ্ণ টাইপ কৰা আৰু Node.js ২০+ ৰ বাবে ES মডিউল।</p>`,
  },
};

const limits = {
  id: 'limits',
  path: 'reference/limits/',
  title: { en: 'Limits and safety', as: 'সীমা আৰু সুৰক্ষা' },
  description: {
    en: 'How Asomiya keeps running untrusted programs safe: step budget, depth limits, size limits and blocked characters.',
    as: 'অচিনাকি প্ৰগ্ৰাম চলোৱাটো অসমীয়াই কেনেকৈ নিৰাপদ ৰাখে: খোজৰ সীমা, গভীৰতাৰ সীমা, আকাৰৰ সীমা আৰু বাধা দিয়া আখৰ।',
  },
  intro: {
    en: 'Asomiya programs can only print text and read input. They can’t open files, use the network or run other programs, so running someone else’s code is safe. These limits keep it that way.',
    as: 'অসমীয়া প্ৰগ্ৰামে কেৱল লিখা ছপা কৰিব আৰু ইনপুট পঢ়িব পাৰে। ফাইল খুলিব, নেটৱৰ্ক ব্যৱহাৰ কৰিব বা আন প্ৰগ্ৰাম চলাব নোৱাৰে, সেয়েহে আনৰ ক’ড চলোৱাটো নিৰাপদ। এই সীমাবোৰে তেনেকৈয়ে ৰাখে।',
  },
  body: {
    en: (h) => `
${h.table(
  ['Risk', 'Protection', 'Error'],
  [
    [
      'Endless loops',
      `Stops after ${DEFAULT_MAX_STEPS.toLocaleString('en')} steps (<code>--max-steps</code>)`,
      '<code>R008</code>',
    ],
    [
      'Endless recursion',
      `Call depth limit of ${DEFAULT_MAX_CALL_DEPTH} (<code>--max-depth</code>)`,
      '<code>R009</code>',
    ],
    ['Deeply nested code', 'Parser nesting limit', '<code>P010</code>'],
    [
      'Huge text or lists',
      'Text up to 10 million characters, lists up to 1 million items',
      '<code>R019</code>',
    ],
    [
      'Hidden code (“Trojan Source”)',
      'Invisible control and direction characters are rejected in text and comments',
      '<code>L008</code>',
    ],
    ['Terminal tricks', 'Error messages show control characters as visible symbols', ''],
    [
      'Look-alike names',
      'Zero-width joiners only allowed inside Assamese letters',
      '<code>L001</code>',
    ],
  ],
)}
${h.h2('playground', 'In the playground')}
<ul>
  <li>Programs run in a separate background thread (a Web Worker), so the page never freezes, and the Stop button can end any program.</li>
  <li>Output is always shown as plain text, never as HTML.</li>
  <li>Shared links show the program but never run it until you press Run.</li>
  <li>A strict Content Security Policy blocks any script that isn’t ours, and the page can’t send data anywhere.</li>
</ul>
<p>Found a security problem? Please report it privately: see <a href="https://github.com/d43ash1sh/asomiya/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">SECURITY.md</a>.</p>`,
    as: (h) => `
${h.table(
  ['বিপদ', 'সুৰক্ষা', 'ভুল'],
  [
    [
      'অন্তহীন লুপ',
      `${DEFAULT_MAX_STEPS.toLocaleString('en')} খোজৰ পিছত বন্ধ হয় (<code>--max-steps</code>)`,
      '<code>R008</code>',
    ],
    [
      'অন্তহীন ৰিকাৰ্চন',
      `ফাংচন মতাৰ গভীৰতা ${DEFAULT_MAX_CALL_DEPTH} লৈকে (<code>--max-depth</code>)`,
      '<code>R009</code>',
    ],
    ['অতি গভীৰ ক’ড', 'পাৰ্চাৰৰ স্তৰৰ সীমা', '<code>P010</code>'],
    ['অতি ডাঙৰ পাঠ বা তালিকা', 'পাঠ ১ কোটি আখৰলৈকে, তালিকা ১০ লাখ উপাদানলৈকে', '<code>R019</code>'],
    [
      'লুকুৱাই থোৱা ক’ড (“Trojan Source”)',
      'পাঠ আৰু মন্তব্যত অদৃশ্য নিয়ন্ত্ৰণ আখৰ গ্ৰহণ কৰা নহয়',
      '<code>L008</code>',
    ],
    ['টাৰ্মিনেলৰ কৌশল', 'ভুলৰ বাৰ্তাত নিয়ন্ত্ৰণ আখৰ দৃশ্যমান চিহ্ন হিচাপে দেখুওৱা হয়', ''],
    ['একে যেন লগা নাম', 'জিৰো-ৱিড্থ জইনাৰ কেৱল অসমীয়া আখৰৰ ভিতৰত চলে', '<code>L001</code>'],
  ],
)}
${h.h2('playground', 'প্লেগ্ৰাউণ্ডত')}
<ul>
  <li>প্ৰগ্ৰাম এটা বেলেগ পটভূমিৰ থ্ৰেডত (Web Worker) চলে, সেয়েহে পৃষ্ঠাটো কেতিয়াও স্থবিৰ নহয়, আৰু ৰখোৱা বুটামে যিকোনো প্ৰগ্ৰাম বন্ধ কৰিব পাৰে।</li>
  <li>ফলাফল সদায় সাধাৰণ লিখা হিচাপে দেখুওৱা হয়, HTML হিচাপে নহয়।</li>
  <li>শ্বেয়াৰ কৰা লিংকে প্ৰগ্ৰামটো দেখুৱায়, কিন্তু আপুনি চলাওক নিটিপালৈকে নচলায়।</li>
  <li>কঠোৰ Content Security Policy য়ে আমাৰ বাহিৰে আন কোনো স্ক্ৰিপ্ট চলিবলৈ নিদিয়ে, আৰু পৃষ্ঠাটোৱে ক’লৈকো তথ্য পঠিয়াব নোৱাৰে।</li>
</ul>
<p>সুৰক্ষাজনিত সমস্যা পালে গোপনে জনাওক: চাওক <a href="https://github.com/d43ash1sh/asomiya/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">SECURITY.md</a>।</p>`,
  },
};

export const REFERENCE = {
  id: 'reference',
  title: { en: 'Reference', as: 'সন্দৰ্ভ' },
  groups: [
    { title: { en: 'Language', as: 'ভাষা' }, pages: [overview, keywords, builtins, errorsRef] },
    { title: { en: 'Tools', as: 'সঁজুলি' }, pages: [cli, api, limits] },
  ].map((g) => ({ ...g, pages: g.pages.map((p) => ({ ...p, section: 'reference' })) })),
};
