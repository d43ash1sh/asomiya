# Publishing asomiya-mcp

A release goes to three places:

| Where                                                                | How                                                      |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| [npm](https://www.npmjs.com/package/asomiya-mcp) (`npx asomiya-mcp`) | by hand, with your npm two-factor code                   |
| GitHub Release with `asomiya-<version>.mcpb` (Claude Desktop)        | automatic, on the `mcp-v*` tag                           |
| [MCP Registry](https://registry.modelcontextprotocol.io) listing     | automatic, on the `mcp-v*` tag (no secrets: GitHub OIDC) |

The registry only stores the listing and checks that the npm package of the same version has
`"mcpName": "io.github.d43ash1sh/asomiya"`, so **npm comes first**.

## Steps

1. Set the same version in `mcp/package.json`, `mcp/src/version.ts`, `mcp/server.json` (both
   `version` fields) and `mcp/manifest.json`, and add it to `mcp/CHANGELOG.md`. The tests check
   that they agree.
2. Check and build from the repository root:

   ```bash
   npm run check && npm run mcp:build
   ```

3. Publish to npm (it asks for your one-time code):

   ```bash
   cd mcp && npm publish --access public
   ```

4. Tag and push; the **MCP server** workflow packs the `.mcpb`, creates the GitHub Release and
   publishes the registry listing:

   ```bash
   git tag mcp-v0.1.0 && git push origin mcp-v0.1.0
   ```

5. Check the listing:

   ```bash
   curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.d43ash1sh/asomiya"
   ```

The workflow refuses to run if the tag doesn't match the version, or if that version isn't on npm
yet.
