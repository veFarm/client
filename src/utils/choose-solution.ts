import type { BigNumber } from "bignumber.js";
import type { Sol } from "@/stores/trades-forecast";

/**
 * Look for a solution that could be applied right now. Otherwise, default
 * to the solution with the minimum withdraw amount.
 * @param {BigNumber} vthoBalance VTHO balance.
 * @param {BigNumber} reserveBalance Reserve balance.
 * @param {[Sol, ...Sol[]]} solutions Array of possible solutions (withdrawAmounts).
 * @return {Sol} Best solution.
 */
export function chooseSolution(
  vthoBalance: BigNumber,
  reserveBalance: BigNumber,
  solutions: [Sol, ...Sol[]],
): Sol {
  // Sort solutions in ascending order of withdraw amount.
  // TODO: check the order
  const sorted = solutions.sort((a, b) =>
    a.withdrawAmount.lt(b.withdrawAmount) ? -1 : 1,
  );

  // Default to the solution with the lowest withdraw amount.
  let sol = sorted[0];

  // In case the current vtho balance is large enough to use another
  // solution/strategy with a higher withdraw amount, do it.
  for (const s of sorted) {
    if (vthoBalance.gte(s.withdrawAmount.plus(reserveBalance))) {
      sol = s;
    }
  }

  return sol;
}
