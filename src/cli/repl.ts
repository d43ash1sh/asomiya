import { createInterface } from 'node:readline';
import { AsomiyaError } from '../errors/asomiya-error';
import { formatDiagnostic } from '../errors/format';
import { parse } from '../parser/parser';
import { Interpreter } from '../runtime/interpreter';
import type { ExecutionSettings } from './run-file';
import { CLI_MESSAGES } from './messages';

export const PROMPT = 'অসমীয়া> ';
export const CONTINUATION_PROMPT = '   ...> ';

export type ReplResult =
  | { readonly kind: 'continue' }
  | { readonly kind: 'exit' }
  | { readonly kind: 'done'; readonly output: string; readonly error: string | null };

const EXIT_COMMANDS = new Set(['.exit', '.প্ৰস্থান']);
const HELP_COMMANDS = new Set(['.help', '.সহায়']);

/**
 * The REPL's logic, independent of any terminal: feed it lines, get back what to show.
 * Variables persist between inputs; top-level re-declaration is allowed.
 */
export class ReplSession {
  private readonly interpreter: Interpreter;
  private readonly settings: ExecutionSettings;
  private pending = '';
  private output = '';

  constructor(settings: ExecutionSettings) {
    this.settings = settings;
    this.interpreter = new Interpreter({
      write: (text) => {
        this.output += text;
      },
      readLine: null,
      digits: settings.digits,
      maxSteps: settings.maxSteps,
      maxCallDepth: settings.maxCallDepth,
      allowTopLevelRedeclaration: true,
    });
  }

  get isContinuing(): boolean {
    return this.pending !== '';
  }

  /** Discards a partially-entered statement. */
  cancel(): void {
    this.pending = '';
  }

  feed(line: string): ReplResult {
    const trimmed = line.trim().normalize('NFC');
    if (!this.isContinuing) {
      if (EXIT_COMMANDS.has(trimmed)) return { kind: 'exit' };
      if (HELP_COMMANDS.has(trimmed)) {
        return {
          kind: 'done',
          output: CLI_MESSAGES[this.settings.lang].replHelp() + '\n',
          error: null,
        };
      }
    }

    const source = this.pending + line + '\n';
    this.output = '';
    try {
      const result = this.interpreter.run(parse(source));
      this.pending = '';
      let output = this.output;
      if (result !== undefined && result.kind !== 'null') {
        output += this.interpreter.repr(result) + '\n';
      }
      return { kind: 'done', output, error: null };
    } catch (error) {
      if (!(error instanceof AsomiyaError)) throw error;
      if (error.diagnostic.incomplete) {
        this.pending = source;
        return { kind: 'continue' };
      }
      this.pending = '';
      const message = formatDiagnostic(error.diagnostic, {
        lang: this.settings.lang,
        source,
        fileName: '<repl>',
      });
      return { kind: 'done', output: this.output, error: message + '\n' };
    }
  }
}

export function startRepl(settings: ExecutionSettings): Promise<void> {
  const t = CLI_MESSAGES[settings.lang];
  const session = new ReplSession(settings);
  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: PROMPT });

  process.stdout.write(t.replBanner() + '\n');
  rl.prompt();

  rl.on('line', (line) => {
    const result = session.feed(line);
    switch (result.kind) {
      case 'exit':
        rl.close();
        return;
      case 'continue':
        rl.setPrompt(CONTINUATION_PROMPT);
        break;
      case 'done':
        process.stdout.write(result.output);
        if (result.error !== null) process.stderr.write(result.error);
        rl.setPrompt(PROMPT);
        break;
    }
    rl.prompt();
  });

  rl.on('SIGINT', () => {
    if (session.isContinuing) {
      session.cancel();
      process.stdout.write('\n');
      rl.setPrompt(PROMPT);
      rl.prompt();
    } else {
      rl.close();
    }
  });

  return new Promise((resolve) => {
    rl.on('close', () => {
      process.stdout.write(t.replBye() + '\n');
      resolve();
    });
  });
}
