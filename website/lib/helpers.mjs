// Helpers available to page content as `h`. Each page gets its own instance, which collects the
// headings for the "On this page" list and checks every code sample by running it.
import { formatDiagnostic, runSource } from '../../dist/index.js';
import { UI } from '../content/ui.mjs';
import { highlight } from './highlight.mjs';
import { esc, rel, shareHash } from './html.mjs';
import { icon } from './icons.mjs';

/** Runs a sample with the real interpreter. A sample that should work but fails stops the build. */
function runSample(source, { stdin = '', lang, expectError = false, where }) {
  const lines = stdin === '' ? [] : stdin.split('\n');
  const result = runSource(source, { readLine: () => lines.shift() ?? null });
  if (result.error !== null && !expectError) {
    throw new Error(`Code sample failed on ${where}:\n${source}\n\n${result.error.message}`);
  }
  if (result.error === null && expectError) {
    throw new Error(`Code sample on ${where} was expected to fail but ran:\n${source}`);
  }
  const error =
    result.error === null
      ? null
      : formatDiagnostic(result.error.diagnostic, { lang, source, fileName: 'program.asom' });
  return { output: result.output, error };
}

export function createHelpers(page, lang) {
  const t = UI[lang];
  const toc = [];
  const where = `${page.url}`;
  const playground = rel(page.url, lang === 'as' ? 'as/playground/' : 'playground/');

  function heading(level, id, text) {
    toc.push({ level, id, text: esc(text) });
    return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${esc(text)}</h${level}>`;
  }

  function outputBlock({ output, error }) {
    if (output === '' && error === null) return '';
    return `<div class="code-output"><span class="code-output-label">${esc(t.output)}</span><pre>${esc(output)}${
      error === null ? '' : `<span class="error">${esc(error)}</span>`
    }</pre></div>`;
  }

  function pane(source, script, opts) {
    const ran = opts.output === false ? null : runSample(source, { ...opts, lang, where });
    const tools = `<div class="code-tools">
      ${opts.run === false ? '' : `<a class="code-btn" href="${playground}${shareHash(source)}">${icon('play')}<span>${esc(t.tryIt)}</span></a>`}
      <button class="code-btn" type="button" data-copy="" data-copied="${esc(t.copied)}" aria-label="${esc(t.copy)}">${icon('copy')}</button>
    </div>`;
    return `<div class="pane" data-pane="${script}">
    ${tools}
    <pre class="code"><code>${highlight(source)}</code></pre>
    ${ran === null ? '' : outputBlock(ran)}
  </div>`;
  }

  return {
    toc,
    t,
    lang,
    /** A link to another page of the site, in the current language. */
    link(path) {
      return rel(page.url, lang === 'as' ? `as/${path}` : path);
    },
    asset(path) {
      return rel(page.url, path);
    },
    playground,
    h2: (id, text) => heading(2, id, text),
    h3: (id, text) => heading(3, id, text),

    /**
     * A runnable sample in both scripts. The reader picks Assamese script or English letters once,
     * and every sample on the site follows that choice.
     */
    example(asSource, romanSource, opts = {}) {
      const title = opts.title ? `<span class="code-title">${esc(opts.title)}</span>` : '';
      return `<div class="code-block" data-tabs>
  <div class="code-head">
    <div class="script-tabs" role="group" aria-label="Script">
      <button type="button" data-script-tab="as">${esc(t.scriptTabs.as)}</button>
      <button type="button" data-script-tab="roman">${esc(t.scriptTabs.roman)}</button>
    </div>
    ${title}
  </div>
  ${pane(asSource, 'as', opts)}
  ${pane(romanSource, 'roman', opts)}
</div>`;
    },

    /** A sample that only exists in one form (or a mixed-script one). */
    sample(source, opts = {}) {
      const title = opts.title
        ? `<div class="code-head"><span class="code-title">${esc(opts.title)}</span></div>`
        : '';
      return `<div class="code-block">${title}${pane(source, 'any', opts)}</div>`;
    },

    /** A terminal command (not Asomiya code). */
    shell(command, opts = {}) {
      return `<div class="code-block shell">
  <div class="code-tools"><button class="code-btn" type="button" data-copy="${esc(opts.copy ?? command)}" data-copied="${esc(t.copied)}" aria-label="${esc(t.copy)}">${icon('copy')}</button></div>
  <pre class="code"><code>${command
    .split('\n')
    .map((line) =>
      line.startsWith('#')
        ? `<span class="tok-com">${esc(line)}</span>`
        : `<span class="prompt">$</span> ${esc(line)}`,
    )
    .join('\n')}</code></pre>
</div>`;
    },

    /** Plain preformatted text (CLI output, error messages). */
    pre(text) {
      return `<div class="code-block"><pre class="code"><code>${esc(text)}</code></pre></div>`;
    },

    note(kind, html) {
      const label = { note: t.note, tip: t.tip, warning: t.warning }[kind];
      return `<div class="callout callout-${kind}"><p class="callout-title">${esc(label)}</p>${html}</div>`;
    },

    /** A table from rows of already-safe HTML cells. */
    table(head, rows) {
      return `<div class="table-wrap"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows
        .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`;
    },

    code: (text) => `<code>${esc(text)}</code>`,
    esc,
  };
}
