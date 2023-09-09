import { secondsToTrigger } from "@/utils/seconds-to-trigger";
import { getTradeAmounts } from "@/utils/get-trade-amounts";
import type {
  GetTradeAmountsArgs,
  TradeAmounts,
} from "@/utils/get-trade-amounts";

export type Trade = TradeAmounts & {
  timeLeft: number;
};

/**
 * Compute next trade amounts and time.
 * @param {GetTradeAmountsArgs} args Arguments
 * @return Trade.
 */
// TODO: Should we substract the fee when using this on the ConfigForm component
export function calcNextTrade(args: GetTradeAmountsArgs): Trade | undefined {
  const timeLeft = secondsToTrigger(args.balance, args.triggerBalance);

  // 'undefined' means no trade is possible. This happens when
  // balance.vet === 0 && balance.vtho < triggerBalance.
  if (timeLeft == null) return;

  return {
    ...getTradeAmounts(args),
    timeLeft,
  };
}
