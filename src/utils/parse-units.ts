import bn from "bignumber.js";

/**
 * Returns a string representation of value formatted with 18 digits.
 */
export function parseUnits(value: string): string {
  return bn(value).times(bn(1e18)).toString();
}
