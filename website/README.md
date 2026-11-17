# asomiya.codes

The source of the Asomiya website: documentation and the browser playground, in English (`/`) and
Assamese (`/as/`).

```sh
npm run website:build    # → website/dist/
npm run website:serve    # build, then serve at http://localhost:8080
```

## Layout

| Path              | What's there                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `site.config.mjs` | Site URL, **social links** and the team. Edit this to add LinkedIn, X, etc. |
| `content/`        | One file per section. Each page has an English and an Assamese version.     |
| `content/ui.mjs`  | Interface text (menus, buttons) in both languages.                          |
| `lib/`            | Page layout, helpers (`h.example`, `h.note`, …), highlighting, icons.       |
| `src/client/`     | Browser scripts (TypeScript), bundled by `tsup.website.config.ts`.          |
| `src/playground/` | DOM-free playground logic, unit-tested in `tests/website/`.                 |
| `styles.css`      | All styles, light and dark.                                                 |
| `public/`         | Files copied as-is (favicon).                                               |

## Writing content

- `h.example(assamese, english)` shows a sample with two tabs (Assamese script / English letters),
  a **Try it** link to the playground, and its output. **Every sample is run at build time**; the
  build fails if one errors, unless it is marked `{ expectError: true }`.
- `h.sample(code)` is a single-version sample; `h.shell(cmd)` a terminal command; `h.note(kind, html)`
  a callout (`note`, `tip`, `warning`); `h.h2(id, text)` a heading that appears in "On this page".
- Keyword, built-in and error tables are generated from the interpreter, so they never go stale.

## Security

Every page has a strict Content Security Policy (only this site's scripts, no inline script, no
network requests). The playground runs code in a Web Worker and inserts output as text only.
`tests/website/site.test.ts` checks this, and that every internal link works, on every CI run.
