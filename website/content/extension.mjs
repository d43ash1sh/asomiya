// The VS Code extension page, laid out like an extension marketplace listing: a header with the
// icon and Install button, an overview with screenshots, and a sidebar of facts.
import { EXTENSION as X, SITE } from '../site.config.mjs';
import { esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const ext = (href, label) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
const published = X.marketplace !== '';

const S = {
  en: {
    crumbs: ['Asomiya', 'Tools', 'VS Code extension'],
    title: 'Asomiya for VS Code',
    publisher: 'Asomiya',
    free: 'Free',
    openSource: 'Open source (MIT)',
    tagline:
      'Write code in Assamese in VS Code: syntax colours, errors as you type, hover help, a Run button and Show in Python.',
    install: 'Install',
    download: 'Download .vsix',
    soon: 'Coming soon to the VS Code Marketplace and Open VSX. Until then, install the .vsix file (see below).',
    tabs: ['Overview', 'Install', 'Version history'],
    intro:
      'Asomiya is a programming language in Assamese. This extension gives it full editor support in VS Code and the editors built on it (Cursor, Windsurf, VSCodium), whether you write in Assamese script or in English letters.',
    features: [
      [
        'Syntax colours in both scripts',
        'Keywords, built-ins, text, numbers (১২৩ and 123) and comments are coloured whichever way you write. Every accepted spelling works: nohole, noh’le and নহ’লে are the same keyword.',
      ],
      [
        'Errors as you type',
        'Mistakes are underlined while you type, with Asomiya’s error code and a message in Assamese or English. Click the code to read how to fix it.',
      ],
      [
        'Hover help',
        'Hover any keyword or built-in for its meaning in English and Assamese, and its name in Python.',
      ],
      [
        'Run with one click',
        'Press ▶ (or Cmd/Ctrl+F5). The program runs in a terminal inside the editor; সোধা waits for your answer and Ctrl+C stops it. Nothing else to install.',
      ],
      [
        'Show in Python',
        'See the same program in Python beside it, updated as you type. It prints exactly the same output, and you can save it as a .py file.',
      ],
      [
        'Snippets',
        'Type jodi, jetialoike, fangchon, যদি or ফাংচন and press Tab for a ready-made block, in either script.',
      ],
    ],
    shots: [
      [
        'overview',
        'Run a program, answer its questions in the terminal, and hover a keyword for help.',
      ],
      ['errors', 'Errors are underlined as you type, with the error code and a clear message.'],
      ['python', 'Show in Python: the same program in Python, side by side.'],
    ],
    shotNote: 'Previews made with the extension’s own colouring, messages and Python translation.',
    installTitle: 'Install',
    installSteps: published
      ? [
          'In VS Code, open the Extensions view (Cmd/Ctrl+Shift+X).',
          'Search for “Asomiya” and click Install.',
          'Create a file ending in .asom and start writing.',
        ]
      : [
          'Download {VSIX}.',
          'In VS Code, open the Extensions view (Cmd/Ctrl+Shift+X), click ⋯ at the top and choose “Install from VSIX…”.',
          'Pick the downloaded file. Then create a file ending in .asom and start writing.',
        ],
    cursorNote: 'Cursor, Windsurf and VSCodium work the same way (they use the Open VSX registry).',
    firstTitle: 'Your first program',
    commandsTitle: 'Commands and shortcuts',
    commands: [
      ['Asomiya: Run Program', '▶ in the editor title · Cmd/Ctrl+F5'],
      ['Asomiya: Stop Program', 'Ctrl+C in the terminal'],
      ['Asomiya: Show in Python', 'the split icon in the editor title'],
      ['Asomiya: Save Python Version As…', 'in the Python view’s title'],
    ],
    settingsTitle: 'Settings',
    settings: [
      ['asomiya.errorLanguage', 'as', 'Error messages in Assamese (as) or English (en).'],
      [
        'asomiya.digits',
        'auto',
        'Print numbers as ১২৩, 123, or auto (123 for programs in English letters).',
      ],
      ['asomiya.checkAsYouType', 'true', 'Underline errors while typing.'],
    ],
    safeTitle: 'Safe by design',
    safe: [
      'Checking for errors only reads your code; nothing runs until you press ▶.',
      'Asomiya programs cannot touch your files or the network, and a running program can always be stopped.',
      'No dependencies, no telemetry, about 60 KB.',
    ],
    historyTitle: 'Version history',
    history: [
      'First release: syntax colours, errors as you type, hover help, completions, Run with input, Show in Python, and snippets in both scripts.',
    ],
    side: {
      categories: 'Categories',
      tags: 'Tags',
      worksWith: 'Works with',
      resources: 'Resources',
      info: 'More info',
      version: 'Version',
      released: 'Released on',
      id: 'Unique identifier',
      size: 'Size',
      deps: 'Dependencies',
      none: 'None',
      source: 'Source code',
      changelog: 'Changelog',
      license: 'License',
      issue: 'Report an issue',
      language: 'The language',
    },
    tags: ['assamese', 'অসমীয়া', 'education', 'beginners', 'python'],
    editors: ['VS Code ' + X.engine + ' or newer', 'Cursor', 'Windsurf', 'VSCodium'],
  },
  as: {
    crumbs: ['অসমীয়া', 'সঁজুলি', 'VS Code এক্সটেনশ্যন'],
    title: 'VS Code ৰ বাবে অসমীয়া',
    publisher: 'অসমীয়া',
    free: 'বিনামূলীয়া',
    openSource: 'মুক্ত উৎস (MIT)',
    tagline:
      'VS Code ত অসমীয়াত ক’ড লিখক: ছিনটেক্সৰ ৰং, লিখোঁতেই ভুল দেখুওৱা, হভাৰ সহায়, চলোৱা বুটাম আৰু Python ত দেখুওৱা।',
    install: 'ইনষ্টল কৰক',
    download: '.vsix ডাউনলোড কৰক',
    soon: 'অতি সোনকালে VS Code Marketplace আৰু Open VSX ত আহিব। তেতিয়ালৈকে .vsix ফাইলটো ইনষ্টল কৰক (তলত চাওক)।',
    tabs: ['আভাস', 'ইনষ্টল', 'সংস্কৰণৰ ইতিহাস'],
    intro:
      'অসমীয়া এটা অসমীয়া ভাষাৰ প্ৰগ্ৰামিং ভাষা। এই এক্সটেনশ্যনে VS Code আৰু তাৰ ওপৰত নিৰ্মিত এডিটৰবোৰত (Cursor, Windsurf, VSCodium) সম্পূৰ্ণ সহায় দিয়ে, আপুনি অসমীয়া আখৰতে লিখক বা ইংৰাজী আখৰত।',
    features: [
      [
        'দুয়োটা লিপিত ছিনটেক্সৰ ৰং',
        'মূল শব্দ, অন্তৰ্নিৰ্মিত ফাংচন, পাঠ, সংখ্যা (১২৩ আৰু 123) আৰু মন্তব্য ৰঙীন হয়, যিদৰেই নিলিখক। সকলো গ্ৰহণযোগ্য বানান চলে: nohole, noh’le আৰু নহ’লে একেটা মূল শব্দ।',
      ],
      [
        'লিখোঁতেই ভুল',
        'লিখি থাকোঁতেই ভুলৰ তলত ৰেখা পৰে, ভুলৰ ক’ড আৰু অসমীয়া বা ইংৰাজীত বাৰ্তাৰ সৈতে। কেনেকৈ শুধৰাব পঢ়িবলৈ ক’ডটোত ক্লিক কৰক।',
      ],
      [
        'হভাৰ সহায়',
        'যিকোনো মূল শব্দ বা অন্তৰ্নিৰ্মিত ফাংচনৰ ওপৰত মাউছ ৰাখক: ইংৰাজী আৰু অসমীয়াত অৰ্থ, আৰু Python ত ইয়াৰ নাম।',
      ],
      [
        'এক ক্লিকত চলাওক',
        '▶ টিপক (বা Cmd/Ctrl+F5)। প্ৰগ্ৰামটো এডিটৰৰ ভিতৰৰ টাৰ্মিনেলত চলে; সোধাই আপোনাৰ উত্তৰলৈ ৰয়, আৰু Ctrl+C য়ে ৰখায়। আন একো ইনষ্টল কৰিব নালাগে।',
      ],
      [
        'Python ত দেখুওৱা',
        'একেটা প্ৰগ্ৰাম Python ত কাষতে চাওক, লিখোঁতেই সলনি হয়। ই হুবহু একে ফলাফল দিয়ে, আৰু .py ফাইল হিচাপে ছেভ কৰিব পাৰি।',
      ],
      [
        'ছনিপেট',
        'jodi, jetialoike, fangchon, যদি বা ফাংচন লিখি Tab টিপক: যিকোনো লিপিত সাজু ব্লক পাব।',
      ],
    ],
    shots: [
      ['overview', 'প্ৰগ্ৰাম চলাওক, টাৰ্মিনেলত প্ৰশ্নৰ উত্তৰ দিয়ক, আৰু সহায়ৰ বাবে মূল শব্দত হভাৰ কৰক।'],
      ['errors', 'লিখোঁতেই ভুলৰ তলত ৰেখা পৰে, ভুলৰ ক’ড আৰু স্পষ্ট বাৰ্তাৰ সৈতে।'],
      ['python', 'Python ত দেখুওৱা: একেটা প্ৰগ্ৰাম Python ত, কাষে কাষে।'],
    ],
    shotNote: 'এক্সটেনশ্যনৰ নিজৰ ৰং, বাৰ্তা আৰু Python অনুবাদেৰে বনোৱা পূৰ্বদৰ্শন।',
    installTitle: 'ইনষ্টল',
    installSteps: published
      ? [
          'VS Code ত Extensions view খোলক (Cmd/Ctrl+Shift+X)।',
          '“Asomiya” বিচাৰক আৰু Install টিপক।',
          '.asom ত শেষ হোৱা এটা ফাইল বনাওক আৰু লিখিবলৈ আৰম্ভ কৰক।',
        ]
      : [
          '{VSIX} ডাউনলোড কৰক।',
          'VS Code ত Extensions view খোলক (Cmd/Ctrl+Shift+X), ওপৰৰ ⋯ টিপক আৰু “Install from VSIX…” বাছক।',
          'ডাউনলোড কৰা ফাইলটো বাছক। তাৰ পিছত .asom ত শেষ হোৱা এটা ফাইল বনাই লিখিবলৈ আৰম্ভ কৰক।',
        ],
    cursorNote: 'Cursor, Windsurf আৰু VSCodium তো একেদৰে চলে (সিহঁতে Open VSX ব্যৱহাৰ কৰে)।',
    firstTitle: 'আপোনাৰ প্ৰথম প্ৰগ্ৰাম',
    commandsTitle: 'কমাণ্ড আৰু শ্বৰ্টকাট',
    commands: [
      ['Asomiya: Run Program', 'এডিটৰৰ শিৰোনামত ▶ · Cmd/Ctrl+F5'],
      ['Asomiya: Stop Program', 'টাৰ্মিনেলত Ctrl+C'],
      ['Asomiya: Show in Python', 'এডিটৰৰ শিৰোনামত split আইকন'],
      ['Asomiya: Save Python Version As…', 'Python view ৰ শিৰোনামত'],
    ],
    settingsTitle: 'ছেটিংছ',
    settings: [
      ['asomiya.errorLanguage', 'as', 'ভুলৰ বাৰ্তা অসমীয়াত (as) বা ইংৰাজীত (en)।'],
      [
        'asomiya.digits',
        'auto',
        'সংখ্যা ১২৩, 123, বা auto (ইংৰাজী আখৰৰ প্ৰগ্ৰামত 123) হিচাপে ছপা কৰক।',
      ],
      ['asomiya.checkAsYouType', 'true', 'লিখোঁতেই ভুলৰ তলত ৰেখা দিয়ক।'],
    ],
    safeTitle: 'নিৰাপদকৈ নিৰ্মিত',
    safe: [
      'ভুল বিচাৰোঁতে কেৱল আপোনাৰ ক’ড পঢ়ে; ▶ নিটিপালৈকে একো নচলে।',
      'অসমীয়া প্ৰগ্ৰামে আপোনাৰ ফাইল বা নেটৱৰ্ক চুব নোৱাৰে, আৰু চলি থকা প্ৰগ্ৰাম সদায় ৰখাব পাৰি।',
      'কোনো নিৰ্ভৰতা নাই, কোনো তথ্য সংগ্ৰহ নাই, প্ৰায় ৬০ KB।',
    ],
    historyTitle: 'সংস্কৰণৰ ইতিহাস',
    history: [
      'প্ৰথম সংস্কৰণ: ছিনটেক্সৰ ৰং, লিখোঁতেই ভুল, হভাৰ সহায়, সম্পূৰ্ণকৰণ, ইনপুটসহ চলোৱা, Python ত দেখুওৱা, আৰু দুয়োটা লিপিত ছনিপেট।',
    ],
    side: {
      categories: 'শ্ৰেণী',
      tags: 'টেগ',
      worksWith: 'য’ত চলে',
      resources: 'সম্পদ',
      info: 'অধিক তথ্য',
      version: 'সংস্কৰণ',
      released: 'মুকলি কৰা',
      id: 'চিনাক্তকৰণ',
      size: 'আকাৰ',
      deps: 'নিৰ্ভৰতা',
      none: 'নাই',
      source: 'উৎস ক’ড',
      changelog: 'সলনিৰ তালিকা',
      license: 'অনুজ্ঞাপত্ৰ',
      issue: 'সমস্যা জনাওক',
      language: 'ভাষাটো',
    },
    tags: ['assamese', 'অসমীয়া', 'education', 'beginners', 'python'],
    editors: ['VS Code ' + X.engine + ' বা নতুন', 'Cursor', 'Windsurf', 'VSCodium'],
  },
};

const FIRST = {
  as: 'ধৰা নাম = সোধা("আপোনাৰ নাম কি? ")\nকোৱা("নমস্কাৰ, " + নাম + "!")',
  roman: 'dhora naam = xudha("Apunar naam ki? ")\nkowa("Nomoskar, " + naam + "!")',
};

function body(lang) {
  const s = S[lang];
  const fill = (text) =>
    esc(text).replace('{VSIX}', ext(X.vsix, `asomiya-vscode-${X.version}.vsix`));
  const installHref = published ? X.marketplace : X.vsix;
  return (h) => `
<div class="ext">
  <nav class="ext-crumbs" aria-label="Breadcrumb">${s.crumbs
    .map((c, i) => (i === 0 ? `<a href="${h.link('')}">${esc(c)}</a>` : `<span>${esc(c)}</span>`))
    .join('<span aria-hidden="true">›</span>')}</nav>

  <header class="ext-head">
    <img class="ext-icon" src="${h.asset('assets/extension/icon.png')}" width="128" height="128" alt="">
    <div class="ext-meta">
      <h1>${esc(s.title)}</h1>
      <p class="ext-by">
        <a href="${h.link('')}">${esc(s.publisher)}</a><span class="ext-verified" title="asomiya.codes">${icon('check')}asomiya.codes</span>
        <span class="ext-sep">|</span><span>v${esc(X.version)}</span>
        <span class="ext-sep">|</span><span>${esc(s.free)}</span>
        <span class="ext-sep">|</span><span>${esc(s.openSource)}</span>
      </p>
      <p class="ext-tagline">${esc(s.tagline)}</p>
      <div class="ext-actions">
        <a class="btn btn-primary" href="${installHref}" ${published ? 'target="_blank" rel="noopener noreferrer"' : ''}>${icon('download')}${esc(published ? s.install : s.download)}</a>
        ${published && X.openVsx ? `<a class="btn btn-secondary" href="${X.openVsx}" target="_blank" rel="noopener noreferrer">Open VSX</a>` : ''}
        <a class="btn btn-secondary" href="${X.source}" target="_blank" rel="noopener noreferrer">${icon('github')}GitHub</a>
      </div>
      ${published ? '' : `<p class="ext-soon">${esc(s.soon)}</p>`}
    </div>
  </header>

  <nav class="ext-tabs" aria-label="${esc(s.title)}">
    <a href="#overview" class="on">${esc(s.tabs[0])}</a><a href="#install">${esc(s.tabs[1])}</a><a href="#history">${esc(s.tabs[2])}</a>
  </nav>

  <div class="ext-body">
    <article class="ext-main" id="overview">
      <p class="lead">${esc(s.intro)}</p>
      <figure class="ext-shot">
        <img src="${h.asset('assets/extension/overview.png')}" width="1200" height="720" alt="${esc(s.shots[0][1])}" loading="lazy">
        <figcaption>${esc(s.shots[0][1])}</figcaption>
      </figure>
      <ul class="ext-features">${s.features
        .map(([t, d]) => `<li><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`)
        .join('')}</ul>
      ${s.shots
        .slice(1)
        .map(
          ([name, cap]) => `<figure class="ext-shot">
        <img src="${h.asset(`assets/extension/${name}.png`)}" width="1200" height="720" alt="${esc(cap)}" loading="lazy">
        <figcaption>${esc(cap)}</figcaption>
      </figure>`,
        )
        .join('')}
      <p class="muted ext-note">${esc(s.shotNote)}</p>

      <h2 id="install">${esc(s.installTitle)}</h2>
      <ol class="join-list">${s.installSteps.map((i) => `<li>${fill(i)}</li>`).join('')}</ol>
      <p class="muted">${esc(s.cursorNote)}</p>

      <h2 id="first-program">${esc(s.firstTitle)}</h2>
      ${h.example(FIRST.as, FIRST.roman, { stdin: 'Ananya' })}

      <h2 id="commands">${esc(s.commandsTitle)}</h2>
      <div class="table-wrap"><table><tbody>${s.commands
        .map(([c, w]) => `<tr><td><code>${esc(c)}</code></td><td>${esc(w)}</td></tr>`)
        .join('')}</tbody></table></div>

      <h2 id="settings">${esc(s.settingsTitle)}</h2>
      <div class="table-wrap"><table><tbody>${s.settings
        .map(
          ([k, d, t]) =>
            `<tr><td><code>${esc(k)}</code></td><td><code>${esc(d)}</code></td><td>${esc(t)}</td></tr>`,
        )
        .join('')}</tbody></table></div>

      <h2 id="safe">${esc(s.safeTitle)}</h2>
      <ul class="join-list">${s.safe.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>

      <h2 id="history">${esc(s.historyTitle)}</h2>
      <div class="ext-version"><p><strong>${esc(X.version)}</strong> <span class="muted">${esc(X.released)}</span></p>
      <ul class="join-list">${s.history.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>
    </article>

    <aside class="ext-side">
      <section><h2>${esc(s.side.categories)}</h2><p class="ext-chips">${X.categories
        .map((c) => `<span>${esc(c)}</span>`)
        .join('')}</p></section>
      <section><h2>${esc(s.side.tags)}</h2><p class="ext-chips">${s.tags
        .map((c) => `<span>${esc(c)}</span>`)
        .join('')}</p></section>
      <section><h2>${esc(s.side.worksWith)}</h2><ul>${s.editors
        .map((e) => `<li>${esc(e)}</li>`)
        .join('')}</ul></section>
      <section><h2>${esc(s.side.resources)}</h2><ul>
        <li>${ext(X.source, esc(s.side.source))}</li>
        <li>${ext(X.changelog, esc(s.side.changelog))}</li>
        <li>${ext(`${SITE.repo}/blob/main/LICENSE`, esc(s.side.license))}</li>
        <li>${ext(`${SITE.repo}/issues/new`, esc(s.side.issue))}</li>
        <li><a href="${h.link('learn/')}">${esc(s.side.language)}</a></li>
      </ul></section>
      <section><h2>${esc(s.side.info)}</h2><dl class="ext-info">
        <div><dt>${esc(s.side.version)}</dt><dd>${esc(X.version)}</dd></div>
        <div><dt>${esc(s.side.released)}</dt><dd>${esc(X.released)}</dd></div>
        <div><dt>${esc(s.side.id)}</dt><dd><code>${esc(X.id)}</code></dd></div>
        <div><dt>${esc(s.side.size)}</dt><dd>~60 KB</dd></div>
        <div><dt>${esc(s.side.deps)}</dt><dd>${esc(s.side.none)}</dd></div>
      </dl></section>
    </aside>
  </div>
</div>`;
}

export const EXTENSION_PAGE = {
  id: 'extension',
  path: 'extension/',
  section: 'community',
  layout: 'page',
  title: { en: 'VS Code extension', as: 'VS Code এক্সটেনশ্যন' },
  description: {
    en: 'Asomiya for VS Code, Cursor and VSCodium: syntax colours for Assamese code, errors as you type, hover help, a Run button and Show in Python.',
    as: 'VS Code, Cursor আৰু VSCodium ৰ বাবে অসমীয়া: অসমীয়া ক’ডৰ ৰং, লিখোঁতেই ভুল, হভাৰ সহায়, চলোৱা বুটাম আৰু Python ত দেখুওৱা।',
  },
  body: { en: body('en'), as: body('as') },
};
