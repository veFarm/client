<script lang="ts">
  import { fly } from "svelte/transition";
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config";
  import { wallet } from "@/stores/wallet";
  // import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { calcNextTrade } from "@/utils/calc-next-trade";
  import type { Trade } from "@/utils/calc-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";
  import { chooseWithdrawAmount } from "@/utils/choose-withdraw-amount";
  import QuestionMark from "@/assets/QuestionMark.svelte";

  export let reserveBalance: BigNumber;

  let withdrawAmounts: BigNumber[] | undefined;
  let exchangeRate: BigNumber | undefined;
  let txFee: BigNumber | undefined;

  let firstWithdrawAmount: BigNumber = bn(0);
  let secondWithdrawAmount: BigNumber = bn(0);

  let showMore: boolean = false;

  function toggleFees() {
    showMore = !showMore;
  }

  $: {
    if ($wallet.connected) {
      fetch(
        `${chain.getAccountTriggerBalanceEndpoint}?account=${$wallet.account}`,
      ).then((response) => {
        response.json().then((json) => {
          // { withdrawAmount: string, exchangeRate: string, txFee: string }
          withdrawAmounts = (json.withdrawAmounts as string[]).map((v) =>
            bn(v),
          );
          exchangeRate = bn(json.exchangeRate);
          txFee = bn(json.txFee);
        });
      });
    }
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
      $wallet.connected &&
      txFee != null &&
      withdrawAmounts != null &&
      exchangeRate != null
    ) {
      firstWithdrawAmount = chooseWithdrawAmount(
        withdrawAmounts,
        $wallet.balance.vtho,
        reserveBalance,
      );

      firstTrade = calcNextTrade({
        reserveBalance,
        withdrawAmount: firstWithdrawAmount,
        balance: $wallet.balance,
        txFee,
        exchangeRate,
      });
    }
  }

  // Simulate a future trade right after the first one is executed.
  // TODO: implement MAX_WITHDRAWAL_VTHO_AMOUNT at wallet.balance line.
  let secondTrade: Trade | undefined;

  $: {
    if (
      $wallet.connected &&
      txFee != null &&
      withdrawAmounts != null &&
      exchangeRate != null
    ) {
      const vthoRemainingBalance = $wallet.balance.vtho.gte(
        firstWithdrawAmount.plus(reserveBalance),
      )
        ? $wallet.balance.vtho.minus(firstWithdrawAmount)
        : reserveBalance;

      secondWithdrawAmount = chooseWithdrawAmount(
        withdrawAmounts,
        vthoRemainingBalance,
        reserveBalance,
      );

      secondTrade = calcNextTrade({
        reserveBalance,
        withdrawAmount: secondWithdrawAmount,
        balance: {
          ...$wallet.balance,
          vtho: vthoRemainingBalance,
        }, // TODO: check this
        txFee,
        exchangeRate,
      });
    }
  }
</script>

{#if firstTrade != null}
  <div>
    <table class="w-full text-sm md:text-base">
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
          <td class="value">{formatUnits(firstTrade.amountOut, 2)} VET</td>
          <td class="value"
            >{secondTrade != null ? formatUnits(secondTrade.amountOut, 2) : "0"}
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
          <td class="value">{formatUnits(firstTrade.txFee, 2)} VTHO</td>
          <td class="value"
            >{secondTrade != null ? formatUnits(secondTrade.txFee, 2) : "0"} VTHO</td
          >
        </tr>
        <tr>
          <td class="title">VeFarm Fee</td>
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
