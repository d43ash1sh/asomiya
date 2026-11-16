import { AsomiyaError } from '../errors/asomiya-error';
import { formatDiagnostic } from '../errors/format';
import { parse } from '../parser/parser';
import { Interpreter } from '../runtime/interpreter';
import { CLI_MESSAGES } from './messages';
import { EXIT_OK, type CliIO, type ExecutionSettings } from './run-file';

export const PROMPT = 'অসমীয়া> ';
export const CONTINUATION_PROMPT = '   ...> ';

export type ReplResult =
  | { readonly kind: 'continue' }
  | { readonly kind: 'exit' }
  | {
      readonly kind: 'done';
      /** The echoed value of a bare expression (text quoted), or help text. */
      readonly echo: string | null;
      /** A formatted diagnostic, if the input failed. */
      readonly error: string | null;
    };

const EXIT_COMMANDS = new Set(['.exit', '.প্ৰস্থান']);
const HELP_COMMANDS = new Set(['.help', '.সহায়']);
const CANCEL_COMMANDS = new Set(['.cancel', '.বাতিল']);

/**
 * The REPL's logic, independent of any terminal: feed it lines, get back what to show.
 * Program output (কোৱা, and the prompt of সোধা) goes straight to `io.stdout` while the
 * statement runs, so it appears before `সোধা` waits for input.
 * Variables persist between inputs; top-level re-declaration is allowed.
 */
export class ReplSession {
  private readonly interpreter: Interpreter;
  private readonly settings: ExecutionSettings;
  private pending = '';

  constructor(settings: ExecutionSettings, io: Pick<CliIO, 'stdout' | 'readLine'>) {
    this.settings = settings;
    this.interpreter = new Interpreter({
      write: io.stdout,
      readLine: io.readLine,
      digits: settings.digits,
      maxSteps: settings.maxSteps,
      maxCallDepth: settings.maxCallDepth,
      allowTopLevelRedeclaration: true,
    });
  }

  get isContinuing(): boolean {
    return this.pending !== '';
  }

  feed(line: string): ReplResult {
    const trimmed = line.trim().normalize('NFC');
    if (CANCEL_COMMANDS.has(trimmed)) {
      this.pending = ''; // discard an unfinished multi-line statement
      return { kind: 'done', echo: null, error: null };
    }
    if (!this.isContinuing) {
      if (EXIT_COMMANDS.has(trimmed)) return { kind: 'exit' };
      if (HELP_COMMANDS.has(trimmed)) {
        return { kind: 'done', echo: CLI_MESSAGES[this.settings.lang].replHelp(), error: null };
      }
    }

    const source = this.pending + line + '\n';
    try {
      const program = parse(source);
      this.pending = '';
      const result = this.interpreter.run(program);
      const echo =
        result === undefined || result.kind === 'null'
          ? null
          : this.interpreter.describe(result, program.span);
      return { kind: 'done', echo, error: null };
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
      return { kind: 'done', echo: null, error: message };
    }
  }
}

/**
 * Runs the interactive prompt until end of input or `.প্ৰস্থান`.
 *
 * Input is read with a plain blocking line read, not Node's `readline` line editor. `readline`
 * redraws the line on screen using its own column arithmetic, which does not match how
 * terminals draw Assamese (spacing vowel signs such as া and ী), so its redraws could erase the
 * prompt and earlier output. A plain read leaves echo and editing to the terminal, which renders
 * Assamese correctly. It also lets `সোধা` share standard input with the REPL.
 *
 * Ctrl+D (end of input) quits. Ctrl+C interrupts and quits, including a running program.
 * `.বাতিল` discards an unfinished multi-line statement.
 */
export function runRepl(settings: ExecutionSettings, io: CliIO): number {
  const t = CLI_MESSAGES[settings.lang];
  const session = new ReplSession(settings, io);
  io.stdout(t.replBanner() + '\n');

  for (;;) {
    io.stdout(session.isContinuing ? CONTINUATION_PROMPT : PROMPT);
    const line = io.readLine?.() ?? null;
    if (line === null) {
      io.stdout('\n' + t.replBye() + '\n');
      return EXIT_OK;
    }
    const result = session.feed(line);
    if (result.kind === 'exit') {
      io.stdout(t.replBye() + '\n');
      return EXIT_OK;
    }
    if (result.kind === 'done') {
      if (result.echo !== null) io.stdout(result.echo + '\n');
      if (result.error !== null) io.stderr(result.error + '\n');
    }
  }
}
