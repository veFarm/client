/**
 * Checks whether or not the given string is empty
 * or a string of zeros.
 * @param {string} str String to be validated.
 * @return 'true' if the given string is zero or empty.
 * 'false' otherwise.
 */
export function isZeroOrEmpty(str: string): boolean {
  return str.trim() === "" || parseInt(str, 10) === 0; // case when str equals "000..."
}
