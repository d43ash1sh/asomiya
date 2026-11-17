// Runs programs off the main thread, so even a slow program never freezes the page, and the
// playground's Stop button can simply terminate this worker.
import { runProgram } from '../playground/runner';
import type { RunRequest, RunResponse } from './protocol';

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.addEventListener('message', (event: MessageEvent<RunRequest>) => {
  const { id, source, stdin, lang, digits } = event.data;
  const started = performance.now();
  let response: RunResponse;
  try {
    const result = runProgram(source, { lang, digits, stdin });
    response = { id, ...result, ms: Math.round(performance.now() - started) };
  } catch {
    // An interpreter bug, not a program error: report it without leaking internals.
    response = { id, output: '', error: 'Internal error. Please report it on GitHub.', ms: 0 };
  }
  scope.postMessage(response);
});
