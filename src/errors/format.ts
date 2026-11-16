import type { MessageLanguage } from '../language/types';
import { graphemes } from '../lexer/unicode';
import { phaseOf, type Diagnostic } from './diagnostic';
import { PHASE_LABELS, renderMessage } from './messages';

export interface FormatOptions {
  readonly lang: MessageLanguage;
  /** Full source text; when given, the offending line is shown with a caret. */
  readonly source?: string;
  readonly fileName?: string;
}

/**
 * Renders a diagnostic for humans:
 *
 *   চলোৱাৰ সময়ৰ ভুল [R001]: "ক" নামৰ কোনো চলক ঘোষণা কৰা হোৱা নাই
 *     --> hello.asom:3:6
 *      |
 *    3 | কোৱা(ক)
 *      |      ^
 */
export function formatDiagnostic(d: Diagnostic, options: FormatOptions): string {
  const { lang, source, fileName } = options;
  const label = PHASE_LABELS[phaseOf(d.code)][lang];
  const message = renderMessage(d.code, d.params, lang);
  const { line, column } = d.span.start;
  const lines = [`${label} [${d.code}]: ${message}`];
  lines.push(`  --> ${fileName ?? '<input>'}:${line}:${column}`);

  const sourceLine = source?.split(/\r\n|\r|\n/)[line - 1];
  if (sourceLine !== undefined) {
    const gutter = String(line).length;
    const pad = ' '.repeat(gutter);
    // Terminals draw one cell per grapheme cluster (roughly), so count clusters, not code points.
    const before = Array.from(sourceLine)
      .slice(0, column - 1)
      .join('');
    const indent = graphemes(before)
      .map((g) => (g === '\t' ? '\t' : ' '))
      .join('');
    const spanText =
      d.span.end.line === line ? source?.slice(d.span.start.offset, d.span.end.offset) : '';
    const width = Math.max(1, graphemes(spanText ?? '').length);
    lines.push(`${pad} |`);
    lines.push(`${String(line)} | ${sourceLine}`);
    lines.push(`${pad} | ${indent}${'^'.repeat(width)}`);
  }
  return lines.join('\n');
}
