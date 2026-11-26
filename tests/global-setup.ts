import { execSync } from 'node:child_process';

/**
 * Integration tests run the real CLI from dist/ and the MCP server from mcp/dist/, so build them
 * once before the suite (the MCP server source also imports the built playground view).
 */
export default function setup(): void {
  execSync('npx tsup --silent', { stdio: 'inherit' });
  execSync('node mcp/scripts/build.mjs', { stdio: 'ignore' });
}
