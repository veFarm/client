import type { BigNumber } from "bignumber.js";

/**
 * Choose the 'best' withdraw amount for the given vtho balance.
 * @param {BigNumber[]} withdrawAmounts Array of possible withdraw amounts.
 * @param {BigNumber} vthoBalance VTHO balance.
 * @param {BigNumber} reserveBalance Reserve balance.
 * @return {BigNumber} Best withdraw amount.
 */
export function chooseWithdrawAmount(
  withdrawAmounts: BigNumber[],
  vthoBalance: BigNumber,
  reserveBalance: BigNumber,
): BigNumber {
  // Default to lowest possible withdraw amount.
  let withdrawAmount = withdrawAmounts[0];

  // In case the current balance is large enough to use a
  // higher withdraw amount, use it.
  for (let wa of withdrawAmounts) {
    if (vthoBalance.gte(wa.plus(reserveBalance))) {
      withdrawAmount = wa;
    }
  }

  return withdrawAmount;
}
