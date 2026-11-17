#!/usr/bin/env node
import { Command, CommanderError, InvalidArgumentError, Option } from 'commander';
import { LANGUAGE } from '../language/config';
import type { MessageLanguage } from '../language/types';
import { DEFAULT_MAX_CALL_DEPTH, DEFAULT_MAX_STEPS } from '../runtime/interpreter';
import { CLI_MESSAGES } from './messages';
import { createWriter, SyncLineReader } from './io';
import { runRepl } from './repl';
import { EXIT_USAGE_ERROR, runFile, type CliIO, type ExecutionSettings } from './run-file';

interface RawOptions {
  readonly lang: MessageLanguage;
  readonly asciiDigits?: boolean;
  readonly assameseDigits?: boolean;
  readonly maxSteps: number;
  readonly maxDepth: number;
}

function parseCount(flag: string, allowZero: boolean) {
  return (value: string): number => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || (!allowZero && n === 0)) {
      throw new InvalidArgumentError(CLI_MESSAGES.en.invalidNumber(flag, value));
    }
    return n;
  };
}

function settingsFrom(options: RawOptions): ExecutionSettings {
  return {
    lang: options.lang,
    digits:
      options.asciiDigits === true
        ? 'ascii'
        : options.assameseDigits === true
          ? 'assamese'
          : 'auto',
    maxSteps: options.maxSteps === 0 ? Number.POSITIVE_INFINITY : options.maxSteps,
    maxCallDepth: options.maxDepth,
  };
}

function addExecutionOptions(command: Command): Command {
  return command
    .addOption(
      new Option('-l, --lang <lang>', 'language for error messages')
        .choices(['as', 'en'])
        .default('as'),
    )
    .option('--ascii-digits', 'always print numbers with 0-9')
    .option(
      '--assamese-digits',
      'always print numbers with ০-৯ (default: ০-৯, or 0-9 for programs in English letters)',
    )
    .option(
      '--max-steps <n>',
      'execution step budget (0 = unlimited)',
      parseCount('--max-steps', true),
      DEFAULT_MAX_STEPS,
    )
    .option(
      '--max-depth <n>',
      'maximum function call depth',
      parseCount('--max-depth', false),
      DEFAULT_MAX_CALL_DEPTH,
    );
}

/** Real terminal I/O. Both streams are written synchronously, so output and prompts appear in order. */
function processIO(): CliIO {
  const reader = new SyncLineReader();
  return {
    stdout: createWriter(1),
    stderr: createWriter(2),
    readLine: () => reader.readLine(),
  };
}

export function main(argv: readonly string[]): number {
  let exitCode = 0;
  const program = new Command()
    .name(LANGUAGE.cliName)
    .description(`${LANGUAGE.nativeName} (${LANGUAGE.name}) — an Assamese programming language`)
    .version(LANGUAGE.version, '-v, --version')
    .exitOverride()
    .showHelpAfterError();

  addExecutionOptions(
    program
      .command('run')
      .description(`run a source file (*${LANGUAGE.fileExtension})`)
      .argument('<file>', 'path to the program'),
  ).action((file: string, options: RawOptions) => {
    exitCode = runFile(file, settingsFrom(options), processIO());
  });

  addExecutionOptions(
    program
      .command('repl', { isDefault: true })
      .description('start the interactive prompt (default)'),
  ).action((options: RawOptions) => {
    exitCode = runRepl(settingsFrom(options), processIO());
  });

  try {
    program.parse(argv, { from: 'user' });
  } catch (error) {
    if (error instanceof CommanderError) {
      // --help and --version "fail" with exit code 0.
      return error.exitCode === 0 ? 0 : EXIT_USAGE_ERROR;
    }
    throw error;
  }
  return exitCode;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`internal error: ${detail}\n`);
  process.exitCode = 70;
}
