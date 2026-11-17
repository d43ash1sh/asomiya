/** `.asom` example files are bundled as text (tsup `loader: { '.asom': 'text' }`). */
declare module '*.asom' {
  const source: string;
  export default source;
}
