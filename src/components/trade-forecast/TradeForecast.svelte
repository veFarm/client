<script lang="ts">
  import bn from "bignumber.js";
  import { wallet } from "@/stores/wallet";
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

  let fees: string | undefined;

  $: fees = formatUnits(
    bn(parseUnits(triggerBalance))
      .minus(bn(parseUnits(reserveBalance)))
      .times(bn(6))
      .div(bn(1000))
      .toString(),
    2,
  );

  let amountOut: string | undefined;

  // TODO: fetch exchage rate
  $: amountOut = formatUnits(
    bn(parseUnits(triggerBalance))
      .minus(bn(parseUnits(reserveBalance)))
      .minus(bn(parseUnits(fees || "0")))
      .div(bn(20))
      .toString(),
    2,
  );
  // $: amountOut = formatUnits(bn(parseUnits(triggerBalance)).minus(bn(parseUnits(reserveBalance))).div(bn(20)).toString(), 2)
</script>

<p>
  <span>Next Trade</span>
  {#if nextTrade != null}
    <span class="float-right">{nextTrade}</span>
  {/if}
  <br />
  <span>Fees</span>
  {#if fees != null}
    <span class="float-right">{fees} VTHO</span>
  {/if}
  <br />
  <span>Minimum Received</span>
  {#if fees != null}
    <span class="float-right">{amountOut} VET</span>
  {/if}
</p>
