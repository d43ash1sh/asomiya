import arithmetic from '../../../examples/arithmetic.asom';
import conditionals from '../../../examples/conditionals.asom';
import functions from '../../../examples/functions.asom';
import greet from '../../../examples/greet.asom';
import guess from '../../../examples/guess.asom';
import hello from '../../../examples/hello.asom';
import lists from '../../../examples/lists.asom';
import loops from '../../../examples/loops.asom';
import marks from '../../../examples/marks.asom';
import marksRoman from '../../../examples/marks_roman.asom';
import roman from '../../../examples/roman.asom';
import text from '../../../examples/text.asom';
import variables from '../../../examples/variables.asom';

export interface Example {
  /** File name in examples/. */
  readonly file: string;
  /** Label shown in the menu. */
  readonly label: string;
  readonly source: string;
  /** Suggested input for programs that use সোধা. */
  readonly stdin: string;
}

export const EXAMPLES: readonly Example[] = [
  { file: 'hello.asom', label: 'নমস্কাৰ (hello)', source: hello, stdin: '' },
  { file: 'variables.asom', label: 'চলক (variables)', source: variables, stdin: '' },
  { file: 'arithmetic.asom', label: 'অংক (arithmetic)', source: arithmetic, stdin: '' },
  { file: 'conditionals.asom', label: 'চৰ্ত (conditions)', source: conditionals, stdin: '' },
  { file: 'loops.asom', label: 'লুপ (loops)', source: loops, stdin: '' },
  { file: 'functions.asom', label: 'ফাংচন (functions)', source: functions, stdin: '' },
  { file: 'lists.asom', label: 'তালিকা (lists)', source: lists, stdin: '' },
  { file: 'text.asom', label: 'পাঠ (text)', source: text, stdin: '' },
  { file: 'marks.asom', label: 'নম্বৰ গণনা (marks)', source: marks, stdin: '' },
  { file: 'marks_roman.asom', label: 'Marks — English letters', source: marksRoman, stdin: '' },
  { file: 'roman.asom', label: 'Roman — English letters', source: roman, stdin: '' },
  { file: 'greet.asom', label: 'ইনপুট — সোধা (input)', source: greet, stdin: 'ৰীতা' },
  { file: 'guess.asom', label: 'অনুমান খেল (guessing game)', source: guess, stdin: '৫\n৮\n৭' },
];
