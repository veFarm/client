<script lang="ts">
  import { fly } from "svelte/transition";
  // import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { balance } from "@/stores/balance";
  import type { Sol } from "@/stores/trade-forecast";
  import { tradeForecast } from "@/stores/trade-forecast";
  import { formatUnits } from "@/utils/format-units";
  // import { calcNextTrade } from "@/utils/calc-next-trade.txt";
  // import type { Trade } from "@/utils/calc-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";
  import { chooseSolution } from "@/utils/choose-solution";
  import { secondsToTrigger } from "@/utils/seconds-to-trigger";
  import QuestionMark from "@/assets/QuestionMark.svelte";
  import Spinner from "../spinner/Spinner.svelte";

  export let reserveBalance: BigNumber;

  type Trade = Sol & {
    /** Total fees. */
    totalFees: BigNumber;
    /** Seconds to trigger. */
    timeLeft: number;
  };

  let showMore: boolean = false;

  function toggleFees() {
    showMore = !showMore;
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
      $tradeForecast.fetched &&
      $tradeForecast.solutions.length > 0
    ) {
      const { txFee, solutions } = $tradeForecast;
      // ^ Replace store with http call

      const sol = chooseSolution(
        $balance.current.vtho,
        reserveBalance,
        solutions,
      );

      const timeLeft = secondsToTrigger(
        $balance.current,
        reserveBalance,
        sol.withdrawAmount,
      );

      if (timeLeft != null) {
        firstTrade = {
          ...sol,
          totalFees: txFee.plus(sol.protocolFee).plus(sol.dexFee),
          timeLeft,
        };
      }
    }
  }

  // Simulate a future trade right after the first one is executed.
  // TODO: implement MAX_WITHDRAWAL_VTHO_AMOUNT at wallet.balance line.
  // let secondSol: Sol | undefined;
  let secondTrade: Trade | undefined;

  $: {
    if (
      $balance.current != null &&
      $tradeForecast.fetched &&
      firstTrade != null
    ) {
      const { txFee, solutions } = $tradeForecast;

      // VTHO balance after the first trade occurred.
      const remainingBalanceVTHO = $balance.current.vtho.gte(
        firstTrade.withdrawAmount.plus(reserveBalance),
      )
        ? $balance.current.vtho.minus(firstTrade.withdrawAmount)
        : reserveBalance;

      const sol = chooseSolution(
        remainingBalanceVTHO,
        reserveBalance,
        solutions,
      );

      const timeLeft = secondsToTrigger(
        {
          vet: $balance.current.vet.plus(firstTrade.deltaVET),
          vtho: remainingBalanceVTHO,
        },
        reserveBalance,
        sol.withdrawAmount,
      );

      if (timeLeft != null) {
        secondTrade = {
          ...sol,
          totalFees: txFee.plus(sol.protocolFee).plus(sol.dexFee),
          timeLeft,
        };
      }
      // secondSol = chooseSolution(
      //   withdrawAmounts,
      //   remainingBalanceVTHO,
      //   reserveBalance,
      // );

      // secondTrade = calcNextTrade({
      //   reserveBalance,
      //   withdrawAmount: secondSol,
      //   balance: {
      //     ...balance,
      //     vtho: remainingBalanceVTHO,
      //   },
      //   txFee,
      //   exchangeRate,
      // });
    }
  }
</script>

{#if $tradeForecast.loading}
  <p><Spinner /> Computing an optimized strategy...</p>
{:else if firstTrade != null && $tradeForecast.txFee != null}
  <div>
    <table class="w-full text-sm md:text-base" data-cy="trades-forecast-table">
      <!-- <caption class="text-sm">Upcoming Trades (estimated)</caption> -->
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
        <tr class="cursor-pointer" on:click={toggleFees}>
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
    {#if showMore}
      <table transition:fly={{ duration: 200 }}>
        <tr>
          <td class="title">TX Fee</td>
          <td class="value">{formatUnits($tradeForecast.txFee, 2)} VTHO</td>
          <td class="value"
            >{secondTrade != null ? formatUnits($tradeForecast.txFee, 2) : "0"} VTHO</td
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
  }
  .value {
    @apply w-1/2 truncate text-right;
    max-width: 1px;
  }
</style>
