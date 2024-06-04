import type { BigNumber } from "bignumber.js";
import type { Sol } from "./solver";
import { expandTo18Decimals } from "./expand-to-18-decimals";

export const MAX_WITHDRAW_AMOUNT = 5_000;
export const PROTOCOL_FEE_MULTIPLIER = 3; // TODO: this should be pulled from contract
export const DEX_FEE_MULTIPLIER = 3; // TODO: idem
// TODO: read constants from config file

export type ExtendSolution = (
  sol: Sol,
  vthoBalance: BigNumber,
  reserveBalance: BigNumber,
  txFee: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
) => Sol;

/**
 * Checks whether or not the provided solution can be executed
 * using a larger withdraw amount.
 * @param {Sol} sol Executable trade / solution.
 * @param {BigNumber} vthoBalance VTHO balance.
 * @param {BigNumber} reserveBalance Reserve balance.
 * @param {BigNumber} txFee Transaction fee.
 * @param {BigNumber} reserveIn VTHO DEX reserves.
 * @param {BigNumber} reserveOut VET DEX reserves.
 * @return {Sol} Extended solution.
 */
export function extendSolution(
  sol: Sol,
  vthoBalance: BigNumber,
  reserveBalance: BigNumber,
  txFee: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
): Sol {
  const extSol: Sol = { ...sol };

  // TODO: max out amount as long as slippage stays low.
  if (vthoBalance.gt(sol.withdrawAmount.plus(reserveBalance))) {
    // Max out withdraw amount for the given solution (strategy).
    let withdrawAmount = vthoBalance.minus(reserveBalance);

    if (withdrawAmount.gt(expandTo18Decimals(MAX_WITHDRAW_AMOUNT))) {
      withdrawAmount = expandTo18Decimals(MAX_WITHDRAW_AMOUNT);
    }

    // TODO: extract the following logic and add tests
    // Recalculate fees and deltaVET for the new withdraw amount.
    const protocolFee = withdrawAmount
      .minus(txFee)
      .times(PROTOCOL_FEE_MULTIPLIER)
      .div(1_000);
    const dexFee = withdrawAmount
      .minus(txFee)
      .minus(protocolFee)
      .times(DEX_FEE_MULTIPLIER)
      .div(1_000);

    const amountInWithFees = withdrawAmount
      .minus(txFee)
      .minus(protocolFee)
      .minus(dexFee);

    const numerator = amountInWithFees.times(reserveOut);
    const denominator = reserveIn.plus(amountInWithFees);

    // VET balance increase after the swap is performed.
    const deltaVET = numerator.div(denominator);

    extSol.withdrawAmount = withdrawAmount;
    extSol.protocolFee = protocolFee;
    extSol.dexFee = dexFee;
    extSol.amountInWithFees = amountInWithFees;
    extSol.deltaVET = deltaVET;
  }

  return extSol;
}
