# asomiya-mcp — Asomiya for AI assistants

An [MCP](https://modelcontextprotocol.io) server for **[Asomiya (অসমীয়া)](https://asomiya.codes)**,
the programming language in Assamese. It lets Claude, ChatGPT, VS Code, Cursor and other AI apps
**write, check, run and explain** Asomiya programs, and shows a live playground right in the chat.

```text
You:     Asomiyat 1 ru 10 loike jog kora program ekhon likha
Claude:  (reads the Asomiya guide, writes the program, runs it)

         ধৰা যোগফল = ০
         ধৰা ক = ১
         যেতিয়ালৈকে (ক <= ১০) {
             যোগফল = যোগফল + ক
             ক = ক + ১
         }
         কোৱা("যোগফল: " + যোগফল)

         Output: যোগফল: ৫৫
```

AI models barely know Asomiya, so on their own they guess keywords and get them wrong. With this
server they look the language up, test every program before showing it, and explain errors in
Assamese or English.

## Install

You need [Node.js](https://nodejs.org) 20 or newer.

**Claude Desktop:** download `asomiya-<version>.mcpb` from the
[releases page](https://github.com/d43ash1sh/asomiya/releases) and double-click it. Or add this to
`claude_desktop_config.json` (Settings → Developer → Edit Config):

```json
{
  "mcpServers": {
    "asomiya": { "command": "npx", "args": ["-y", "asomiya-mcp"] }
  }
}
```

**Claude Code:**

```bash
claude mcp add asomiya -- npx -y asomiya-mcp
```

**VS Code** (Copilot agent mode):

```bash
code --add-mcp '{"name":"asomiya","command":"npx","args":["-y","asomiya-mcp"]}'
```

**Cursor, Windsurf, Goose and others:** add a stdio server with the command `npx` and the
arguments `-y asomiya-mcp`, using the same JSON as for Claude Desktop.

Then ask, for example: _"Teach me loops in Asomiya"_, _"Write a program in Assamese that checks
whether a number is even"_ or _"Translate this Python to Asomiya"_.

## What it gives the AI

### Tools

| Tool                | What it does                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `run_asomiya`       | Runs a program and returns its output, or the error with code, line and message in English and Assamese. Takes input lines for `সোধা`. Shows the playground in apps that support MCP Apps. |
| `check_asomiya`     | Finds spelling and syntax errors without running the program.                                                                                                                              |
| `asomiya_to_python` | Shows the same program in Python (it prints exactly the same output).                                                                                                                      |
| `lookup_keyword`    | Looks up keywords, built-ins and types in Assamese (`প্ৰতিটো`), English letters (`protito`) or English (`for each`).                                                                        |
| `explain_error`     | Explains an error code such as `P013` or `R007`, with an example and how to fix it.                                                                                                        |

All tools are read-only and run offline.

### Resources

- `asomiya://guide` — a compact, tested guide written for AI assistants: every keyword and built-in,
  and the rules that differ from Python. Start here.
- `asomiya://docs/…` — the language specification, grammar, keywords, romanisation, error
  reference and architecture, exactly as in the repository.
- `asomiya://examples/{name}` — the example programs.
- `ui://asomiya/playground.html` — the in-chat playground (an
  [MCP App](https://github.com/modelcontextprotocol/ext-apps)): highlighted, editable code, its
  output, a Run button and a link to asomiya.codes.

### Prompts

- `teach_asomiya` — a short lesson on a topic (variables, loops, functions…), in English,
  Assamese or another language, with examples that are really run, and an exercise.
- `translate_to_asomiya` — rewrites a Python (or other) program in Asomiya and checks it runs.

## Safe by design

Asomiya programs run in the bundled interpreter, which can't touch files, the network or the
system. There is no `eval`, a run stops after 10 million steps or 500 nested calls, and values
have size limits. The server makes no network requests, collects nothing, and has **no runtime
dependencies**: the interpreter, the MCP SDK and the docs are bundled into one file.

## Versions

asomiya-mcp 0.1.0 includes Asomiya 0.5.0. It speaks MCP protocol versions 2024-10-07 to
2025-11-25 over stdio, so it works with current and older clients.

## Develop

From the repository root:

```bash
npm run mcp:build   # mcp/dist/index.js and the playground view
npx vitest run tests/mcp
npm run mcp:pack    # mcp/asomiya.mcpb for Claude Desktop
```

Publishing is described in [PUBLISHING.md](PUBLISHING.md).

## License

MIT. Part of the [Asomiya](https://github.com/d43ash1sh/asomiya) project.
