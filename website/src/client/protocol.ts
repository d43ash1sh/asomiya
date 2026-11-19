import type { DigitSetting, MessageLanguage } from '../../../src/index';

/** Main thread → worker: run a program. */
export interface RunRequest {
  readonly kind: 'run';
  readonly id: number;
  readonly source: string;
  readonly stdin: string;
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
}

/** Main thread → worker: translate a program to Python. */
export interface PythonRequest {
  readonly kind: 'python';
  readonly id: number;
  readonly source: string;
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
}

/** Worker → main thread. */
export interface RunResponse {
  readonly kind: 'run';
  readonly id: number;
  readonly output: string;
  readonly error: string | null;
  readonly ms: number;
}

export interface PythonResponse {
  readonly kind: 'python';
  readonly id: number;
  /** The Python program, or null if the source has a syntax error. */
  readonly python: string | null;
  readonly error: string | null;
}
