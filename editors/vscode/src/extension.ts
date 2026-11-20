/**
 * The Asomiya extension: errors as you type, hovers, completions, Run (in the Asomiya panel, with input)
 * and Show in Python (a live, read-only Python version beside the program).
 *
 * Nothing here runs a program on its own: checking only parses, and Run happens when asked. The
 * interpreter itself has no file or network access.
 */
import { basename, join } from 'node:path';
import * as vscode from 'vscode';
import type { MessageLanguage } from '../../../src/language/types';
import type { DigitSetting } from '../../../src/runtime/values';
import { OUTPUT_VIEW, OutputView, PANEL_TEXT } from './output-view';
import { RunSession } from './run-session';
import { check, completions, describe, programStart, python } from './service';

const LANGUAGE = 'asomiya';
const PYTHON_SCHEME = 'asomiya-python';
/** Words as the editor sees them: Latin, Assamese (with its marks), digits, _ ' and joiners. */
const WORD = /[A-Za-z0-9_'’ঀ-৿‌‍]+/;

function settings(): { lang: MessageLanguage; digits: DigitSetting; check: boolean } {
  const config = vscode.workspace.getConfiguration('asomiya');
  return {
    lang: config.get<string>('errorLanguage') === 'en' ? 'en' : 'as',
    digits: config.get<DigitSetting>('digits') ?? 'auto',
    check: config.get<boolean>('checkAsYouType') ?? true,
  };
}

const isAsomiya = (doc: vscode.TextDocument): boolean => doc.languageId === LANGUAGE;

// ── errors as you type ───────────────────────────────────────────────────

function registerDiagnostics(context: vscode.ExtensionContext): void {
  const collection = vscode.languages.createDiagnosticCollection(LANGUAGE);
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const update = (doc: vscode.TextDocument): void => {
    if (!isAsomiya(doc)) return;
    const { lang, check: enabled } = settings();
    if (!enabled) {
      collection.delete(doc.uri);
      return;
    }
    const text = doc.getText();
    collection.set(
      doc.uri,
      check(text, lang).map((p) => {
        const range = new vscode.Range(doc.positionAt(p.start), doc.positionAt(p.end));
        const d = new vscode.Diagnostic(range, p.message, vscode.DiagnosticSeverity.Error);
        d.source = 'asomiya';
        d.code = {
          value: p.code,
          target: vscode.Uri.parse(
            `https://asomiya.codes/reference/errors/#${p.code.toLowerCase()}`,
          ),
        };
        return d;
      }),
    );
  };

  const soon = (doc: vscode.TextDocument): void => {
    if (!isAsomiya(doc)) return;
    const key = doc.uri.toString();
    clearTimeout(timers.get(key));
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key);
        update(doc);
      }, 250),
    );
  };

  context.subscriptions.push(
    collection,
    vscode.workspace.onDidOpenTextDocument(update),
    vscode.workspace.onDidChangeTextDocument((e) => {
      soon(e.document);
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      collection.delete(doc.uri);
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('asomiya')) vscode.workspace.textDocuments.forEach(update);
    }),
  );
  vscode.workspace.textDocuments.forEach(update);
}

// ── hover and completion ─────────────────────────────────────────────────

function registerLanguageFeatures(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(LANGUAGE, {
      provideHover(doc, position) {
        const range = doc.getWordRangeAtPosition(position, WORD);
        if (range === undefined) return undefined;
        const text = describe(doc.getText(range));
        if (text === null) return undefined;
        const md = new vscode.MarkdownString(text);
        md.isTrusted = false;
        return new vscode.Hover(md, range);
      },
    }),
    vscode.languages.registerCompletionItemProvider(LANGUAGE, {
      provideCompletionItems(doc) {
        return completions(doc.getText()).map((c) => {
          const item = new vscode.CompletionItem(
            c.label,
            c.kind === 'function'
              ? vscode.CompletionItemKind.Function
              : c.kind === 'constant'
                ? vscode.CompletionItemKind.Constant
                : vscode.CompletionItemKind.Keyword,
          );
          item.detail = c.detail;
          const doc_ = describe(c.label);
          if (doc_ !== null) item.documentation = new vscode.MarkdownString(doc_);
          return item;
        });
      },
    }),
  );
}

// ── Run ──────────────────────────────────────────────────────────────────

function registerRun(context: vscode.ExtensionContext): void {
  const view = new OutputView();
  let session: RunSession | undefined;
  const workerFile = join(context.extensionPath, 'dist', 'run-worker.js');

  const run = async (uri?: vscode.Uri): Promise<void> => {
    const doc =
      uri !== undefined
        ? await vscode.workspace.openTextDocument(uri)
        : vscode.window.activeTextEditor?.document;
    if (doc === undefined || !isAsomiya(doc)) {
      void vscode.window.showInformationMessage('Open an Asomiya (.asom) file to run it.');
      return;
    }
    session?.stop();
    const { lang, digits } = settings();
    const fileName = basename(doc.uri.fsPath || doc.uri.path) || 'program.asom';
    view.post({ type: 'start', file: fileName, ui: PANEL_TEXT[lang] });
    // Focus the panel: a program that asks a question (সোধা) needs the answer typed there.
    await view.reveal();
    const current = new RunSession(
      workerFile,
      { source: doc.getText(), fileName, lang, digits },
      {
        output: (text) => {
          view.post({ type: 'output', text });
        },
        input: () => {
          view.post({ type: 'input' });
        },
        finished: (outcome, error) => {
          view.post({ type: 'done', outcome, error });
        },
      },
    );
    session = current;
  };

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(OUTPUT_VIEW, view, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    view,
    view.onMessage((message) => {
      if (message.type === 'answer') session?.answer(message.text);
      else if (message.type === 'eof') session?.answer(null);
      else if (message.type === 'stop') session?.stop();
    }),
    vscode.commands.registerCommand('asomiya.run', run),
    vscode.commands.registerCommand('asomiya.stop', () => {
      session?.stop();
    }),
    { dispose: () => session?.stop() },
  );
}

// ── Show in Python ───────────────────────────────────────────────────────

/** asomiya-python:/<name>.py?<encoded source uri> */
function pythonUri(source: vscode.Uri): vscode.Uri {
  const name = basename(source.path).replace(/\.asom$/i, '') || 'program';
  return vscode.Uri.from({ scheme: PYTHON_SCHEME, path: `/${name}.py`, query: source.toString() });
}

function registerPython(context: vscode.ExtensionContext): void {
  const changed = new vscode.EventEmitter<vscode.Uri>();
  const open = new Map<string, vscode.Uri>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const render = (uri: vscode.Uri): string => {
    const source = vscode.workspace.textDocuments.find((d) => d.uri.toString() === uri.query);
    if (source === undefined) return '# The Asomiya file is closed.\n';
    const { lang, digits } = settings();
    const result = python(source.getText(), lang, digits);
    if (result.python !== null) return result.python;
    return `# Fix this error to see the Python version:\n# ${(result.error ?? '').replace(/\n/g, '\n# ')}\n`;
  };

  context.subscriptions.push(
    changed,
    vscode.workspace.registerTextDocumentContentProvider(PYTHON_SCHEME, {
      onDidChange: changed.event,
      provideTextDocumentContent: render,
    }),
    vscode.commands.registerCommand('asomiya.showPython', async () => {
      const doc = vscode.window.activeTextEditor?.document;
      if (doc === undefined || !isAsomiya(doc)) {
        void vscode.window.showInformationMessage('Open an Asomiya (.asom) file first.');
        return;
      }
      const uri = pythonUri(doc.uri);
      open.set(doc.uri.toString(), uri);
      const py = await vscode.workspace.openTextDocument(uri);
      await vscode.languages.setTextDocumentLanguage(py, 'python');
      const editor = await vscode.window.showTextDocument(py, {
        viewColumn: vscode.ViewColumn.Beside,
        preserveFocus: true,
        preview: false,
      });
      // Start at the learner's own program; the helper functions come first in the file.
      const start = programStart(py.getText());
      if (start > 0) {
        const top = new vscode.Range(start, 0, start, 0);
        editor.revealRange(top, vscode.TextEditorRevealType.AtTop);
      }
    }),
    vscode.commands.registerCommand('asomiya.savePython', async () => {
      const active = vscode.window.activeTextEditor?.document;
      if (active === undefined) return;
      const pyUri = active.uri.scheme === PYTHON_SCHEME ? active.uri : pythonUri(active.uri);
      const text = render(pyUri);
      const source = vscode.Uri.parse(pyUri.query);
      const options: vscode.SaveDialogOptions = { filters: { Python: ['py'] } };
      if (source.scheme === 'file') {
        options.defaultUri = vscode.Uri.file(source.fsPath.replace(/\.asom$/i, '') + '.py');
      }
      const target = await vscode.window.showSaveDialog(options);
      if (target === undefined) return;
      await vscode.workspace.fs.writeFile(target, new TextEncoder().encode(text));
    }),
    vscode.workspace.onDidChangeTextDocument((e) => {
      const uri = open.get(e.document.uri.toString());
      if (uri === undefined) return;
      const key = uri.toString();
      clearTimeout(timers.get(key));
      timers.set(
        key,
        setTimeout(() => {
          timers.delete(key);
          changed.fire(uri);
        }, 300),
      );
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('asomiya')) for (const uri of open.values()) changed.fire(uri);
    }),
  );
}

export function activate(context: vscode.ExtensionContext): void {
  // The extension activates when an Asomiya file is opened; only then show the Asomiya panel.
  void vscode.commands.executeCommand('setContext', 'asomiya.active', true);
  registerDiagnostics(context);
  registerLanguageFeatures(context);
  registerRun(context);
  registerPython(context);
}

export function deactivate(): void {
  // Everything is disposed through context.subscriptions.
}
