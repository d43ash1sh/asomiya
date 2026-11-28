/**
 * One run of a program: owns the worker thread, passes output and questions to whoever shows
 * them (the Asomiya output panel), and takes answers back. Independent of VS Code so it can be
 * tested.
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

export type Outcome = 'ok' | 'error' | 'stopped';

export interface RunCallbacks {
  /** Program output, as printed (\n line breaks). */
  readonly output: (text: string) => void;
  /** The program is waiting for one line of input (সোধা). */
  readonly input: () => void;
  /** Called once when the program has finished, failed (with the formatted error) or been stopped. */
  readonly finished: (outcome: Outcome, error: string | null) => void;
}

const encoder = new TextEncoder();
/** How often batched output is passed on. */
const FLUSH_MS = 30;
const MAX_PENDING = 1_000_000;

/** Cuts UTF-8 bytes to `max` without splitting a character. */
function clip(bytes: Uint8Array, max: number): Uint8Array {
  if (bytes.length <= max) return bytes;
  let end = max;
  // Continuation bytes look like 10xxxxxx; step back to the start of a character.
  while (end > 0 && ((bytes[end] ?? 0) & 0xc0) === 0x80) end--;
  return bytes.slice(0, end);
}

export class RunSession {
  private readonly worker: Worker;
  private readonly shared = new SharedArrayBuffer(INPUT_HEADER + INPUT_CAPACITY);
  private readonly state = new Int32Array(this.shared, 0, 2);
  private waitingForInput = false;
  private done = false;
  /** Output is passed on in batches: a loop printing a line at a time must not flood the panel. */
  private pending = '';
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    workerFile: string,
    options: RunOptions,
    private readonly callbacks: RunCallbacks,
  ) {
    this.worker = new Worker(workerFile, { workerData: { ...options, shared: this.shared } });
    this.worker.on('message', (message: FromWorker) => {
      this.receive(message);
    });
    this.worker.on('error', (error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.finish('error', `internal error: ${message}`);
    });
    this.worker.on('exit', () => {
      // An exit without "done" (it crashed or was terminated) still ends the run.
      this.finish('stopped', null);
    });
  }

  get running(): boolean {
    return !this.done;
  }

  get waiting(): boolean {
    return this.waitingForInput;
  }

  /** Answers the program's question; null means end of input (the program gets খালী). */
  answer(text: string | null): void {
    if (this.done || !this.waitingForInput) return;
    this.waitingForInput = false;
    if (text === null) {
      Atomics.store(this.state, 1, -1);
    } else {
      const bytes = clip(encoder.encode(text), INPUT_CAPACITY);
      new Uint8Array(this.shared, INPUT_HEADER, INPUT_CAPACITY).set(bytes);
      Atomics.store(this.state, 1, bytes.length);
    }
    Atomics.store(this.state, 0, 1);
    Atomics.notify(this.state, 0);
  }

  stop(): void {
    this.finish('stopped', null);
  }

  private receive(message: FromWorker): void {
    if (message.type === 'output') {
      this.pending += message.text;
      // Between two batches only the newest output matters; the panel keeps less than this anyway.
      if (this.pending.length > MAX_PENDING) this.pending = this.pending.slice(-MAX_PENDING);
      this.timer ??= setTimeout(() => {
        this.flush();
      }, FLUSH_MS);
    } else if (message.type === 'input') {
      this.flush();
      this.waitingForInput = true;
      this.callbacks.input();
    } else {
      this.finish(message.error === null ? 'ok' : 'error', message.error);
    }
  }

  private flush(): void {
    clearTimeout(this.timer);
    this.timer = undefined;
    if (this.pending === '') return;
    const text = this.pending;
    this.pending = '';
    this.callbacks.output(text);
  }

  private finish(outcome: Outcome, error: string | null): void {
    if (this.done) return;
    this.flush();
    this.done = true;
    this.waitingForInput = false;
    void this.worker.terminate();
    this.callbacks.finished(outcome, error);
  }
}
