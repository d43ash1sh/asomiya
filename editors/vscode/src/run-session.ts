/**
 * One run of a program: owns the worker thread and acts as a tiny line-editing terminal (echo,
 * backspace, Enter, Ctrl+C to stop, Ctrl+D for end of input). Independent of VS Code so it can be
 * tested; the extension connects it to a Pseudoterminal.
 */
import { Worker } from 'node:worker_threads';
import type { MessageLanguage } from '../../../src/language/types';
import type { DigitSetting } from '../../../src/runtime/values';
import { INPUT_CAPACITY, INPUT_HEADER, type FromWorker } from './run-protocol';

export interface RunOptions {
  readonly source: string;
  readonly fileName: string;
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
}

export interface RunCallbacks {
  /** Terminal output (already using \r\n line breaks). */
  readonly write: (text: string) => void;
  /** Called once when the program has finished, failed or been stopped. */
  readonly finished: (outcome: 'ok' | 'error' | 'stopped') => void;
}

const encoder = new TextEncoder();
const RED = '\x1b[31m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

/** Terminals need \r\n; programs print \n. */
const crlf = (text: string): string => text.replace(/\r?\n/g, '\r\n');

export class RunSession {
  private readonly worker: Worker;
  private readonly shared = new SharedArrayBuffer(INPUT_HEADER + INPUT_CAPACITY);
  private readonly state = new Int32Array(this.shared, 0, 2);
  private waiting = false;
  private line: string[] = [];
  private done = false;

  constructor(
    workerFile: string,
    options: RunOptions,
    private readonly callbacks: RunCallbacks,
    private readonly messages = { stopped: 'Stopped.', finished: 'Finished.' },
  ) {
    this.worker = new Worker(workerFile, { workerData: { ...options, shared: this.shared } });
    this.worker.on('message', (message: FromWorker) => {
      this.receive(message);
    });
    this.worker.on('error', (error) => {
      this.finish('error', `${RED}internal error: ${error.message}${RESET}\r\n`);
    });
    this.worker.on('exit', () => {
      // An exit without "done" (it crashed or was terminated) still ends the run.
      this.finish('stopped', '');
    });
  }

  get running(): boolean {
    return !this.done;
  }

  /** Keystrokes from the terminal. */
  input(data: string): void {
    if (this.done) return;
    for (const ch of data) {
      if (ch === '\x03') {
        this.stop();
        return;
      }
      if (!this.waiting) continue;
      if (ch === '\r' || ch === '\n') {
        this.callbacks.write('\r\n');
        this.answer(this.line.join(''));
      } else if (ch === '\x04') {
        this.callbacks.write('\r\n');
        this.answer(null);
      } else if (ch === '\x7f' || ch === '\b') {
        if (this.line.length > 0) {
          this.line.pop();
          this.callbacks.write('\b \b');
        }
      } else if (ch >= ' ') {
        this.line.push(ch);
        this.callbacks.write(ch);
      }
    }
  }

  stop(): void {
    if (this.done) return;
    this.finish('stopped', `\r\n${DIM}■ ${this.messages.stopped}${RESET}\r\n`);
  }

  private receive(message: FromWorker): void {
    if (message.type === 'output') {
      this.callbacks.write(crlf(message.text));
    } else if (message.type === 'input') {
      this.waiting = true;
      this.line = [];
    } else if (message.error === null) {
      this.finish('ok', `\r\n${DIM}${this.messages.finished}${RESET}\r\n`);
    } else {
      this.finish('error', `${RED}${crlf(message.error)}${RESET}\r\n`);
    }
  }

  private answer(text: string | null): void {
    this.waiting = false;
    if (text === null) {
      Atomics.store(this.state, 1, -1);
    } else {
      let bytes = encoder.encode(text);
      if (bytes.length > INPUT_CAPACITY) bytes = bytes.slice(0, INPUT_CAPACITY);
      new Uint8Array(this.shared, INPUT_HEADER, INPUT_CAPACITY).set(bytes);
      Atomics.store(this.state, 1, bytes.length);
    }
    Atomics.store(this.state, 0, 1);
    Atomics.notify(this.state, 0);
  }

  private finish(outcome: 'ok' | 'error' | 'stopped', text: string): void {
    if (this.done) return;
    this.done = true;
    this.waiting = false;
    if (text !== '') this.callbacks.write(text);
    void this.worker.terminate();
    this.callbacks.finished(outcome);
  }
}
