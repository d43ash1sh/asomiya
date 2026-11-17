/**
 * "Did you mean …?" for romanised Assamese. Romanisation has no standard spelling, so the glossary
 * accepts several common spellings; anything else that is close to one of them gets a suggestion
 * instead of a bare "undefined variable" error.
 */
import { BUILTIN_NAMES, BUILTIN_ROMAN, KEYWORD_GLOSSARY, type BuiltinKey } from './glossary';

const LATIN_NAME = /^[A-Za-z_'][A-Za-z0-9_']*$/;

interface Candidate {
  /** A spelling that is accepted. */
  readonly spelling: string;
  /** What to suggest: the preferred Roman spelling and the Assamese word. */
  readonly suggestion: string;
}

function buildCandidates(): readonly Candidate[] {
  const out: Candidate[] = [];
  for (const entry of KEYWORD_GLOSSARY) {
    const preferred = entry.roman[0];
    if (preferred === undefined) continue;
    for (const spelling of entry.roman) {
      out.push({ spelling, suggestion: `${preferred} (${entry.word})` });
    }
  }
  for (const key of Object.keys(BUILTIN_ROMAN) as BuiltinKey[]) {
    const spellings = BUILTIN_ROMAN[key];
    const preferred = spellings[0];
    if (preferred === undefined) continue;
    for (const spelling of spellings) {
      out.push({ spelling, suggestion: `${preferred} (${BUILTIN_NAMES[key]})` });
    }
  }
  return out;
}

const CANDIDATES = buildCandidates();

/** Levenshtein distance, stopping early once it exceeds `limit`. */
function editDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min((prev[j] ?? 0) + 1, (row[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
      row.push(value);
      best = Math.min(best, value);
    }
    if (best > limit) return limit + 1;
    prev = row;
  }
  return prev[b.length] ?? limit + 1;
}

/**
 * For a Latin-script name that isn't defined, the closest romanised keyword or built-in, e.g.
 * `kowaa` → `kowa (কোৱা)`. Returns undefined when nothing is close enough.
 */
export function suggestRoman(name: string): string | undefined {
  // One- and two-letter names (x, i, ab) are ordinary variables, not misspelt keywords.
  if (name.length < 3 || !LATIN_NAME.test(name)) return undefined;
  const lower = name.toLowerCase();
  // Short words allow one mistake, longer ones two.
  const limit = lower.length <= 4 ? 1 : 2;
  let best: Candidate | undefined;
  let bestDistance = limit + 1;
  for (const candidate of CANDIDATES) {
    const d = editDistance(lower, candidate.spelling, limit);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  // Exact match on a keyword can't reach here; exact match on a built-in means the user is
  // using it with different case (e.g. `Path`), which is still worth pointing out.
  return best?.suggestion;
}
