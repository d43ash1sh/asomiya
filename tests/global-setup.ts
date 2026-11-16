import { execSync } from 'node:child_process';

/** Integration tests run the real CLI from dist/, so build it once before the suite. */
export default function setup(): void {
  execSync('npx tsup --silent', { stdio: 'inherit' });
}
