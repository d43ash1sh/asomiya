// Small HTML helpers for the site generator. All page text is written by us; anything that comes
// from data (code samples, program output, messages) goes through esc().

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Relative URL from one site path to another ('' = home, 'learn/' = a folder page). */
export function rel(from, to) {
  const depth = from.split('/').filter(Boolean).length;
  const [path, hash = ''] = to.split('#');
  const out = '../'.repeat(depth) + path;
  return (out === '' ? './' : out) + (hash === '' ? '' : `#${hash}`);
}

/** URL-safe base64 of UTF-8, the same format as the playground's share links. */
export function shareHash(source) {
  return '#code=' + Buffer.from(source, 'utf8').toString('base64url');
}
