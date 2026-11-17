import { readFileSync, statSync } from 'node:fs';
import { AsomiyaError } from '../errors/asomiya-error';
import { formatDiagnostic } from '../errors/format';
import type { MessageLanguage } from '../language/types';
import { parse } from '../parser/parser';
import { Interpreter } from '../runtime/interpreter';
import type { DigitSetting } from '../runtime/values';
import { CLI_MESSAGES } from './messages';

export const EXIT_OK = 0;
/** The program had a lexical, syntax or runtime error. */
export const EXIT_PROGRAM_ERROR = 1;
/** Bad command-line usage or an unreadable file. */
export const EXIT_USAGE_ERROR = 2;

export interface CliIO {
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
  readonly readLine: (() => string | null) | null;
}

export interface ExecutionSettings {
  readonly lang: MessageLanguage;
  readonly digits: DigitSetting;
  readonly maxSteps: number;
  readonly maxCallDepth: number;
}

const strictUtf8 = new TextDecoder('utf-8', { fatal: true });

function readSource(path: string, io: CliIO, lang: MessageLanguage): string | null {
  const t = CLI_MESSAGES[lang];
  try {
    if (!statSync(path).isFile()) {
      io.stderr(t.notAFile(path) + '\n');
      return null;
    }
    return strictUtf8.decode(readFileSync(path));
  } catch (error) {
    if (error instanceof TypeError) {
      io.stderr(t.invalidUtf8(path) + '\n');
    } else if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      io.stderr(t.fileNotFound(path) + '\n');
    } else {
      io.stderr(t.readFailed(path, error instanceof Error ? error.message : String(error)) + '\n');
    }
    return null;
  }
}

/** Runs one source file. Returns the process exit code. */
export function runFile(path: string, settings: ExecutionSettings, io: CliIO): number {
  const source = readSource(path, io, settings.lang);
  if (source === null) return EXIT_USAGE_ERROR;

  const interpreter = new Interpreter({
    write: io.stdout,
    readLine: io.readLine,
    digits: settings.digits,
    maxSteps: settings.maxSteps,
    maxCallDepth: settings.maxCallDepth,
  });
  try {
    interpreter.run(parse(source));
    return EXIT_OK;
  } catch (error) {
    if (!(error instanceof AsomiyaError)) throw error;
    io.stderr(
      formatDiagnostic(error.diagnostic, { lang: settings.lang, source, fileName: path }) + '\n',
    );
    return EXIT_PROGRAM_ERROR;
  }
}
