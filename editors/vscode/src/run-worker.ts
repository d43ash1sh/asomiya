/**
 * Runs one Asomiya program on a worker thread, so a long or endless program never blocks the
 * editor and Stop can simply terminate the thread.
 *
 * The interpreter asks for input synchronously (সোধা), but the terminal delivers keystrokes
 * asynchronously on the main thread. The two meet in a SharedArrayBuffer: the worker posts
 * "input", then sleeps on Atomics.wait until the main thread has written a line and notified it.
 */
import { parentPort, workerData } from 'node:worker_threads';
import { AsomiyaError } from '../../../src/errors/asomiya-error';
import { formatDiagnostic } from '../../../src/errors/format';
import type { MessageLanguage } from '../../../src/language/types';
import { parse } from '../../../src/parser/parser';
import { Interpreter } from '../../../src/runtime/interpreter';
import type { DigitSetting } from '../../../src/runtime/values';
import { INPUT_CAPACITY, INPUT_HEADER, type FromWorker } from './run-protocol';

interface Job {
  readonly source: string;
  readonly fileName: string;
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
  readonly shared: SharedArrayBuffer;
}

const job = workerData as Job;
const port = parentPort;
if (port === null) throw new Error('run-worker must run as a worker thread');

const state = new Int32Array(job.shared, 0, 2);
const bytes = new Uint8Array(job.shared, INPUT_HEADER, INPUT_CAPACITY);
const decoder = new TextDecoder();

const send = (message: FromWorker): void => {
  port.postMessage(message);
};

function readLine(): string | null {
  Atomics.store(state, 0, 0);
  send({ type: 'input' });
  Atomics.wait(state, 0, 0);
  const length = Atomics.load(state, 1);
  if (length < 0) return null;
  return decoder.decode(bytes.slice(0, length));
}

const interpreter = new Interpreter({
  write: (text) => {
    send({ type: 'output', text });
  },
  readLine,
  digits: job.digits,
});

try {
  interpreter.run(parse(job.source));
  send({ type: 'done', error: null });
} catch (error) {
  if (!(error instanceof AsomiyaError)) throw error;
  send({
    type: 'done',
    error: formatDiagnostic(error.diagnostic, {
      lang: job.lang,
      source: job.source,
      fileName: job.fileName,
    }),
  });
}
