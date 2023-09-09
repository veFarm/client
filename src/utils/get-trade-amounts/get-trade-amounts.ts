import type { BigNumber } from "bignumber.js";
import bn from "bignumber.js";
import type { Balance } from "@/typings/types";

export type GetTradeAmountsArgs = {
  /** Reserve balance in wei. */
  reserveBalance: BigNumber;
  /** Trigger balance in wei. */
  triggerBalance: BigNumber;
  /** Account balance for both VET and VTHO in wei. */
  balance: Balance;
  /** Trader.swap transaction fee in wei. */
  txFee: BigNumber;
  /** Exchange rate VET -> VTHO in wei. */
  exchangeRate: BigNumber; // TODO: should we use BigNumber or number?
};

export type TradeAmounts = {
  /** VTHO amount to be withdrawn from the target account. */
  withdrawAmount: BigNumber;
  /** VET amount to be received in the target account after the swap. */
  amountOut: BigNumber;
  /** Cost of the Trader.swap transaction. */
  txFee: BigNumber;
  /** VeFarm protocol fee. */
  protocolFee: BigNumber;
  /** DEX protocol fee. */
  dexFee: BigNumber;
  /** Total amount of fees: txFee + protocolFee + dexFee. */
  totalFees: BigNumber;
};

/**
 * Compute trade amounts.
 * @param {GetTradeAmountsArgs} args Arguments.
 * @return Trade amounts.
 */
// TODO: Should we substract the fee when using this on the ConfigForm component
export function getTradeAmounts({
  reserveBalance,
  triggerBalance,
  balance,
  txFee,
  exchangeRate,
}: GetTradeAmountsArgs): TradeAmounts {
  // TODO: substract approve tx fee
  // TODO: use MAX_WITHDRAWAL_AMOUNT from Trader contract.
  // Always spend max possible amount.
  const withdrawAmount = balance.vtho.gt(triggerBalance)
    ? balance.vtho.minus(reserveBalance)
    : triggerBalance.minus(reserveBalance);

  const protocolFee = withdrawAmount.minus(txFee).times(3).div(1000);

  const dexFee = withdrawAmount
    .minus(txFee)
    .minus(protocolFee)
    .times(3)
    .div(1000);

  const totalFees = txFee.plus(protocolFee).plus(dexFee);

  const amountOut = withdrawAmount.gt(0)
    ? withdrawAmount.minus(totalFees).div(exchangeRate)
    : bn(0);

  return {
    withdrawAmount,
    amountOut,
    txFee,
    protocolFee,
    dexFee,
    totalFees,
  };
}
