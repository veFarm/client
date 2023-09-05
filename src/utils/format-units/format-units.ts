import bn from "bignumber.js";
import type { BigNumber } from "bignumber.js";
import { truncateDecimalString } from "@/utils/truncate-decimal-string";

/**
 * Converts value into a decimal string and the specified amount of decimal places.
 * @param {BigNumber} value Value to be formatted.
 * @param {number} decimals Decimal places.
 */
export function formatUnits(value: BigNumber, decimals?: number): string {
  const ether = value.div(bn(1e18)).toFixed();
  return decimals != null ? truncateDecimalString(ether, decimals) : ether;
}
