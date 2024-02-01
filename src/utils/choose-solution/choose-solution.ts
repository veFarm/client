import type { BigNumber } from "bignumber.js";
import type { Sol } from "@/stores/trades-forecast";

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
// export type FindExecutableTrade = (
//   balance: Balance,
//   reserveBalance: BigNumber,
//   solutions: Sol[],
// ) => Sol | undefined;

// /**
//  * Look for a solution with the highest withdraw amount
//  * that could be executed right now based on the account's data.
//  * @param {Balance} balance Account balance.
//  * @param {BigNumber} reserveBalance Reserve balance.
//  * @param {Sol[]} solutions Set of optimized solutions associated to
//  * the given account.
//  * @return {Sol | undefined} Highest solution or undefined in case
//  * solutions could not be executed right now.
//  */
// export function findExecutableTrade(
//   balance: Balance,
//   reserveBalance: BigNumber,
//   solutions: Sol[],
// ): Sol | undefined {
//   let solution: Sol | undefined;

//   for (const sol of solutions) {
//     const isExecutable = balance.vtho.gte(
//       sol.withdrawAmount.plus(reserveBalance),
//     );

//     const isHigher =
//       solution == undefined || sol.withdrawAmount.gt(solution.withdrawAmount);

//     if (isExecutable && isHigher) {
//       solution = sol;
//     }
//   }

//   return solution;
// }
