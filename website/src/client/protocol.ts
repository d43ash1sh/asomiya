import type { DigitSetting, MessageLanguage } from '../../../src/index';

/** Main thread → worker. */
export interface RunRequest {
  readonly id: number;
  readonly source: string;
  readonly stdin: string;
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
}

/** Worker → main thread. */
export interface RunResponse {
  readonly id: number;
  readonly output: string;
  readonly error: string | null;
  readonly ms: number;
}
