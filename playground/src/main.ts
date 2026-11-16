import {
  BUILTIN_NAMES,
  KEYWORD_GLOSSARY,
  type DigitStyle,
  type MessageLanguage,
} from '../../src/index';
import { EXAMPLES } from './examples';
import { runProgram } from './runner';
import { fromHash, toHash } from './share';

const STORAGE_KEY = 'asomiya-playground-source';

const BUILTIN_HELP: Readonly<Record<keyof typeof BUILTIN_NAMES, string>> = {
  length: 'length of text or a list',
  typeOf: 'type name of a value',
  toNumber: 'text → number (খালী if not a number)',
  toText: 'any value → text',
  toInteger: 'drop the fractional part',
  append: 'add a value to the end of a list',
  input: 'read one line from the input box',
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
const stdin = element('stdin', HTMLTextAreaElement);
const output = element('output', HTMLPreElement);
const status = element('status', HTMLSpanElement);
const runButton = element('run', HTMLButtonElement);
const shareButton = element('share', HTMLButtonElement);
const examples = element('examples', HTMLSelectElement);
const langSelect = element('lang', HTMLSelectElement);
const digitsSelect = element('digits', HTMLSelectElement);
const keywordList = element('keywords', HTMLElement);

function readStorage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode or blocked storage: remembering the draft is only a convenience.
  }
}

function setStatus(text: string, kind: 'ok' | 'fail' | 'idle'): void {
  status.textContent = text;
  status.className = `status ${kind === 'idle' ? '' : kind}`;
}

function showPlaceholder(): void {
  const span = document.createElement('span');
  span.className = 'placeholder';
  span.textContent = 'ফলাফল ইয়াত দেখা যাব। “চলাওক” টিপক।';
  output.replaceChildren(span);
}

function run(): void {
  runButton.disabled = true;
  setStatus('চলি আছে…', 'idle');
  // Let the browser paint the "running" state before the (synchronous) interpreter starts.
  requestAnimationFrame(() => {
    setTimeout(() => {
      const started = performance.now();
      const lang: MessageLanguage = langSelect.value === 'en' ? 'en' : 'as';
      const digits: DigitStyle = digitsSelect.value === 'ascii' ? 'ascii' : 'assamese';
      const result = runProgram(editor.value, { lang, digits, stdin: stdin.value });
      const ms = Math.round(performance.now() - started);

      const nodes: Node[] = [document.createTextNode(result.output)];
      if (result.error !== null) {
        const err = document.createElement('span');
        err.className = 'err';
        err.textContent = result.error;
        nodes.push(err);
      }
      if (result.output === '' && result.error === null) {
        const span = document.createElement('span');
        span.className = 'placeholder';
        span.textContent = '(প্ৰগ্ৰামটোৱে একো ছপা নকৰিলে)';
        nodes.push(span);
      }
      output.replaceChildren(...nodes);
      if (result.error === null) setStatus(`✓ সম্পূৰ্ণ · ${ms} ms`, 'ok');
      else setStatus('✗ ভুল', 'fail');
      runButton.disabled = false;
    }, 0);
  });
}

function loadExample(index: number): void {
  const example = EXAMPLES[index];
  if (example === undefined) return;
  editor.value = example.source;
  stdin.value = example.stdin;
  writeStorage(editor.value);
  showPlaceholder();
  setStatus('', 'idle');
}

function insertAtCursor(text: string): void {
  const { selectionStart, selectionEnd, value } = editor;
  editor.value = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
  editor.selectionStart = editor.selectionEnd = selectionStart + text.length;
  writeStorage(editor.value);
}

async function share(): Promise<void> {
  const url = `${location.origin}${location.pathname}${toHash(editor.value)}`;
  history.replaceState(null, '', url);
  try {
    await navigator.clipboard.writeText(url);
    setStatus('🔗 লিংক কপি কৰা হ’ল', 'ok');
  } catch {
    setStatus('🔗 লিংকটো ঠিকনা-বাৰত আছে', 'ok');
  }
}

function buildCheatsheet(): void {
  const entries: [string, string][] = [
    ...KEYWORD_GLOSSARY.map((k): [string, string] => [k.word, k.concept]),
    ...Object.keys(BUILTIN_NAMES)
      .filter(isBuiltinKey)
      .map((key): [string, string] => [`${BUILTIN_NAMES[key]}()`, BUILTIN_HELP[key]]),
  ];
  const nodes: HTMLElement[] = [];
  for (const [word, meaning] of entries) {
    const dt = document.createElement('dt');
    dt.textContent = word;
    dt.title = 'Insert';
    dt.addEventListener('click', () => {
      editor.focus();
      insertAtCursor(word);
    });
    const dd = document.createElement('dd');
    dd.textContent = meaning;
    nodes.push(dt, dd);
  }
  keywordList.replaceChildren(...nodes);
}

function init(): void {
  EXAMPLES.forEach((example, i) => {
    examples.add(new Option(example.label, String(i)));
  });
  examples.addEventListener('change', () => {
    loadExample(Number(examples.value));
  });

  const shared = fromHash(location.hash);
  const saved = readStorage();
  if (shared !== null) {
    editor.value = shared;
  } else if (saved !== null && saved.trim() !== '') {
    editor.value = saved;
  } else {
    loadExample(0);
  }
  showPlaceholder();
  buildCheatsheet();

  editor.addEventListener('input', () => {
    writeStorage(editor.value);
  });
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
  shareButton.addEventListener('click', () => {
    void share();
  });
  editor.focus();
}

init();
