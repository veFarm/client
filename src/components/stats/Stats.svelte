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

{#if !error}
  <StatItem value={stats.swapsCount} label="Trades" />
  <StatItem value={formatUnits(stats.vetTotal, 18, 2)} label="VET volume" />
  <StatItem value={stats.accountsCount} label="Accounts" />
{/if}
