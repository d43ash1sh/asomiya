/** Markdown docs and the built view are bundled as text (tsup `loader`, vitest transform). */
declare module '*.md' {
  const text: string;
  export default text;
}

declare module '*.html' {
  const text: string;
  export default text;
}
