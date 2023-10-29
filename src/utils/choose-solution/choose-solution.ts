import type { BigNumber } from "bignumber.js";
import type { Sol } from "@/stores/trade-forecast";

/**
 * Choose the 'best' withdraw amount for the given vtho balance.
 * @param {BigNumber} vthoBalance VTHO balance.
 * @param {BigNumber} reserveBalance Reserve balance.
 * @param {Sol[]} solutions Array of possible solutions (withdrawAmounts).
 * @return {Sol} Best solution.
 */
// TODO: check. This assumes that there exists a feasible solution and
// the solutions are ordered in ascending order.
export function chooseSolution(
  vthoBalance: BigNumber,
  reserveBalance: BigNumber,
  solutions: Sol[],
): Sol {
  // Default to lowest possible withdraw amount.
  let sol = solutions[0];

  // In case the current balance is large enough to use a
  // higher withdraw amount, use it.
  for (const s of solutions) {
    if (vthoBalance.gte(s.withdrawAmount.plus(reserveBalance))) {
      sol = s;
    }
  }

  return sol;
}
