// The playground that MCP Apps hosts (Claude, ChatGPT, VS Code…) show next to a run_asomiya call:
// the program, highlighted and editable, and its output. "Run" runs the edited program right here
// in the sandboxed frame (the interpreter is bundled in), so it works without another tool call.
import {
  App,
  applyDocumentTheme,
  applyHostStyleVariables,
  type McpUiHostContext,
} from '@modelcontextprotocol/ext-apps';
import { BUILTIN_NAMES, BUILTIN_ROMAN } from '../../../src/language/glossary';
import { tokenize } from '../../../src/lexer/lexer';
import { highlightPython, splitPython } from '../../../website/src/playground/python-highlight';
import { runProgram, translateProgram, type RunReport } from '../runner';

function $<T extends HTMLElement>(id: string, type: new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) throw new Error(`#${id} missing`);
  return el;
}

const editor = $('code', HTMLTextAreaElement);
const painted = $('painted', HTMLPreElement);
const inputBox = $('input-box', HTMLDivElement);
const inputField = $('input', HTMLTextAreaElement);
const runButton = $('run', HTMLButtonElement);
const openButton = $('open', HTMLButtonElement);
const pythonButton = $('python', HTMLButtonElement);
const pythonBox = $('python-box', HTMLElement);
const pythonCode = $('python-code', HTMLPreElement);
const pythonNote = $('python-note', HTMLParagraphElement);
const status = $('status', HTMLSpanElement);
const output = $('output', HTMLPreElement);
const problem = $('problem', HTMLPreElement);

let playgroundUrl: string | null = null;

// ── highlighting ──

const BUILTINS = new Set<string>([
  ...Object.values(BUILTIN_NAMES),
  ...Object.values(BUILTIN_ROMAN).flat(),
]);
const LITERALS = new Set(['True', 'False', 'Null']);

function span(text: string, cls: string | null): Node {
  if (cls === null) return document.createTextNode(text);
  const el = document.createElement('span');
  el.className = cls;
  el.textContent = text;
  return el;
}

/** Text between tokens is spaces, line breaks or comments. */
function gap(text: string, into: DocumentFragment): void {
  const re = /\/\/[^\n\r]*|\/\*[\s\S]*?(?:\*\/|$)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    into.append(span(text.slice(last, m.index), null), span(m[0], 't-com'));
    last = m.index + m[0].length;
  }
  into.append(span(text.slice(last), null));
}

function paint(source: string): void {
  const out = document.createDocumentFragment();
  try {
    let at = 0;
    for (const t of tokenize(source)) {
      if (t.type === 'EOF') break;
      const { offset } = t.span.start;
      gap(source.slice(at, offset), out);
      const text = source.slice(offset, t.span.end.offset);
      let cls: string | null = null;
      if (t.type === 'String') cls = 't-str';
      else if (t.type === 'Number') cls = 't-num';
      else if (t.type === 'Identifier') cls = BUILTINS.has(t.lexeme) ? 't-fn' : null;
      else if (LITERALS.has(t.type)) cls = 't-lit';
      else if (/\p{L}/u.test(text)) cls = 't-kw';
      else if (t.type !== 'Newline') cls = 't-op';
      out.append(span(text, cls));
      at = t.span.end.offset;
    }
    gap(source.slice(at), out);
  } catch {
    // Code that doesn't lex (yet) is shown plain while it is being typed.
    out.replaceChildren(span(source, null));
  }
  // A trailing newline needs a character after it, or the last line has no height.
  out.append(span(' ', null));
  painted.replaceChildren(out);
}

function usesInput(source: string): boolean {
  try {
    const names = new Set([BUILTIN_NAMES.input, ...BUILTIN_ROMAN.input]);
    return tokenize(source).some((t) => t.type === 'Identifier' && names.has(t.lexeme));
  } catch {
    return false;
  }
}

function setCode(source: string): void {
  editor.value = source;
  refresh();
}

// ── Python view ──

const PY_CLASSES: Readonly<Record<string, string>> = {
  'tok-kw': 't-kw',
  'tok-str': 't-str',
  'tok-num': 't-num',
  'tok-lit': 't-lit',
  'tok-com': 't-com',
  'tok-call': 't-fn',
};

function showPython(): void {
  if (pythonBox.hidden) return;
  const result = translateProgram(editor.value);
  if (result.python === null) {
    pythonCode.replaceChildren(span('—', null));
    pythonNote.textContent = `Fix the error first: ${result.error?.messageEn ?? ''}`;
    return;
  }
  const { helpers, program } = splitPython(result.python);
  const out = document.createDocumentFragment();
  for (const t of highlightPython(program)) out.append(span(t.text, PY_CLASSES[t.cls] ?? null));
  pythonCode.replaceChildren(out);
  pythonNote.textContent =
    helpers === ''
      ? 'It prints exactly the same output.'
      : 'It prints exactly the same output. (A few helper functions it needs are not shown.)';
}

function refresh(): void {
  paint(editor.value);
  showPython();
  inputBox.hidden = !usesInput(editor.value) && inputField.value === '';
}

// ── results ──

function show(r: RunReport): void {
  output.textContent = r.output === '' && r.ok ? '' : r.output;
  output.classList.toggle('empty', r.output === '');
  if (r.error === null) {
    problem.hidden = true;
    problem.textContent = '';
  } else {
    problem.hidden = false;
    problem.textContent = `${r.error.formatted}\n${r.error.messageEn === r.error.message ? r.error.messageAs : r.error.messageEn}`;
  }
  status.textContent = r.ok
    ? r.outputTruncated
      ? 'চলিল · ran (output truncated)'
      : 'চলিল · ran'
    : `ভুল · error ${r.error?.code ?? ''}`;
  status.dataset.state = r.ok ? 'ok' : 'error';
  playgroundUrl = r.playgroundUrl;
  openButton.disabled = playgroundUrl === null;
}

function isRunReport(value: unknown): value is RunReport {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { ok?: unknown }).ok === 'boolean' &&
    typeof (value as { output?: unknown }).output === 'string'
  );
}

function inputLines(): string[] {
  const text = inputField.value;
  return text === '' ? [] : text.replace(/\r\n?/g, '\n').split('\n');
}

// ── host ──

const app = new App({ name: 'Asomiya playground', version: '1.0.0' }, {}, { autoResize: true });

function applyContext(ctx: McpUiHostContext | undefined): void {
  if (ctx?.theme !== undefined) applyDocumentTheme(ctx.theme);
  if (ctx?.styles?.variables !== undefined) applyHostStyleVariables(ctx.styles.variables);
}

app.addEventListener('toolinput', ({ arguments: args }) => {
  if (typeof args?.code === 'string') setCode(args.code);
  if (Array.isArray(args?.input)) {
    inputField.value = args.input.filter((l) => typeof l === 'string').join('\n');
    refresh();
  }
  status.textContent = 'চলি আছে · running…';
  status.dataset.state = 'busy';
});

app.addEventListener('toolresult', (result) => {
  if (isRunReport(result.structuredContent)) show(result.structuredContent);
  else {
    // No structured result (an older host): run it here so the output still shows.
    show(runProgram(editor.value, { input: inputLines() }));
  }
});

app.addEventListener('toolcancelled', () => {
  status.textContent = 'বাতিল · cancelled';
  status.dataset.state = 'error';
});

app.addEventListener('hostcontextchanged', applyContext);

runButton.addEventListener('click', () => {
  const source = editor.value;
  const result = runProgram(source, { input: inputLines() });
  show(result);
  // Tell the assistant what the person ran, so it can talk about the edited program.
  const summary = result.ok
    ? `Output:\n${result.output}`
    : `Error ${result.error?.code ?? ''}: ${result.error?.messageEn ?? ''}\nOutput before the error:\n${result.output}`;
  app
    .updateModelContext({
      content: [
        {
          type: 'text',
          text: `The user edited the program in the Asomiya playground and ran it.\n\n\`\`\`asomiya\n${source}\n\`\`\`\n\n${summary}`,
        },
      ],
    })
    .catch(() => {
      // Not every host supports model context updates; the run itself already worked.
    });
});

pythonButton.addEventListener('click', () => {
  pythonBox.hidden = !pythonBox.hidden;
  pythonButton.setAttribute('aria-expanded', String(!pythonBox.hidden));
  showPython();
});

openButton.addEventListener('click', () => {
  if (playgroundUrl === null) return;
  app.openLink({ url: playgroundUrl }).catch(() => {
    window.open(playgroundUrl ?? '', '_blank', 'noopener');
  });
});

editor.addEventListener('input', refresh);
editor.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    runButton.click();
  } else if (e.key === 'Tab' && !e.shiftKey && !e.altKey) {
    // Indent with four spaces, like the examples; Shift+Tab / Esc then Tab still leave the box.
    e.preventDefault();
    editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end');
    refresh();
  }
});
inputField.addEventListener('input', refresh);

refresh();
app
  .connect()
  .then(() => {
    applyContext(app.getHostContext());
  })
  .catch(() => {
    status.textContent = 'Asomiya playground';
  });
