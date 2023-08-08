import bn from "bignumber.js";

/**
 * Returns a string representation of value formatted with unit digits.
 */
export function parseUnits(value: string, digits: number): string {
  return bn(value).times(bn(10).pow(digits)).toString();
}
