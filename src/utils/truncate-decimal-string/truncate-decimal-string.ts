/**
 * Truncate a string in float format to the desired number of decimals
 * @param {string} str String to be truncated.
 * @param {number} decimals Number of decimal places.
 * @return The truncated string.
 */
export function truncateDecimalString(str: string, decimals: number): string {
  const chunks = str.split(".");

  const zeros = Array(decimals).fill(0).join("");

  if (chunks.length === 1) {
    return chunks[0] + "." + zeros;
  }

  return chunks[0] + "." + chunks[1].concat(zeros).substring(0, decimals);
}
