/** Messages between the editor and the run worker, and the shared input buffer's layout. */

/** Int32 [0]: 1 when a line is ready; Int32 [1]: its length in bytes, or -1 at end of input. */
export const INPUT_HEADER = 8;
/** Longer input lines are cut to this many bytes. */
export const INPUT_CAPACITY = 64 * 1024;

export type FromWorker =
  | { readonly type: 'output'; readonly text: string }
  | { readonly type: 'input' }
  | { readonly type: 'done'; readonly error: string | null };
