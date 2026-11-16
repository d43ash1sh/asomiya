import { readSync } from 'node:fs';

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
 * Reads standard input one line at a time, synchronously. The interpreter is synchronous, so
 * `সোধা` needs a blocking read. Lines are split on raw bytes before decoding, so multi-byte
 * UTF-8 characters are never cut in half.
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
