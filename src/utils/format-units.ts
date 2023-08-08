import bn from "bignumber.js";

/**
 * Returns a string representation of value formatted with unit digits
 * and the specified amount of decimal places.
 */
export function formatUnits(
  value: string,
  digits: number,
  decimals = 0,
): string {
  return bn(value).div(bn(10).pow(digits)).decimalPlaces(decimals).toString();
}
