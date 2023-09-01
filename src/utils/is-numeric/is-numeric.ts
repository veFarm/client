/**
 * Verifies if the provided string consists exclusively of numbers/digits.
 * @param {string} str String to validate.
 * @return 'true' if the given string is numeric and 'false' otherwise.
 */
export function isNumeric(str: string): boolean {
  if (str.length === 0) return false;
  return /^\d*$/.test(str);
}
