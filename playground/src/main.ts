import {
  BUILTIN_NAMES,
  KEYWORD_GLOSSARY,
  type DigitSetting,
  type MessageLanguage,
} from '../../src/index';
import { EXAMPLES } from './examples';
import { runProgram } from './runner';
import { fromHash, toHash } from './share';

const SOURCE_KEY = 'asomiya-playground-source';
const THEME_KEY = 'asomiya-playground-theme';

const BUILTIN_HELP: Readonly<Record<keyof typeof BUILTIN_NAMES, string>> = {
  length: 'length',
  typeOf: 'type',
  toNumber: 'to number',
  toText: 'to text',
  toInteger: 'truncate',
  append: 'append',
  input: 'read input',
};

function isBuiltinKey(key: string): key is keyof typeof BUILTIN_NAMES {
  return key in BUILTIN_NAMES;
}

function element<T extends HTMLElement>(id: string, type: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) throw new Error(`#${id} is missing`);
  return el;
}

const editor = element('editor', HTMLTextAreaElement);
const gutter = element('gutter', HTMLDivElement);
const stdin = element('stdin', HTMLTextAreaElement);
const output = element('output', HTMLPreElement);
const status = element('status', HTMLSpanElement);
const runButton = element('run', HTMLButtonElement);
const shareButton = element('share', HTMLButtonElement);
const clearButton = element('clear', HTMLButtonElement);
const themeButton = element('theme', HTMLButtonElement);
const examples = element('examples', HTMLSelectElement);
const keywordList = element('keywords', HTMLDivElement);

// ── storage (a convenience only: it may be unavailable) ───────────────────

function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage.
  }
}

// ── settings ──────────────────────────────────────────────────────────────

function radioValue(name: string): string | null {
  const checked = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return checked?.value ?? null;
}

function currentLang(): MessageLanguage {
  return radioValue('lang') === 'en' ? 'en' : 'as';
}

function currentDigits(): DigitSetting {
  const value = radioValue('digits');
  return value === 'ascii' || value === 'assamese' ? value : 'auto';
}

// ── output ────────────────────────────────────────────────────────────────

function setStatus(text: string, kind: 'ok' | 'fail' | 'busy' | null): void {
  status.hidden = kind === null;
  status.textContent = text;
  status.className = `pill ${kind === 'ok' || kind === 'fail' ? kind : ''}`;
}

function placeholder(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'placeholder';
  span.textContent = text;
  return span;
}

function clearOutput(): void {
  output.replaceChildren(placeholder('▶ চলাওক টিপিলে ফলাফল ইয়াত দেখা যাব।'));
  setStatus('', null);
}

function run(): void {
  runButton.disabled = true;
  setStatus('চলি আছে…', 'busy');
  // Let the browser paint the busy state before the synchronous interpreter starts.
  requestAnimationFrame(() => {
    setTimeout(() => {
      const started = performance.now();
      const result = runProgram(editor.value, {
        lang: currentLang(),
        digits: currentDigits(),
        stdin: stdin.value,
      });
      const ms = Math.round(performance.now() - started);

      const nodes: Node[] = [];
      if (result.output !== '') nodes.push(document.createTextNode(result.output));
      if (result.error !== null) {
        const err = document.createElement('span');
        err.className = 'err';
        err.textContent = result.error;
        nodes.push(err);
      }
      if (nodes.length === 0) nodes.push(placeholder('(প্ৰগ্ৰামটোৱে একো ছপা নকৰিলে)'));
      output.replaceChildren(...nodes);

      if (result.error === null) setStatus(`✓ ${ms} ms`, 'ok');
      else setStatus('✗ ভুল', 'fail');
      runButton.disabled = false;
    }, 0);
  });
}

// ── editor ────────────────────────────────────────────────────────────────

let gutterLines = 0;

function renderGutter(): void {
  const count = editor.value.split('\n').length;
  if (count === gutterLines) return;
  gutterLines = count;
  gutter.textContent = Array.from({ length: count }, (_, i) => String(i + 1)).join('\n');
}

function syncScroll(): void {
  gutter.scrollTop = editor.scrollTop;
}

function setSource(source: string): void {
  editor.value = source;
  renderGutter();
  syncScroll();
}

function insertAtCursor(text: string): void {
  const { selectionStart, selectionEnd, value } = editor;
  editor.value = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
  editor.selectionStart = editor.selectionEnd = selectionStart + text.length;
  renderGutter();
  syncExampleMenu();
  save(SOURCE_KEY, editor.value);
}

/** Shows the example the editor holds in the menu, or the neutral entry for the user's own code. */
function syncExampleMenu(): void {
  const index = EXAMPLES.findIndex((e) => e.source === editor.value);
  examples.value = index === -1 ? '' : String(index);
}

function loadExample(index: number): void {
  const example = EXAMPLES[index];
  if (example === undefined) return;
  setSource(example.source);
  stdin.value = example.stdin;
  save(SOURCE_KEY, editor.value);
  clearOutput();
}

// ── share & theme ─────────────────────────────────────────────────────────

async function share(): Promise<void> {
  const url = `${location.origin}${location.pathname}${toHash(editor.value)}`;
  history.replaceState(null, '', url);
  try {
    await navigator.clipboard.writeText(url);
    setStatus('🔗 লিংক কপি হ’ল', 'ok');
  } catch {
    setStatus('🔗 লিংক ঠিকনা-বাৰত আছে', 'ok');
  }
}

function applyTheme(theme: string | null): void {
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset['theme'] = theme;
  else delete document.documentElement.dataset['theme'];
}

function toggleTheme(): void {
  const explicit = document.documentElement.dataset['theme'];
  const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = explicit === 'dark' || (explicit === undefined && systemDark);
  const next = isDark ? 'light' : 'dark';
  applyTheme(next);
  save(THEME_KEY, next);
}

// ── reference chips ───────────────────────────────────────────────────────

function chip(word: string, meaning: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chip';
  button.title = `Insert ${word}`;
  const code = document.createElement('code');
  code.textContent = word;
  const span = document.createElement('span');
  span.textContent = meaning;
  button.append(code, span);
  button.addEventListener('click', () => {
    editor.focus();
    insertAtCursor(word);
  });
  return button;
}

function buildReference(): void {
  const keywords = KEYWORD_GLOSSARY.map((k) =>
    chip(k.word, k.roman[0] === undefined ? k.concept : `${k.concept} · ${k.roman[0]}`),
  );
  const builtins = Object.keys(BUILTIN_NAMES)
    .filter(isBuiltinKey)
    .map((key) => chip(`${BUILTIN_NAMES[key]}()`, BUILTIN_HELP[key]));
  keywordList.replaceChildren(...keywords, ...builtins);
}

// ── start-up ──────────────────────────────────────────────────────────────

function init(): void {
  applyTheme(load(THEME_KEY));

  const prompt = new Option('উদাহৰণ…', '');
  prompt.disabled = true;
  examples.add(prompt);
  EXAMPLES.forEach((example, i) => {
    examples.add(new Option(example.label, String(i)));
  });

  const shared = fromHash(location.hash);
  const saved = load(SOURCE_KEY);
  if (shared !== null) setSource(shared);
  else if (saved !== null && saved.trim() !== '') setSource(saved);
  else loadExample(0);
  syncExampleMenu();
  clearOutput();
  buildReference();

  // Show the run shortcut for this platform.
  const kbd = runButton.querySelector('.kbd');
  if (kbd !== null && !/Mac|iPhone|iPad/.test(navigator.userAgent)) kbd.textContent = 'Ctrl↵';

  examples.addEventListener('change', () => {
    loadExample(Number(examples.value));
  });
  editor.addEventListener('input', () => {
    renderGutter();
    syncExampleMenu();
    save(SOURCE_KEY, editor.value);
  });
  editor.addEventListener('scroll', syncScroll);
  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      insertAtCursor('    ');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      run();
    }
  });
  runButton.addEventListener('click', run);
  clearButton.addEventListener('click', clearOutput);
  themeButton.addEventListener('click', toggleTheme);
  shareButton.addEventListener('click', () => {
    void share();
  });
  editor.focus();
}

init();
