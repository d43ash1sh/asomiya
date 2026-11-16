import { LANGUAGE } from '../language/config';
import type { MessageLanguage } from '../language/types';

type CliMessages = Readonly<{
  fileNotFound: (path: string) => string;
  notAFile: (path: string) => string;
  readFailed: (path: string, reason: string) => string;
  invalidUtf8: (path: string) => string;
  invalidNumber: (flag: string, value: string) => string;
  replBanner: () => string;
  replHelp: () => string;
  replBye: () => string;
}>;

export const CLI_MESSAGES: Readonly<Record<MessageLanguage, CliMessages>> = {
  as: {
    fileNotFound: (p) => `ভুল: ফাইল পোৱা নগ'ল: ${p}`,
    notAFile: (p) => `ভুল: এইটো ফাইল নহয়: ${p}`,
    readFailed: (p, r) => `ভুল: ফাইলটো পঢ়িব পৰা নগ'ল: ${p} (${r})`,
    invalidUtf8: (p) => `ভুল: ফাইলটো বৈধ UTF-8 লিখনি নহয়: ${p}`,
    invalidNumber: (f, v) => `ভুল: ${f}ৰ বাবে এটা ধনাত্মক অখণ্ড সংখ্যা লাগে, কিন্তু দিয়া হৈছে "${v}"`,
    replBanner: () =>
      `${LANGUAGE.nativeName} ${LANGUAGE.version} — সহায়ৰ বাবে .সহায়, ওলাই যাবলৈ .প্ৰস্থান বা Ctrl+D`,
    replHelp: () =>
      [
        'যিকোনো বাক্য লিখি Enter টিপক। { খোলা থাকিলে পৰৱৰ্তী শাৰীৰ বাবে অপেক্ষা কৰা হয়।',
        '  .সহায়  (.help)   এই সহায়',
        '  .প্ৰস্থান (.exit)   ওলাই যাওক',
        'Ctrl+C আধৰুৱা ইনপুট বাতিল কৰে।',
      ].join('\n'),
    replBye: () => 'বিদায়!',
  },
  en: {
    fileNotFound: (p) => `error: file not found: ${p}`,
    notAFile: (p) => `error: not a file: ${p}`,
    readFailed: (p, r) => `error: could not read ${p} (${r})`,
    invalidUtf8: (p) => `error: file is not valid UTF-8: ${p}`,
    invalidNumber: (f, v) => `error: ${f} needs a positive whole number, got "${v}"`,
    replBanner: () =>
      `${LANGUAGE.name} (${LANGUAGE.nativeName}) ${LANGUAGE.version} — type .help for help, .exit or Ctrl+D to quit`,
    replHelp: () =>
      [
        'Type any statement and press Enter. An open { waits for more lines.',
        '  .help  (.সহায়)    show this help',
        '  .exit  (.প্ৰস্থান)  quit',
        'Ctrl+C discards unfinished input.',
      ].join('\n'),
    replBye: () => 'Bye!',
  },
};
