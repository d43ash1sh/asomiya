// Runs programs off the main thread, so even a slow program never freezes the page, and the
// playground's Stop button can simply terminate this worker. It also translates to Python.
import { runProgram, translateProgram } from '../playground/runner';
import type { PythonRequest, PythonResponse, RunRequest, RunResponse } from './protocol';

const scope = self as unknown as DedicatedWorkerGlobalScope;

function handleRun({ id, source, stdin, lang, digits }: RunRequest): RunResponse {
  const started = performance.now();
  try {
    const result = runProgram(source, { lang, digits, stdin });
    return { kind: 'run', id, ...result, ms: Math.round(performance.now() - started) };
  } catch {
    // An interpreter bug, not a program error: report it without leaking internals.
    return {
      kind: 'run',
      id,
      output: '',
      error: 'Internal error. Please report it on GitHub.',
      ms: 0,
    };
  }
}

function handlePython({ id, source, lang, digits }: PythonRequest): PythonResponse {
  try {
    return { kind: 'python', id, ...translateProgram(source, { lang, digits }) };
  } catch {
    return {
      kind: 'python',
      id,
      python: null,
      error: 'Internal error. Please report it on GitHub.',
    };
  }
}

scope.addEventListener('message', (event: MessageEvent<RunRequest | PythonRequest>) => {
  const request = event.data;
  scope.postMessage(request.kind === 'python' ? handlePython(request) : handleRun(request));
});
