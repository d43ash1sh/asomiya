#!/usr/bin/env node
import { Command, CommanderError, InvalidArgumentError, Option } from 'commander';
import { LANGUAGE } from '../language/config';
import type { MessageLanguage } from '../language/types';
import { DEFAULT_MAX_CALL_DEPTH, DEFAULT_MAX_STEPS } from '../runtime/interpreter';
import { CLI_MESSAGES } from './messages';
import { startRepl } from './repl';
import { EXIT_USAGE_ERROR, runFile, type ExecutionSettings } from './run-file';
import { SyncLineReader } from './stdin';

interface RawOptions {
  readonly lang: MessageLanguage;
  readonly asciiDigits?: boolean;
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
    digits: options.asciiDigits === true ? 'ascii' : 'assamese',
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
    .option('--ascii-digits', 'print numbers with 0-9 instead of ০-৯')
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

export async function main(argv: readonly string[]): Promise<number> {
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
    const reader = new SyncLineReader();
    exitCode = runFile(file, settingsFrom(options), {
      stdout: (text) => process.stdout.write(text),
      stderr: (text) => process.stderr.write(text),
      readLine: () => reader.readLine(),
    });
  });

  addExecutionOptions(
    program
      .command('repl', { isDefault: true })
      .description('start the interactive prompt (default)'),
  ).action(async (options: RawOptions) => {
    await startRepl(settingsFrom(options));
  });

  try {
    await program.parseAsync(argv, { from: 'user' });
  } catch (error) {
    if (error instanceof CommanderError) {
      // --help and --version "fail" with exit code 0.
      return error.exitCode === 0 ? 0 : EXIT_USAGE_ERROR;
    }
    throw error;
  }
  return exitCode;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(
      `internal error: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
    );
    process.exitCode = 70;
  },
);
