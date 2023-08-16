<script lang="ts">
  import {wallet} from "@/stores/wallet"
  import {secsTillNextTrade} from "@/utils/secs-till-next-trade"
  import {secondsToDHMS} from "@/utils/seconds-to-dhms"

  /** Decimals. */
export let triggerBalance: string;

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
</script>

  <p class="text-accent">
    <span>Next Trade</span>
    {#if nextTrade != null}
      <span class="float-right">{nextTrade}</span>
    {/if}
    <br />
    Fees
    <br />
    Minimum Received
  </p>
