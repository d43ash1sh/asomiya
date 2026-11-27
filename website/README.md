# asomiya.codes

The source of the Asomiya website: documentation and the browser playground, in English (`/`) and
Assamese (`/as/`).

```sh
npm run website:build    # → website/dist/
npm run website:serve    # build, then serve at http://localhost:8080
npm run website:og       # redraw the link-preview images (needs Chrome), then commit website/og/
```

## Layout

| Path              | What's there                                                                    |
| ----------------- | ------------------------------------------------------------------------------- |
| `site.config.mjs` | Site URL, **social links** and the team. Edit this to add LinkedIn, X, etc.     |
| `content/`        | One file per section. Each page has an English and an Assamese version.         |
| `content/ui.mjs`  | Interface text (menus, buttons) in both languages.                              |
| `lib/`            | Page layout, helpers (`h.example`, `h.note`, …), highlighting, icons.           |
| `src/client/`     | Browser scripts (TypeScript), bundled by `tsup.website.config.ts`.              |
| `src/playground/` | DOM-free playground logic, unit-tested in `tests/website/`.                     |
| `styles.css`      | All styles, light and dark.                                                     |
| `public/`         | Files copied as-is (favicon).                                                   |
| `og/`             | Link-preview images (1200×630), one per page, drawn by `scripts/og-images.mjs`. |

## Writing content

- `h.example(assamese, english)` shows a sample with two tabs (Assamese script / English letters),
  a **Try it** link to the playground, and its output. **Every sample is run at build time**; the
  build fails if one errors, unless it is marked `{ expectError: true }`.
- `h.sample(code)` is a single-version sample; `h.shell(cmd)` a terminal command; `h.note(kind, html)`
  a callout (`note`, `tip`, `warning`); `h.h2(id, text)` a heading that appears in "On this page".
- Keyword, built-in and error tables are generated from the interpreter, so they never go stale.

## Link previews

Every page has its own `og:image` card, so a link shared on WhatsApp, Facebook, X or LinkedIn
shows a picture with the page title. After adding or renaming a page, or changing a title or
description, run `npm run website:og` and commit `website/og/`. The cards are drawn by Chrome so
Assamese text is shaped exactly as in a browser. A test fails if a page has no card of its own.

## Security

Every page has a strict Content Security Policy (only this site's scripts, no inline script). The
one exception is Google Analytics (`ANALYTICS` in `site.config.mjs`): its script and page-view
requests are allowed, and visitors with Do Not Track or Global Privacy Control on are not counted. The playground runs code in a Web Worker and inserts output as text only.
`tests/website/site.test.ts` checks this, and that every internal link works, on every CI run.
