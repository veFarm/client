import bn from "bignumber.js";

/**
 * Returns a string representation (in scientific notation) of value
 * formatted with 18 digits and the specified amount of decimal places.
 * Defaults to 0 decimals if not specified.
 */
export function formatUnits(value: string, decimals: number = 0): string {
  return bn(value).div(bn(1e18)).decimalPlaces(decimals).toString();
}

// TODO: rename to
// export function expandTo18Decimals(n: number): BigNumber {
//   return bigNumberify(n).mul(bigNumberify(10).pow(18))
// }
