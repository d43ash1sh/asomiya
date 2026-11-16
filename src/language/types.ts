/** Runtime value kinds and their names in each supported message language. */
export type ValueKind = 'number' | 'string' | 'boolean' | 'null' | 'list' | 'function';

export type MessageLanguage = 'as' | 'en';

export const TYPE_NAMES: Readonly<Record<ValueKind, Readonly<Record<MessageLanguage, string>>>> = {
  number: { as: 'সংখ্যা', en: 'number' },
  string: { as: 'পাঠ', en: 'text' },
  boolean: { as: 'সঁচা-মিছা', en: 'boolean' },
  null: { as: 'খালী', en: 'null' },
  list: { as: 'তালিকা', en: 'list' },
  function: { as: 'ফাংচন', en: 'function' },
};

export function typeName(kind: ValueKind, lang: MessageLanguage): string {
  return TYPE_NAMES[kind][lang];
}
