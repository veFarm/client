import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";

/**
 * Returns a string representation (in scientific notation) of value
 * formatted with 18 digits and the specified amount of decimal places.
 * Defaults to 0 decimals if not specified.
 */
export function formatUnits(value: BigNumber, decimals: number = 0): string {
  return value.div(bn(1e18)).decimalPlaces(decimals).toString();
}
