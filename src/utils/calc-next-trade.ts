import type { BigNumber } from "bignumber.js";
import bn from "bignumber.js";
import type { Balance } from "@/typings/types";
import { secondsToTrigger } from "@/utils/seconds-to-trigger";
import { secondsToDHMS } from "@/utils/seconds-to-dhms";

export type Trade = {
  withdrawAmount: BigNumber;
  amountOut: BigNumber;
  txFee: BigNumber;
  protocolFee: BigNumber;
  dexFee: BigNumber;
  totalFees: BigNumber;
  timeLeft: string;
};

/**
 *
 * @param {BigNumber} reserveBalance Reserve balance in wei.
 * @param {BigNumber} triggerBalance Trigger balance in wei.
 * @param {Balance} balance Account balance for both VET and VTHO in wei.
 * @param {BigNumber} txFee Trader.swap transaction fee in wei.
 * @param {BigNumber} exchangeRate Exchange rate VET -> VTHO in wei.
 * @return Trade.
 */
// TODO: when calling this function pass either triggerBalance or balance.vtho based on
// bn(parseUnits(balance)).gt(bn(parseUnits(triggerBalance))) ? balance : triggerBalance
// TODO: should we use BN or strings?
// TODO: make sure we pass params in WEI!
// TODO: Should we substract the fee when using this on the ConfigForm component
export function calcNextTrade(
  reserveBalance: BigNumber,
  triggerBalance: BigNumber,
  balance: Balance,
  txFee: BigNumber,
  exchangeRate: BigNumber, // TODO: should we use BigNumber or number?
): Trade | undefined {
  const seconds = secondsToTrigger(balance, triggerBalance);

  // 'undefined' means no trade is possible (balance.vet === 0 && balance.vtho < triggerBalance).
  if (seconds == null) return;

  const { d, h, m } = secondsToDHMS(seconds);

  // Use the most significant figure to represent the time left.
  // In case of seconds, default to a 5 min window.
  const timeLeft: string =
    d + h + m === 0
      ? "5 mins"
      : d > 0
      ? `${d} days`
      : h > 0
      ? `${h} hours`
      : `${m} minutes`;

  // TODO: substract fee
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
    timeLeft,
  };
}
