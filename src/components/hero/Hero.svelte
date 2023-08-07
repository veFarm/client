<script lang="ts">
  import { onMount } from "svelte";
  import type { Stats } from "@/typings/types";
  import { StatItem } from "@/components/stat-item";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { formatUnits } from "@/utils/format-units";

  const { GET_STATS_ENDPOINT } = getEnvVars();

  /**
   * Array of swap transactions performed by the Trader
   * contract in behalf of the current logged in account.
   */
  let stats: Stats = {
    accountsCount: 0,
    swapsCount: 0,
    vthoTotal: "0",
    vetTotal: "0",
  };
  /** Error message if any. */
  let error: string | undefined;

  /**
   * Fetch protocol stats.
   */
  async function fetchStats() {
    try {
      const response = await fetch(GET_STATS_ENDPOINT);
      stats = await response.json();
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    }
  }

  onMount(fetchStats);
</script>

<h1>Swap VTHO for VET automatically.</h1>
<p class="text-gray-300 mt-4">
  Select your swap configuration and allow the VeFarm contract to spend your
  VTHO. After which the contract will periodically withdraw VTHO from your
  account, perform a swap for VET tokens through a DEX, and return the resulting
  tokens back to your wallet.
</p>
<!-- <p class="text-gray-400">
  VTHO is a token on VeChain, which is generated automatically when you
  hold VET. Therefore, one way to increase your VET balance is by
  exchanging earned VTHO tokens for VET on a regular basis. By doing so,
  you will generate more VTHO which can then be traded for even more VET,
  and the cycle continues.
</p> -->
<div class="hidden md:grid md:grid-cols-3 md:row-gap-8 md:mt-10 md:mx-auto">
  <StatItem value={stats.swapsCount} label="Trades" />
  <StatItem value={formatUnits(stats.vetTotal, 18, 2)} label="VET volume" />
  <StatItem value={stats.accountsCount} label="Accounts" />
</div>
