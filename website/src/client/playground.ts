// The playground page: editor, examples, input box, and running code in a Web Worker.
import type { DigitSetting, MessageLanguage } from '../../../src/index';
import { EXAMPLES } from '../playground/examples';
import { highlightPython, splitPython } from '../playground/python-highlight';
import { fromHash, toHash } from '../playground/share';
import type { PythonRequest, PythonResponse, RunRequest, RunResponse } from './protocol';
import { load, save } from './storage';

const SOURCE_KEY = 'asomiya-playground-source';
const PYTHON_KEY = 'asomiya-playground-python';
/** Wait this long after the last keystroke before translating again. */
const PYTHON_DELAY_MS = 250;
/** A program still running after this long is stopped (the step budget usually ends it first). */
const RUN_TIMEOUT_MS = 15_000;

const UI = {
  en: {
    running: 'Running…',
    done: (ms: number) => `✓ Done in ${ms} ms`,
    failed: '✗ Error',
    stopped: '■ Stopped',
    timeout: '■ Stopped: the program ran too long',
    empty: '(The program printed nothing)',
    idle: 'Press Run (Ctrl/⌘ + Enter) to see the output here.',
    copied: '🔗 Link copied',
    inAddressBar: '🔗 Link is in the address bar',
    tooLong: 'This program is too long to share as a link.',
    pyFix: 'Fix this error to see the Python version:',
    pyCopied: 'Copied',
    helpers: (n: number) => `Helper functions (${n} lines, included when you copy or download)`,
    noHelpers: 'No helper functions needed: this is plain Python.',
  },
  as: {
    running: 'চলি আছে…',
    done: (ms: number) => `✓ ${ms} ms ত শেষ হ'ল`,
    failed: '✗ ভুল',
    stopped: '■ ৰখোৱা হ’ল',
    timeout: '■ ৰখোৱা হ’ল: প্ৰগ্ৰামটো বহু সময় চলিল',
    empty: '(প্ৰগ্ৰামটোৱে একো ছপা নকৰিলে)',
    idle: 'ফলাফল চাবলৈ চলাওক টিপক (Ctrl/⌘ + Enter)।',
    copied: '🔗 লিংক কপি হ’ল',
    inAddressBar: '🔗 লিংকটো ঠিকনা-বাৰত আছে',
    tooLong: 'প্ৰগ্ৰামটো লিংক হিচাপে পঠিয়াবলৈ অতি দীঘল।',
    pyFix: 'Python ৰূপটো চাবলৈ এই ভুলটো শুধৰাওক:',
    pyCopied: 'কপি হ’ল',
    helpers: (n: number) => `সহায়ক ফাংচন (${n} শাৰী, কপি বা ডাউনলোড কৰিলে সৈতে থাকে)`,
    noHelpers: 'কোনো সহায়ক ফাংচন নালাগে: এইটো সাধাৰণ Python।',
  },
} as const;

const pageLang = document.documentElement.lang === 'as' ? 'as' : 'en';
const t = UI[pageLang];

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
const stopButton = element('stop', HTMLButtonElement);
const shareButton = element('share', HTMLButtonElement);
const clearButton = element('clear', HTMLButtonElement);
const examples = element('examples', HTMLSelectElement);
const errorLang = element('error-lang', HTMLSelectElement);
const digits = element('digits', HTMLSelectElement);
const main = element('pg-main', HTMLDivElement);
const pythonToggle = element('python-toggle', HTMLButtonElement);
const pythonPane = element('python-pane', HTMLElement);
const pythonCode = element('python-code', HTMLElement);
const pythonHelpers = element('python-helpers', HTMLDetailsElement);
const pythonHelpersLabel = element('python-helpers-label', HTMLSpanElement);
const pythonHelpersCode = element('python-helpers-code', HTMLElement);
const pythonCopy = element('python-copy', HTMLButtonElement);
const pythonDownload = element('python-download', HTMLButtonElement);
const pythonClose = element('python-close', HTMLButtonElement);

// ── running ───────────────────────────────────────────────────────────────

let worker: Worker | null = null;
let runId = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * worker.js sits next to this script; resolving from it works at any base path. It reuses this
 * script's ?v= fingerprint so a deploy never pairs a new page with a cached old worker.
 */
const SCRIPT_URL = new URL(
  document.currentScript instanceof HTMLScriptElement ? document.currentScript.src : location.href,
);
const WORKER_URL = new URL(`worker.js${SCRIPT_URL.search}`, SCRIPT_URL);

function getWorker(): Worker {
  if (worker !== null) return worker;
  const created = new Worker(WORKER_URL);
  created.addEventListener('message', (event: MessageEvent<RunResponse | PythonResponse>) => {
    if (event.data.kind === 'run' && event.data.id === runId) finish(event.data);
  });
  worker = created;
  return created;
}

// ── Python view ───────────────────────────────────────────────────────────

/** A separate worker, so translating never waits for a long-running program. */
let pythonWorker: Worker | null = null;
let pythonId = 0;
let pythonTimer: ReturnType<typeof setTimeout> | undefined;
/** The complete translation (helpers included), for Copy and Download. */
let pythonSource = '';

function getPythonWorker(): Worker {
  if (pythonWorker !== null) return pythonWorker;
  const created = new Worker(WORKER_URL);
  created.addEventListener('message', (event: MessageEvent<RunResponse | PythonResponse>) => {
    if (event.data.kind === 'python' && event.data.id === pythonId) showPython(event.data);
  });
  pythonWorker = created;
  return created;
}

function pythonOpen(): boolean {
  return !pythonPane.hidden;
}

function translate(): void {
  clearTimeout(pythonTimer);
  if (!pythonOpen()) return;
  pythonId += 1;
  const request: PythonRequest = {
    kind: 'python',
    id: pythonId,
    source: editor.value,
    lang: errorLang.value === 'as' ? 'as' : 'en',
    digits: digitSetting(),
  };
  getPythonWorker().postMessage(request);
}

function translateSoon(): void {
  clearTimeout(pythonTimer);
  if (pythonOpen()) pythonTimer = setTimeout(translate, PYTHON_DELAY_MS);
}

/** Highlighted code, built from text nodes only (never HTML). */
function renderPython(target: HTMLElement, code: string): void {
  target.replaceChildren(
    ...highlightPython(code).map((token) => {
      if (token.cls === '') return document.createTextNode(token.text);
      const span = document.createElement('span');
      span.className = token.cls;
      span.textContent = token.text;
      return span;
    }),
  );
}

function showPython(result: PythonResponse): void {
  const ready = result.python !== null;
  pythonCopy.disabled = !ready;
  pythonDownload.disabled = !ready;
  if (result.python === null) {
    pythonSource = '';
    const note = document.createElement('span');
    note.className = 'placeholder';
    note.textContent = t.pyFix + '\n\n';
    const err = document.createElement('span');
    err.className = 'error';
    err.textContent = result.error ?? '';
    pythonCode.replaceChildren(note, err);
    pythonHelpers.hidden = true;
    return;
  }
  pythonSource = result.python;
  const { helpers, program } = splitPython(result.python);
  renderPython(pythonCode, program);
  const helperLines = helpers.split('\n').filter((line) => line.trim() !== '').length;
  const needsHelpers = /\ndef |\nclass /.test(helpers);
  pythonHelpers.hidden = false;
  pythonHelpersLabel.textContent = needsHelpers ? t.helpers(helperLines) : t.noHelpers;
  pythonHelpers.classList.toggle('is-empty', !needsHelpers);
  if (!needsHelpers) pythonHelpers.open = false;
  renderPython(pythonHelpersCode, helpers);
}

function setPythonOpen(open: boolean): void {
  pythonPane.hidden = !open;
  main.classList.toggle('with-python', open);
  pythonToggle.setAttribute('aria-pressed', String(open));
  save(PYTHON_KEY, open ? '1' : '0');
  if (open) translate();
}

function copyPython(): void {
  if (pythonSource === '') return;
  const label = pythonCopy.querySelector('span');
  const before = label?.textContent ?? '';
  navigator.clipboard.writeText(pythonSource).then(
    () => {
      if (label) label.textContent = t.pyCopied;
      setTimeout(() => {
        if (label) label.textContent = before;
      }, 1500);
    },
    () => undefined,
  );
}

function downloadPython(): void {
  if (pythonSource === '') return;
  const url = URL.createObjectURL(
    new Blob([pythonSource], { type: 'text/x-python;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'program.py';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function setStatus(text: string, kind: 'ok' | 'fail' | 'busy' | null): void {
  status.hidden = kind === null;
  status.textContent = text;
  status.dataset['kind'] = kind ?? '';
}

function placeholder(text: string): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'placeholder';
  span.textContent = text;
  return span;
}

function setRunning(running: boolean): void {
  runButton.hidden = running;
  stopButton.hidden = !running;
}

function run(): void {
  runId += 1;
  const request: RunRequest = {
    kind: 'run',
    id: runId,
    source: editor.value,
    stdin: stdin.value,
    lang: errorLang.value === 'as' ? 'as' : ('en' satisfies MessageLanguage),
    digits: digitSetting(),
  };
  setRunning(true);
  setStatus(t.running, 'busy');
  clearTimeout(timer);
  timer = setTimeout(() => {
    stop(t.timeout);
  }, RUN_TIMEOUT_MS);
  getWorker().postMessage(request);
}

function digitSetting(): DigitSetting {
  const value = digits.value;
  return value === 'ascii' || value === 'assamese' ? value : 'auto';
}

function finish(result: RunResponse): void {
  clearTimeout(timer);
  setRunning(false);
  const nodes: Node[] = [];
  // Program output and messages are always inserted as text, never as HTML.
  if (result.output !== '') nodes.push(document.createTextNode(result.output));
  if (result.error !== null) {
    const err = document.createElement('span');
    err.className = 'error';
    err.textContent =
      (result.output === '' || result.output.endsWith('\n') ? '' : '\n') + result.error;
    nodes.push(err);
  }
  if (nodes.length === 0) nodes.push(placeholder(t.empty));
  output.replaceChildren(...nodes);
  setStatus(
    result.error === null ? t.done(result.ms) : t.failed,
    result.error === null ? 'ok' : 'fail',
  );
}

/** Terminates the worker (the only way to interrupt running code) and starts fresh next time. */
function stop(message: string = t.stopped): void {
  clearTimeout(timer);
  runId += 1;
  worker?.terminate();
  worker = null;
  setRunning(false);
  setStatus(message, 'fail');
}

function clearOutput(): void {
  output.replaceChildren(placeholder(t.idle));
  setStatus('', null);
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

function edited(): void {
  renderGutter();
  syncExampleMenu();
  save(SOURCE_KEY, editor.value);
  translateSoon();
}

function insertAtCursor(text: string): void {
  editor.setRangeText(text, editor.selectionStart, editor.selectionEnd, 'end');
  edited();
}

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
  translate();
}

async function share(): Promise<void> {
  const hash = toHash(editor.value);
  if (fromHash(hash) === null) {
    setStatus(t.tooLong, 'fail');
    return;
  }
  const url = `${location.origin}${location.pathname}${hash}`;
  history.replaceState(null, '', url);
  try {
    await navigator.clipboard.writeText(url);
    setStatus(t.copied, 'ok');
  } catch {
    setStatus(t.inAddressBar, 'ok');
  }
}

// ── start-up ──────────────────────────────────────────────────────────────

function init(): void {
  EXAMPLES.forEach((example, i) => {
    examples.add(new Option(example.label, String(i)));
  });

  // A shared link is shown but never run automatically: the visitor presses Run.
  const shared = fromHash(location.hash);
  const saved = load(SOURCE_KEY);
  if (shared !== null) setSource(shared);
  else if (saved !== null && saved.trim() !== '') setSource(saved);
  else loadExample(0);
  syncExampleMenu();
  clearOutput();
  errorLang.value = pageLang;

  examples.addEventListener('change', () => {
    loadExample(Number(examples.value));
  });
  editor.addEventListener('input', edited);
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
      if (stopButton.hidden) run();
    }
  });
  runButton.addEventListener('click', run);
  stopButton.addEventListener('click', () => {
    stop();
  });
  clearButton.addEventListener('click', clearOutput);
  shareButton.addEventListener('click', () => void share());
  pythonToggle.addEventListener('click', () => {
    setPythonOpen(!pythonOpen());
  });
  pythonClose.addEventListener('click', () => {
    setPythonOpen(false);
    pythonToggle.focus();
  });
  pythonCopy.addEventListener('click', copyPython);
  pythonDownload.addEventListener('click', downloadPython);
  digits.addEventListener('change', translate);
  errorLang.addEventListener('change', translate);
  if (load(PYTHON_KEY) === '1') setPythonOpen(true);
  for (const chip of document.querySelectorAll<HTMLButtonElement>('[data-insert]')) {
    chip.addEventListener('click', () => {
      editor.focus();
      insertAtCursor(chip.dataset['insert'] ?? '');
    });
  }
}

init();
