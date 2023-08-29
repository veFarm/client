<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { wallet } from "@/stores/wallet";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { calcNextTrade } from "@/utils/calc-next-trade";
  import type { Trade } from "@/utils/calc-next-trade";

  export let reserveBalance: BigNumber;
  export let triggerBalance: BigNumber;

  let nextTrade: Trade | undefined;

  $: {
    if ($wallet.connected && $trader.swapTxFee) {
      nextTrade = calcNextTrade(
        reserveBalance,
        triggerBalance,
        $wallet.balance,
        $trader.swapTxFee,
        bn(20),
      );
    }
  }
</script>

{#if nextTrade != null}
  <p>
    <span>Next Trade</span>
    <span class="float-right">&plusmn;{nextTrade.timeLeft}</span>
    <br />
    <span>Total Spent</span>
    <span class="float-right"
      >{formatUnits(nextTrade.withdrawAmount, 2)} VTHO</span
    >
    <br />
    <span>Fees</span>
    <span class="float-right">{formatUnits(nextTrade.totalFees, 2)} VTHO</span>
    <br />
    <span>Minimum Received</span>
    <span class="float-right">{formatUnits(nextTrade.amountOut, 2)} VET</span>
  </p>
{/if}
