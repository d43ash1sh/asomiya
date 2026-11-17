// The playground page. The editor itself is driven by src/client/playground.ts.
import { BUILTIN_NAMES, KEYWORD_GLOSSARY } from '../../dist/index.js';
import { esc } from '../lib/html.mjs';
import { icon } from '../lib/icons.mjs';

const S = {
  en: {
    examples: 'Examples…',
    run: 'Run',
    stop: 'Stop',
    share: 'Share',
    clear: 'Clear',
    output: 'Output',
    input: 'Input',
    inputHint: 'সোধা / xudha reads one line per call',
    inputPlaceholder: 'One answer per line…',
    errors: 'Errors',
    digits: 'Digits',
    auto: 'Auto',
    keywords: 'Keywords',
    keywordsHint: 'Click to insert',
    editorLabel: 'Program source',
    noscript: 'The playground needs JavaScript.',
  },
  as: {
    examples: 'উদাহৰণ…',
    run: 'চলাওক',
    stop: 'ৰখাওক',
    share: 'শ্বেয়াৰ',
    clear: 'মচক',
    output: 'ফলাফল',
    input: 'ইনপুট',
    inputHint: 'সোধা-ই প্ৰতিবাৰ এটা শাৰী পঢ়ে',
    inputPlaceholder: 'প্ৰতি শাৰীত এটা উত্তৰ…',
    errors: 'ভুলৰ ভাষা',
    digits: 'অংক',
    auto: 'স্বয়ংক্ৰিয়',
    keywords: 'মূল শব্দ',
    keywordsHint: 'ক্লিক কৰিলে এডিটৰত সোমাব',
    editorLabel: 'প্ৰগ্ৰাম',
    noscript: 'প্লেগ্ৰাউণ্ডৰ বাবে JavaScript লাগিব।',
  },
};

function chips(lang) {
  const words = KEYWORD_GLOSSARY.map((k) => [lang === 'as' ? k.word : `${k.roman[0]}`, k.concept]);
  const builtins = Object.values(BUILTIN_NAMES).map((name) => [`${name}()`, '']);
  return [...words, ...builtins]
    .map(
      ([word, title]) =>
        `<button type="button" class="chip" data-insert="${esc(word)}" title="${esc(title)}">${esc(word)}</button>`,
    )
    .join('');
}

function body(lang) {
  const s = S[lang];
  return () => `
<div class="pg">
  <noscript><p class="pg-noscript">${s.noscript}</p></noscript>
  <div class="pg-toolbar">
    <label class="select"><span class="visually-hidden">${s.examples}</span>
      <select id="examples"><option value="" disabled>${s.examples}</option></select>
    </label>
    <div class="pg-spacer"></div>
    <button id="share" class="btn btn-ghost btn-sm" type="button">${icon('share')}<span>${s.share}</span></button>
    <button id="run" class="btn btn-primary btn-sm" type="button" title="Ctrl/⌘ + Enter">${icon('play')}<span>${s.run}</span></button>
    <button id="stop" class="btn btn-danger btn-sm" type="button" hidden>${icon('stop')}<span>${s.stop}</span></button>
  </div>
  <div class="pg-main">
    <section class="pg-editor" aria-label="${s.editorLabel}">
      <div class="pg-file"><span class="file-dot" aria-hidden="true"></span>program.asom</div>
      <div class="editor">
        <div id="gutter" class="gutter" aria-hidden="true"></div>
        <textarea id="editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${s.editorLabel}"></textarea>
      </div>
    </section>
    <aside class="pg-side">
      <section class="pg-panel pg-output">
        <div class="pg-panel-head">
          <h2>${s.output}</h2>
          <span id="status" class="status" aria-live="polite" hidden></span>
          <div class="pg-spacer"></div>
          <label class="mini-select" title="${s.errors}"><span class="visually-hidden">${s.errors}</span>
            <select id="error-lang"><option value="en">EN</option><option value="as">অ</option></select>
          </label>
          <label class="mini-select" title="${s.digits}"><span class="visually-hidden">${s.digits}</span>
            <select id="digits"><option value="auto">${s.auto}</option><option value="assamese">০-৯</option><option value="ascii">0-9</option></select>
          </label>
          <button id="clear" class="btn btn-ghost btn-xs" type="button">${s.clear}</button>
        </div>
        <pre id="output" class="output" aria-live="polite"></pre>
      </section>
      <details class="pg-panel" open>
        <summary><span>${s.input}</span><small>${s.inputHint}</small></summary>
        <textarea id="stdin" class="stdin" spellcheck="false" rows="3" placeholder="${s.inputPlaceholder}" aria-label="${s.input}"></textarea>
      </details>
      <details class="pg-panel">
        <summary><span>${s.keywords}</span><small>${s.keywordsHint}</small></summary>
        <div class="chips">${chips(lang)}</div>
      </details>
    </aside>
  </div>
</div>`;
}

export const PLAYGROUND = {
  id: 'playground',
  path: 'playground/',
  section: 'playground',
  layout: 'playground',
  title: { en: 'Playground', as: 'প্লেগ্ৰাউণ্ড' },
  description: {
    en: 'Write and run Asomiya programs in your browser. No installation needed.',
    as: 'ব্ৰাউজাৰতে অসমীয়া প্ৰগ্ৰাম লিখক আৰু চলাওক। একো ইনষ্টল কৰিব নালাগে।',
  },
  body: { en: body('en'), as: body('as') },
};
