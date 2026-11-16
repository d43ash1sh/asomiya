import arithmetic from '../../examples/arithmetic.asom';
import conditionals from '../../examples/conditionals.asom';
import functions from '../../examples/functions.asom';
import greet from '../../examples/greet.asom';
import hello from '../../examples/hello.asom';
import lists from '../../examples/lists.asom';
import loops from '../../examples/loops.asom';
import variables from '../../examples/variables.asom';

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
  { file: 'greet.asom', label: 'ইনপুট — সোধা (input)', source: greet, stdin: 'দেবাশীষ' },
];
