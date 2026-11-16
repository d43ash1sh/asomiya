/**
 * Size limits. The step budget bounds *time*, but one step can allocate a lot (`ল = ল + ল`
 * doubles a list), so without these a short program can exhaust the host's memory and crash the
 * process, which no error handler can catch.
 */

/** Longest text value, in UTF-16 code units (~20 MB). */
export const MAX_TEXT_LENGTH = 10_000_000;

/** Longest list. */
export const MAX_LIST_LENGTH = 1_000_000;

/**
 * Copying or scanning `n` items costs `n / SIZE_COST_DIVISOR` extra steps, so the step budget
 * also accounts for work hidden inside a single operation.
 */
export const SIZE_COST_DIVISOR = 64;
