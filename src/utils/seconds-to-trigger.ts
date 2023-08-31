import type { BigNumber } from "bignumber.js";
import type { Balance } from "@/typings/types";

/**
 * Compute the amount of seconds till reaching the triggerBalance.
 * Observation: 1 VET produces 5 * 10 ** -9 VTHO per second.
 * @param {BigNumber} balance Account balance for both VET and VTHO in wei.
 * @param {BigNumber} triggerBalance Trigger balance in wei.
 * @return Seconds to reach the triggerBalance.
 * @todo see https://vechainstats.com/vtho-calculator/ for testing.
 */
export function secondsToTrigger(
  balance: Balance,
  triggerBalance: BigNumber,
): number | undefined {
  const diff = triggerBalance.minus(balance.vtho);

  // Execute the trade right away when balance.vtho >= triggerBalance.
  if (diff.lte(0)) return 0;

  // No way to reach the triggerBalance when balance.vet === 0.
  if (balance.vet.eq(0)) return;

  // VTHO per second for the current VET balance.
  const rate = balance.vet.times(5e-9); // not zero

  // Amount of seconds till reaching the triggerBalance.
  return diff.div(rate).toNumber();
}
