<script lang="ts">
  import { fly } from "svelte/transition";
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { wallet } from "@/stores/wallet";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { calcNextTrade } from "@/utils/calc-next-trade";
  import type { Trade } from "@/utils/calc-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";
  import QuestionMark from "@/assets/QuestionMark.svelte";

  export let reserveBalance: BigNumber;
  export let triggerBalance: BigNumber;

  const exchangeRate = bn(20);

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
      firstTrade = calcNextTrade({
        reserveBalance,
        triggerBalance,
        balance: $wallet.balance,
        txFee: $trader.swapTxFee,
        exchangeRate,
      });
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
      secondTrade = calcNextTrade({
        reserveBalance,
        triggerBalance,
        balance: { ...$wallet.balance, vtho: bn(0) },
        txFee: $trader.swapTxFee,
        exchangeRate,
      });
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

  let showMore: boolean = false;

  function toggleFees() {
    showMore = !showMore;
  }

  // $:{console.log({showMore})}
</script>

{#if firstTrade != null && secondTrade != null}
  <div>
    <table class="w-full text-sm md:text-base">
      <caption class="text-sm">Upcoming Trades (estimated)</caption>
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
        <td class="title">Received</td>
        <td class="value">{formatUnits(firstTrade.amountOut, 2)} VET</td>
        <td class="value">{formatUnits(secondTrade.amountOut, 2)} VET</td>
      </tr>
      <tr class="cursor-pointer" on:click={toggleFees}>
        <td class="title">
          Fees<QuestionMark
            class="inline-block w-5 h-5 text-inherit scale-75"
          />&nbsp;&nbsp;&nbsp;
        </td>
        <td class="value">{formatUnits(firstTrade.totalFees, 2)} VTHO</td>
        <td class="value">{formatUnits(secondTrade.totalFees, 2)} VTHO</td>
      </tr>
    </table>
    {#if showMore}
      <table transition:fly={{ duration: 200 }}>
        <tr>
          <td class="title">TX Fee</td>
          <td class="value">{formatUnits(firstTrade.txFee, 2)} VTHO</td>
          <td class="value">{formatUnits(secondTrade.txFee, 2)} VTHO</td>
        </tr>
        <tr>
          <td class="title">VeFarm Fee</td>
          <td class="value">{formatUnits(firstTrade.protocolFee, 2)} VTHO</td>
          <td class="value">{formatUnits(secondTrade.protocolFee, 2)} VTHO</td>
        </tr>
        <tr>
          <td class="title">DEX Fee</td>
          <td class="value">{formatUnits(firstTrade.dexFee, 2)} VTHO</td>
          <td class="value">{formatUnits(secondTrade.dexFee, 2)} VTHO</td>
        </tr>
      </table>
    {/if}
  </div>
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
