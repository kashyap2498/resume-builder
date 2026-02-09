/**
 * Utility for conditionally joining class names together.
 * Filters out falsy values (false, undefined, null, empty string).
 */
export const cn = (
  ...classes: (string | false | undefined | null)[]
): string => classes.filter(Boolean).join(' ');
