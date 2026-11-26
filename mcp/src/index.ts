// `asomiya-mcp`: the Asomiya MCP server over stdio. MCP clients (Claude, VS Code, Cursor…) start
// it as a subprocess; it never prints anything but protocol messages to stdout.
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { LANGUAGE } from '../../src/language/config';
import { guide } from './knowledge';
import { createServer } from './server';
import { SERVER_VERSION } from './version';

const HELP = `asomiya-mcp ${SERVER_VERSION} — MCP server for ${LANGUAGE.name} (${LANGUAGE.nativeName}) ${LANGUAGE.version}

Lets AI assistants write, check, run and explain Asomiya programs.
It talks MCP over stdin/stdout; add it to your AI app instead of running it by hand:

  { "mcpServers": { "asomiya": { "command": "npx", "args": ["-y", "asomiya-mcp"] } } }

Options:
  --guide     print the guide for AI assistants (Markdown)
  --version   print the version

More: https://asomiya.codes/ai/
`;

const arg = process.argv[2];
if (arg === '--guide') {
  // The guide for AI assistants as Markdown (the website publishes it as /llms-full.txt).
  process.stdout.write(guide());
} else if (arg === '--help' || arg === '-h') {
  process.stdout.write(HELP);
} else if (arg === '--version' || arg === '-v') {
  process.stdout.write(`${SERVER_VERSION}\n`);
} else if (arg !== undefined) {
  process.stderr.write(`Unknown option: ${arg}\n\n${HELP}`);
  process.exitCode = 2;
} else {
  const server = createServer();
  await server.connect(new StdioServerTransport());
  // Logs go to stderr; stdout belongs to the protocol.
  process.stderr.write(`asomiya-mcp ${SERVER_VERSION} running on stdio\n`);
}
