/**
 * Branding for the language. Everything user-facing that names the language reads from here,
 * so a rebrand is a one-file change.
 */
export interface LanguageConfig {
  /** Latin-script name, used for the npm package and in English text. */
  readonly name: string;
  /** Name in Assamese script. */
  readonly nativeName: string;
  /** Command name of the CLI binary. */
  readonly cliName: string;
  /** Preferred source-file extension, including the dot. */
  readonly fileExtension: string;
  readonly version: string;
}

export const LANGUAGE: LanguageConfig = {
  name: 'Asomiya',
  nativeName: 'অসমীয়া',
  cliName: 'asomiya',
  fileExtension: '.asom',
  version: '0.3.2',
};
