import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";

/**
 * Returns a string representation of value formatted with 18 decimals.
 */
export function expandTo18Decimals(value: string | number): BigNumber {
  return bn(value).times(bn(1e18));
}
