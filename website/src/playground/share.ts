/**
 * Share links carry the program in the URL fragment as base64url-encoded UTF-8, so nothing is
 * sent to a server and Assamese text survives intact.
 */
const PREFIX = 'code=';

export function encodeSource(source: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(source)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Longest fragment accepted (≈ 150 KB of source). Larger links are ignored, not decoded. */
export const MAX_SHARED_LENGTH = 200_000;

export function decodeSource(encoded: string): string | null {
  if (encoded.length > MAX_SHARED_LENGTH) return null;
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

/** `#code=…` for a program. */
export function toHash(source: string): string {
  return `#${PREFIX}${encodeSource(source)}`;
}

/** The program in a `#code=…` fragment, or null if there is none or it is malformed. */
export function fromHash(hash: string): string | null {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!fragment.startsWith(PREFIX)) return null;
  return decodeSource(fragment.slice(PREFIX.length));
}
