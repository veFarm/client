<script lang="ts">
  import { fly } from "svelte/transition";
  // import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { balance } from "@/stores/balance";
  import type { Sol } from "@/stores/trades-forecast";
  import { tradesForecast } from "@/stores/trades-forecast";
  import { formatUnits } from "@/utils/format-units";
  // import { calcNextTrade } from "@/utils/calc-next-trade.txt";
  // import type { Trade } from "@/utils/calc-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";
  import { chooseSolution } from "@/utils/choose-solution";
  import { extendSolution } from "@/utils/extend-solution";
  import { secondsToTrigger } from "@/utils/seconds-to-trigger";
  import QuestionMark from "@/assets/QuestionMark.svelte";
  import Spinner from "../spinner/Spinner.svelte";
  import Swap1 from "@/assets/Swap1.svelte";
  import ChevronDown from "@/assets/ChevronDown.svelte";
  import ChevronUp from "@/assets/ChevronUp.svelte";

  export let reserveBalance: BigNumber;

  type Trade = Sol & {
    /** Total fees. */
    totalFees: BigNumber;
    /** Seconds to trigger. */
    timeLeft: number;
  };

  let firstTradeOpen: boolean = true;
  let secondTradeOpen: boolean = false;

  function toggleFirstTrade() {
    firstTradeOpen = !firstTradeOpen;
  }
  function toggleSecondTrade() {
    secondTradeOpen = !secondTradeOpen;
  }

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
    if (
      $balance.current != null &&
      $tradesForecast.fetched &&
      $tradesForecast.solutions.length > 0
    ) {
      const { txFee, reserveIn, reserveOut, solutions } = $tradesForecast;

      const sol = chooseSolution(
        $balance.current.vtho,
        reserveBalance,
        solutions as [Sol, ...Sol[]],
      );

      const extSol = extendSolution(
        sol,
        $balance.current.vtho,
        reserveBalance,
        txFee,
        reserveIn,
        reserveOut,
      );

      const timeLeft = secondsToTrigger(
        $balance.current,
        reserveBalance,
        extSol.withdrawAmount,
      );

      if (timeLeft != null) {
        firstTrade = {
          ...extSol,
          totalFees: txFee.plus(extSol.protocolFee).plus(extSol.dexFee),
          timeLeft,
        };
      }
    }
  }

  // Simulate a future trade right after the first one is executed.
  let secondTrade: Trade | undefined;

  $: {
    if (
      $balance.current != null &&
      $tradesForecast.fetched &&
      firstTrade != null
    ) {
      const { txFee, reserveIn, reserveOut, solutions } = $tradesForecast;

      // VTHO balance after the first trade occurred.
      const remainingBalanceVTHO = $balance.current.vtho.gte(
        firstTrade.withdrawAmount.plus(reserveBalance),
      )
        ? $balance.current.vtho.minus(firstTrade.withdrawAmount)
        : reserveBalance;

      const sol = chooseSolution(
        remainingBalanceVTHO,
        reserveBalance,
        solutions as [Sol, ...Sol[]],
      );

      const extSol = extendSolution(
        sol,
        remainingBalanceVTHO,
        reserveBalance,
        txFee,
        reserveIn,
        reserveOut,
      );

      const timeLeft = secondsToTrigger(
        {
          vet: $balance.current.vet.plus(firstTrade.deltaVET),
          vtho: remainingBalanceVTHO,
        },
        reserveBalance,
        extSol.withdrawAmount,
      );

      if (timeLeft != null) {
        secondTrade = {
          ...extSol,
          totalFees: txFee.plus(extSol.protocolFee).plus(extSol.dexFee),
          timeLeft,
        };
      }
    }
  }
</script>

{#if $tradesForecast.loading}
  <p><Spinner /> Computing an optimized strategy...</p>
{:else if firstTrade != null && $tradesForecast.txFee != null}
  <!-- <div class="flex items-center">
    <Swap1 /><p class="title">Time until the next trade: <span class="value">{formatTime(firstTrade.timeLeft)} Days</span></p><button on:click={toggleFirstTrade}>{#if firstTradeOpen}<ChevronUp />{:else}<ChevronDown />{/if}</button>
  </div> -->
  <!-- {#if firstTradeOpen}
    <div class="flex flex-col space-y-2">
        <p class="title">VTHO to be spent: <span class="value">{formatUnits(firstTrade.withdrawAmount, 2)} VTHO</span></p>
        <p class="title">VET to be earned: <span class="value">{formatUnits(firstTrade.deltaVET, 2)} VET</span></p>
        <p class="title">Transaction fees: <span class="value">{formatUnits(firstTrade.totalFees, 2)} VTHO</span></p>
    </div>
    {/if} -->
  <div class:is-open={firstTradeOpen}>
    <table
      class="w-full text-xs sm:text-sm font-medium"
      data-cy="trades-forecast-table"
    >
      <tbody>
        <tr class="cursor-pointer" on:click={toggleFirstTrade}>
          <td class="title"
            ><Swap1 class="inline-block" /> Time until the next trade:</td
          >
          <td class="value"
            >{formatTime(firstTrade.timeLeft)}
            {#if firstTradeOpen}<ChevronUp
                class="inline-block"
              />{:else}<ChevronDown class="inline-block" />{/if}</td
          >
        </tr>
      </tbody>
    </table>
    {#if firstTradeOpen}
      <div class="border-style">
        <table
          class="w-full text-xs sm:text-sm font-medium"
          data-cy="trades-forecast-table"
        >
          <tbody>
            <tr>
              <td class="title">VTHO to be spent:</td>
              <td class="value"
                >{formatUnits(firstTrade.withdrawAmount, 2)} VTHO</td
              >
            </tr>
            <tr>
              <td class="title">VET to be received:</td>
              <td class="value">{formatUnits(firstTrade.deltaVET, 2)} VET</td>
            </tr>
            <tr class="cursor-pointer" on:click={toggleFirstTrade}>
              <td class="title"> Transaction fees: </td>
              <td class="value">{formatUnits(firstTrade.totalFees, 2)} VTHO</td>
            </tr>
          </tbody>
        </table>
      </div>
    {/if}
  </div>
  <div>
    <table class="w-full text-sm md:text-base" data-cy="trades-forecast-table">
      <thead>
        <tr>
          <th class="title">Next Trades</th>
          <th class="value">First Trade</th>
          <th class="value">Second Trade</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="title">Time</td>
          <td class="value">{formatTime(firstTrade.timeLeft)}</td>
          <td class="value"
            >{secondTrade != null
              ? formatTime(firstTrade.timeLeft + secondTrade.timeLeft)
              : "∞ time"}</td
          >
        </tr>
        <tr>
          <td class="title">Spent</td>
          <td class="value">{formatUnits(firstTrade.withdrawAmount, 2)} VTHO</td
          >
          <td class="value"
            >{secondTrade != null
              ? formatUnits(secondTrade.withdrawAmount, 2)
              : "0"} VTHO</td
          >
        </tr>
        <tr>
          <td class="title">Received</td>
          <td class="value">{formatUnits(firstTrade.deltaVET, 2)} VET</td>
          <td class="value"
            >{secondTrade != null ? formatUnits(secondTrade.deltaVET, 2) : "0"}
            VET</td
          >
        </tr>
        <tr class="cursor-pointer" on:click={toggleFirstTrade}>
          <td class="title">
            Fees<QuestionMark
              class="inline-block w-5 h-5 text-inherit scale-75"
            />&nbsp;&nbsp;&nbsp;
          </td>
          <td class="value">{formatUnits(firstTrade.totalFees, 2)} VTHO</td>
          <td class="value"
            >{secondTrade != null ? formatUnits(secondTrade.totalFees, 2) : "0"}
            VTHO</td
          >
        </tr>
      </tbody>
    </table>
    {#if firstTradeOpen}
      <table transition:fly={{ duration: 200 }}>
        <tr>
          <td class="title">TX Fee</td>
          <td class="value">{formatUnits($tradesForecast.txFee, 2)} VTHO</td>
          <td class="value"
            >{secondTrade != null ? formatUnits($tradesForecast.txFee, 2) : "0"}
            VTHO</td
          >
        </tr>
        <tr>
          <td class="title">vearn Fee</td>
          <td class="value">{formatUnits(firstTrade.protocolFee, 2)} VTHO</td>
          <td class="value"
            >{secondTrade != null
              ? formatUnits(secondTrade.protocolFee, 2)
              : "0"} VTHO</td
          >
        </tr>
        <tr>
          <td class="title">DEX Fee</td>
          <td class="value">{formatUnits(firstTrade.dexFee, 2)} VTHO</td>
          <td class="value"
            >{secondTrade != null ? formatUnits(secondTrade.dexFee, 2) : "0"} VTHO</td
          >
        </tr>
      </table>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .title {
    @apply w-0 whitespace-nowrap;
    @apply text-accent;
  }
  .value {
    @apply w-1/2 truncate text-right;
    max-width: 1px;
    @apply text-body;
  }
  .border-style {
    @apply border-l-2 border-highlight mx-2 pl-2;
  }
  .is-open {
    @apply bg-black -mx-2 p-2;
  }
  tr > td {
    @apply pb-2;
  }
</style>
