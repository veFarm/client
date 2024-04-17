import type { BigNumber } from "bignumber.js";
import type { Sol } from "@/stores/trades-forecast";
import { expandTo18Decimals } from "@/utils/expand-to-18-decimals";

const MAX_WITHDRAW_AMOUNT = 5_000;
const PROTOCOL_FEE_MULTIPLIER = 3;
const DEX_FEE_MULTIPLIER = 3;
// TODO: read constants from config file

/**
 * Checks whether or not the provided solution can be executed
 * using a larger withdraw amount.
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

  if (vthoBalance.gt(sol.withdrawAmount.plus(reserveBalance))) {
    // Max out withdraw amount for the given solution (strategy).
    const withdrawAmount = expandTo18Decimals(MAX_WITHDRAW_AMOUNT).gt(
      vthoBalance.minus(reserveBalance),
    )
      ? vthoBalance.minus(reserveBalance)
      : expandTo18Decimals(MAX_WITHDRAW_AMOUNT);

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
