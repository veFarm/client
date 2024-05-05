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
  import { TradeForecastItem } from "@/components/trade-forecast-item";
  import Spinner from "../spinner/Spinner.svelte";
  import Swap1 from "@/assets/Swap1.svelte";
  import Swap2 from "@/assets/Swap2.svelte";

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
  <p class="text-sm font-normal"><Spinner /> Computing an optimized strategy...</p>
{:else if firstTrade != null && $tradesForecast.txFee != null}
  <TradeForecastItem
    label="next trade"
    timeLeft={formatTime(firstTrade.timeLeft)}
    vthoSpent={formatUnits(firstTrade.withdrawAmount, 2)}
    vetEarned={formatUnits(firstTrade.deltaVET, 2)}
    totalFees={formatUnits(firstTrade.totalFees, 2)}
  >
    <svelte:fragment slot="icon">
      <Swap1 class="inline-block" />
    </svelte:fragment>
  </TradeForecastItem>
  <TradeForecastItem
    label="trade after"
    timeLeft={secondTrade != null
      ? formatTime(firstTrade.timeLeft + secondTrade.timeLeft)
      : "∞ time"}
    vthoSpent={secondTrade != null
      ? formatUnits(secondTrade.withdrawAmount, 2)
      : "0"}
    vetEarned={secondTrade != null ? formatUnits(secondTrade.deltaVET, 2) : "0"}
    totalFees={secondTrade != null
      ? formatUnits(secondTrade.totalFees, 2)
      : "0"}
  >
    <svelte:fragment slot="icon">
      <Swap2 class="inline-block" />
    </svelte:fragment>
  </TradeForecastItem>
{/if}
