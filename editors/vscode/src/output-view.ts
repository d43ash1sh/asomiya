/**
 * The "Asomiya" panel that ▶ Run writes to. VS Code's terminal draws one character per cell, so
 * joined Assamese letters (যুগ্ম, আপোনাৰ) fall apart there; this panel is a small web page, so the
 * text is shaped properly. It also has an input box for সোধা and a Stop button.
 *
 * The page only ever receives text (shown with textContent, never as HTML) and only sends back
 * answers and Stop, under a strict Content Security Policy.
 */
import { randomBytes } from 'node:crypto';
import * as vscode from 'vscode';
import type { MessageLanguage } from '../../../src/language/types';
import type { Outcome } from './run-session';

export const OUTPUT_VIEW = 'asomiya.output';

export type ToPanel =
  | { readonly type: 'start'; readonly file: string; readonly ui: PanelText }
  | { readonly type: 'output'; readonly text: string }
  | { readonly type: 'input' }
  | { readonly type: 'done'; readonly outcome: Outcome; readonly error: string | null };

export type FromPanel =
  | { readonly type: 'ready' }
  | { readonly type: 'answer'; readonly text: string }
  | { readonly type: 'eof' }
  | { readonly type: 'stop' };

export interface PanelText {
  readonly running: string;
  readonly waiting: string;
  readonly ok: string;
  readonly error: string;
  readonly stopped: string;
  readonly placeholder: string;
  readonly send: string;
  readonly stop: string;
  readonly empty: string;
}

export const PANEL_TEXT: Readonly<Record<MessageLanguage, PanelText>> = {
  en: {
    running: 'Running…',
    waiting: 'Waiting for your answer',
    ok: 'Finished',
    error: 'Stopped with an error',
    stopped: 'Stopped',
    placeholder: 'Type your answer and press Enter',
    send: 'Send',
    stop: 'Stop',
    empty: 'Press ▶ Run on an Asomiya (.asom) file to see its output here.',
  },
  as: {
    running: 'চলি আছে…',
    waiting: 'আপোনাৰ উত্তৰলৈ ৰৈ আছে',
    ok: 'শেষ হ’ল',
    error: 'ভুলৰ বাবে ৰ’ল',
    stopped: 'ৰখোৱা হ’ল',
    placeholder: 'উত্তৰ লিখি Enter টিপক',
    send: 'পঠিয়াওক',
    stop: 'ৰখাওক',
    empty: 'ইয়াত ফলাফল চাবলৈ এটা অসমীয়া (.asom) ফাইলত ▶ চলাওক টিপক।',
  },
};

export class OutputView implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;
  private ready = false;
  private queue: ToPanel[] = [];
  private readonly received = new vscode.EventEmitter<FromPanel>();
  /** Messages from the panel: answers, end of input and Stop. */
  readonly onMessage = this.received.event;

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    this.ready = false;
    view.webview.options = { enableScripts: true, localResourceRoots: [] };
    view.webview.html = html(randomBytes(16).toString('base64'));
    view.webview.onDidReceiveMessage((message: FromPanel) => {
      if (message.type === 'ready') {
        this.ready = true;
        for (const m of this.queue) void view.webview.postMessage(m);
        this.queue = [];
      } else {
        this.received.fire(message);
      }
    });
    view.onDidDispose(() => {
      this.view = undefined;
      this.ready = false;
    });
  }

  /** Shows the panel (keyboard focus goes to it, so answers are typed there). */
  async reveal(): Promise<void> {
    await vscode.commands.executeCommand(`${OUTPUT_VIEW}.focus`);
  }

  post(message: ToPanel): void {
    if (message.type === 'start') this.queue = [];
    if (this.view && this.ready) void this.view.webview.postMessage(message);
    else this.queue.push(message);
  }

  dispose(): void {
    this.received.dispose();
  }
}

function html(nonce: string): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style nonce="${nonce}">
  html, body { height: 100%; }
  body { margin: 0; padding: 0; color: var(--vscode-foreground); background: var(--vscode-panel-background);
    font-family: var(--vscode-editor-font-family), 'Kohinoor Bangla', 'Noto Sans Bengali', 'Nirmala UI', 'Vrinda', sans-serif;
    font-size: var(--vscode-editor-font-size); display: flex; flex-direction: column; }
  header { display: flex; align-items: center; gap: 10px; padding: 6px 14px; border-bottom: 1px solid var(--vscode-panel-border);
    font-family: var(--vscode-font-family); font-size: 12px; color: var(--vscode-descriptionForeground); min-height: 22px; }
  header .file { color: var(--vscode-foreground); font-weight: 600; }
  header .status::before { content: '●'; margin-right: 6px; }
  header .status.running::before { color: var(--vscode-charts-blue); }
  header .status.waiting::before { color: var(--vscode-charts-yellow); }
  header .status.ok::before { color: var(--vscode-charts-green); }
  header .status.error::before, header .status.stopped::before { color: var(--vscode-errorForeground); }
  header button { margin-left: auto; }
  button { font-family: var(--vscode-font-family); font-size: 12px; border: none; border-radius: 3px; padding: 3px 12px; cursor: pointer;
    color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
  button:hover { background: var(--vscode-button-hoverBackground); }
  button.secondary { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
  button[hidden] { display: none; }
  main { flex: 1; overflow: auto; padding: 10px 14px; }
  pre { margin: 0; font: inherit; line-height: 1.6; white-space: pre-wrap; word-break: break-word; }
  .answer { color: var(--vscode-terminal-ansiCyan, var(--vscode-textLink-foreground)); }
  .error { color: var(--vscode-errorForeground); }
  .note { color: var(--vscode-descriptionForeground); font-family: var(--vscode-font-family); }
  form { display: flex; gap: 8px; padding: 8px 14px 12px; }
  form[hidden] { display: none; }
  input { flex: 1; font: inherit; padding: 5px 8px; color: var(--vscode-input-foreground); background: var(--vscode-input-background);
    border: 1px solid var(--vscode-focusBorder); border-radius: 3px; outline: none; }
</style>
</head>
<body>
<header><span class="file" id="file"></span><span class="status" id="status"></span><button class="secondary" id="stop" hidden></button></header>
<main id="main"><pre id="out"><span class="note" id="empty"></span></pre></main>
<form id="form" hidden><input id="answer" autocomplete="off" spellcheck="false"><button type="submit" id="send"></button></form>
<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  const out = $('out'), main = $('main'), form = $('form'), input = $('answer'), stop = $('stop'), status = $('status');
  let ui = null;
  const add = (text, cls) => {
    const span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text;
    out.append(span);
    main.scrollTop = main.scrollHeight;
  };
  const setStatus = (kind) => { status.className = 'status ' + kind; status.textContent = ui ? ui[kind] : ''; };
  const ask = (on) => { form.hidden = !on; if (on) { input.value = ''; input.focus(); } };
  window.addEventListener('message', (event) => {
    const m = event.data;
    if (m.type === 'start') {
      ui = m.ui; out.textContent = ''; $('file').textContent = m.file;
      input.placeholder = ui.placeholder; $('send').textContent = ui.send; stop.textContent = ui.stop;
      stop.hidden = false; setStatus('running'); ask(false);
    } else if (m.type === 'output') {
      add(m.text);
    } else if (m.type === 'input') {
      setStatus('waiting'); ask(true);
    } else if (m.type === 'done') {
      ask(false); stop.hidden = true;
      if (m.error) add((out.textContent.endsWith('\\n') || out.textContent === '' ? '' : '\\n') + m.error + '\\n', 'error');
      setStatus(m.outcome === 'ok' ? 'ok' : m.outcome);
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    add(input.value + '\\n', 'answer');
    vscode.postMessage({ type: 'answer', text: input.value });
    ask(false); setStatus('running');
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'd' && e.ctrlKey) { e.preventDefault(); add('\\n'); vscode.postMessage({ type: 'eof' }); ask(false); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'c' && e.ctrlKey && !stop.hidden) { e.preventDefault(); vscode.postMessage({ type: 'stop' }); }
  });
  stop.addEventListener('click', () => vscode.postMessage({ type: 'stop' }));
  $('empty').textContent = ${JSON.stringify(PANEL_TEXT.en.empty)};
  vscode.postMessage({ type: 'ready' });
</script>
</body>
</html>`;
}
