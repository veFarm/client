import bn from "bignumber.js";

/**
 * Returns a string representation of value formatted with unit digits
 * and the specified number of decimal places.
 * @param value
 * @param digits
 * @param decimals
 * @returns
 */
export function formatUnits(
  value: string,
  digits: number,
  decimals: number,
): string {
  return bn(value).div(bn(10).pow(digits)).decimalPlaces(decimals).toString();
}
