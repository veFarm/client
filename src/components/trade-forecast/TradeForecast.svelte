<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { wallet } from "@/stores/wallet";
  import { trader } from "@/stores/trader";
  import { secsTillNextTrade } from "@/utils/secs-till-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";
  import { parseUnits } from "@/utils/parse-units";
  import { formatUnits } from "@/utils/format-units";

  /** Decimals. */
  export let triggerBalance: string;
  /** Decimals. */
  export let reserveBalance: string;

  let nextTrade: string | undefined;

  $: {
    if ($wallet.connected) {
      const nextTradeSecs = secsTillNextTrade(triggerBalance, $wallet.balance);

      if (nextTradeSecs != null) {
        const { d, m, h, s } = secondsToDHMS(nextTradeSecs);

        // Get the most significant number.
        nextTrade =
          d > 0
            ? `${d} days`
            : h > 0
            ? `${h} hours`
            : m > 0
            ? `${m} minutes`
            : `${s} seconds`;
      } else {
        nextTrade = undefined;
      }
    }
  }

  // Wei
  let txFee: string | undefined;

  $: txFee = $trader.swapTxFee;

  let inputsEmpty: boolean = true;

  $: inputsEmpty =
    triggerBalance.trim() === "" ||
    reserveBalance.trim() === "" ||
    parseInt(triggerBalance, 10) === 0 ||
    parseInt(reserveBalance, 10) === 0; // case when input equals "0000"

  // VTHO withdrew amount.
  let withdrewAmount: BigNumber | undefined;

  $: {
    if ($wallet.connected) {
      // Always spend max possible amount.
      // TODO: fetch MAX_VTHO_WITHDRAWAL_AMOUNT from Trader contract.
      withdrewAmount = bn(parseUnits($wallet.balance.vtho)).gt(bn(parseUnits(triggerBalance)))
        ? bn(parseUnits($wallet.balance.vtho)).minus(bn(parseUnits(reserveBalance)))
        : bn(parseUnits(triggerBalance)).minus(bn(parseUnits(reserveBalance)))
    }
  }
  // Wei
  let protocolFee: string | undefined;

  $: {
    if (txFee != null && !inputsEmpty && withdrewAmount != null) {
      protocolFee = withdrewAmount
        .minus(bn(txFee))
        .times(bn(3))
        .div(bn(1000))
        .toFixed();
    }
  }

  // Wei
  let dexFee: string | undefined;

  $: {
    if (txFee != null && !inputsEmpty && protocolFee != null && withdrewAmount != null) {
      dexFee = withdrewAmount
        .minus(bn(txFee))
        .minus(bn(protocolFee))
        .times(bn(3))
        .div(bn(1000))
        .toFixed();
    }
  }

  // Wei
  let totalFees: string | undefined;

  $: {
    if (
      txFee != null &&
      !inputsEmpty &&
      protocolFee != null &&
      dexFee != null
    ) {
      totalFees = bn(txFee).plus(bn(protocolFee)).plus(bn(dexFee)).toFixed();
    }
  }

  // Wei
  let amountOut: string | undefined;

  // TODO: fetch exchage rate
  $: {
    if (txFee != null && !inputsEmpty && totalFees != null && withdrewAmount != null) {
      amountOut = withdrewAmount.gt(0)
      ? withdrewAmount
        .minus(bn(totalFees))
        .div(bn(20))
        .toFixed()
      : "0";
    }
  }

  $: {
    console.log({
      txFee,
      protocolFee,
      dexFee,
      amountOut,
      totalFees,
      nextTrade,
      balance: $wallet.balance,
    });
  }
</script>

{#if nextTrade != null && totalFees != null && amountOut != null && withdrewAmount != null}
  <p>
    <span>Next Trade</span>
    <span class="float-right">&plusmn;{nextTrade}</span>
    <br />
    <span>Total Spent</span>
    <span class="float-right">{formatUnits(withdrewAmount.toFixed(), 2)} VTHO</span>
    <br />
    <span>Fees</span>
    <span class="float-right">{formatUnits(totalFees, 2)} VTHO</span>
    <br />
    <span>Minimum Received</span>
    <span class="float-right">{formatUnits(amountOut, 2)} VET</span>
  </p>
{/if}
