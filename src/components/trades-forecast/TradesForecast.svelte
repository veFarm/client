<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { wallet } from "@/stores/wallet";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { calcNextTrade } from "@/utils/calc-next-trade";
  import type { Trade } from "@/utils/calc-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";

  export let reserveBalance: BigNumber;
  export let triggerBalance: BigNumber;

  /**
   * Use the most significant figure to represent the time left.
   * In case of seconds, default to a 5 min window.
   * @param {number} seconds Amount of time to be formated
   */
  function formatTime(seconds: number): string {
    const { d, h, m } = secondsToDHMS(seconds);

    return d + h + m === 0
      ? "5 mins"
      : d > 0
      ? `${d} days`
      : h > 0
      ? `${h} hours`
      : `${m} minutes`;
  }

  let firstTrade: Trade | undefined;

  $: {
    if ($wallet.connected && $trader.swapTxFee != null) {
      firstTrade = calcNextTrade(
        reserveBalance,
        triggerBalance,
        $wallet.balance,
        $trader.swapTxFee,
        bn(20),
      );
      console.log("FIRST", {
        txFee: firstTrade?.txFee != null ? formatUnits(firstTrade.txFee, 2) : 0,
        protocolFee:
          firstTrade?.protocolFee != null
            ? formatUnits(firstTrade.protocolFee, 2)
            : 0,
        dexFee:
          firstTrade?.dexFee != null ? formatUnits(firstTrade.dexFee, 2) : 0,
      });
    }
  }

  // Simulate a future trade right after the first one is executed.
  // TODO: implement MAX_WITHDRAWAL_VTHO_AMOUNT at wallet.balance line.
  let secondTrade: Trade | undefined;

  $: {
    if ($wallet.connected && $trader.swapTxFee != null) {
      secondTrade = calcNextTrade(
        reserveBalance,
        triggerBalance,
        { ...$wallet.balance, vtho: bn(0) },
        $trader.swapTxFee,
        bn(20),
      );
    }
    console.log("SECOND", {
      txFee: secondTrade?.txFee != null ? formatUnits(secondTrade.txFee, 2) : 0,
      protocolFee:
        secondTrade?.protocolFee != null
          ? formatUnits(secondTrade.protocolFee, 2)
          : 0,
      dexFee:
        secondTrade?.dexFee != null ? formatUnits(secondTrade.dexFee, 2) : 0,
    });
  }
</script>

{#if firstTrade != null && secondTrade != null}
  <table class="w-full text-sm md:text-base">
    <caption class="text-left text-base font-bold">Future Trades</caption>
    <tr>
      <td class="title">Time</td>
      <td class="value">{formatTime(firstTrade.timeLeft)}</td>
      <td class="value"
        >{formatTime(firstTrade.timeLeft + secondTrade.timeLeft)}</td
      >
    </tr>
    <tr>
      <td class="title">Spent</td>
      <td class="value">{formatUnits(firstTrade.withdrawAmount, 2)} VTHO</td>
      <td class="value">{formatUnits(secondTrade.withdrawAmount, 2)} VTHO</td>
    </tr>
    <tr>
      <td class="title">Fees</td>
      <td class="value">{formatUnits(firstTrade.totalFees, 2)} VTHO</td>
      <td class="value">{formatUnits(secondTrade.totalFees, 2)} VTHO</td>
    </tr>
    <tr>
      <td class="title">Received</td>
      <td class="value">{formatUnits(firstTrade.amountOut, 2)} VET</td>
      <td class="value">{formatUnits(secondTrade.amountOut, 2)} VET</td>
    </tr>
  </table>
{/if}

<style lang="postcss">
  .title {
    @apply w-0 whitespace-nowrap;
  }
  .value {
    @apply w-1/2 truncate text-right;
    max-width: 1px;
  }
</style>
