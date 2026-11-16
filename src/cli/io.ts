import { readSync, writeSync } from 'node:fs';

const NEWLINE = 0x0a;
const CHUNK_SIZE = 4096;
const decoder = new TextDecoder('utf-8');

function sleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function errorCode(error: unknown): string | undefined {
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return undefined;
}

/**
 * Reads standard input one line at a time, synchronously.
 *
 * The interpreter is synchronous, so `সোধা` needs a blocking read. The REPL uses the same reader
 * for its own input, which is what lets `সোধা` work inside the REPL too: there is exactly one
 * consumer of stdin. Lines are split on raw bytes before decoding, so multi-byte UTF-8 characters
 * (all of Assamese) are never cut in half. Accepts \n and \r\n line endings.
 */
export class SyncLineReader {
  private buffer: Buffer = Buffer.alloc(0);
  private ended = false;
  private readonly fd: number;

  constructor(fd = 0) {
    this.fd = fd;
  }

  readLine(): string | null {
    for (;;) {
      const newline = this.buffer.indexOf(NEWLINE);
      if (newline >= 0) {
        const line = this.buffer.subarray(0, newline);
        this.buffer = this.buffer.subarray(newline + 1);
        return decoder.decode(line).replace(/\r$/, '');
      }
      if (this.ended) {
        if (this.buffer.length === 0) return null;
        const rest = decoder.decode(this.buffer).replace(/\r$/, '');
        this.buffer = Buffer.alloc(0);
        return rest;
      }
      this.fill();
    }
  }

  private fill(): void {
    const chunk = Buffer.alloc(CHUNK_SIZE);
    let bytesRead: number;
    try {
      bytesRead = readSync(this.fd, chunk, 0, CHUNK_SIZE, null);
    } catch (error) {
      const code = errorCode(error);
      if (code === 'EAGAIN') {
        sleep(10); // non-blocking stdin with no data yet
        return;
      }
      if (code === 'EOF') {
        this.ended = true;
        return;
      }
      throw error;
    }
    if (bytesRead === 0) {
      this.ended = true;
      return;
    }
    this.buffer = Buffer.concat([this.buffer, chunk.subarray(0, bytesRead)]);
  }
}

/**
 * Returns a writer for stdout (fd 1) or stderr (fd 2) whose output is on screen before it
 * returns. That matters because the CLI blocks on synchronous reads: a prompt written
 * asynchronously could still be queued when the read starts.
 *
 * On a Windows console, `process.stdout.write` is used instead: raw `writeSync` bypasses the
 * console's UTF-16 conversion and would garble Assamese text.
 */
export function createWriter(fd: 1 | 2): (text: string) => void {
  const stream = fd === 1 ? process.stdout : process.stderr;
  if (process.platform === 'win32' && stream.isTTY) {
    return (text) => {
      stream.write(text);
    };
  }
  let closed = false;
  return (text) => {
    if (closed) return;
    const bytes = Buffer.from(text, 'utf8');
    let offset = 0;
    while (offset < bytes.length) {
      try {
        offset += writeSync(fd, bytes, offset);
      } catch (error) {
        const code = errorCode(error);
        if (code === 'EAGAIN') {
          sleep(1); // non-blocking pipe is full; wait for the reader
          continue;
        }
        if (code === 'EPIPE') {
          closed = true; // reader went away (e.g. `| head`); drop further output quietly
          return;
        }
        throw error;
      }
    }
  };
}
