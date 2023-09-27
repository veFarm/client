<script lang="ts">
  import { onMount } from "svelte";
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { formatUnits } from "@/utils/format-units";
  import { StatItem } from "@/components/stat-item";

  type RawStats = {
    /** Number of registered accounts */
    accountsCount: number;
    /** Number of swap operations performed by the protocol */
    swapsCount: number;
    /** Total VET amount transacted by the protocol */
    vetTotal: string;
    /** Total VTHO amount transacted by the protocol */
    vthoTotal: string;
  };

  type Stats = {
    accountsCount: number;
    swapsCount: number;
    vetTotal: BigNumber;
    vthoTotal: BigNumber;
  };

  /**
   * Array of swap transactions performed by the Trader
   * contract in behalf of the current logged in account.
   */
  let stats: Stats = {
    accountsCount: 0,
    swapsCount: 0,
    vetTotal: bn(0),
    vthoTotal: bn(0),
  };
  /** Error message if any. */
  let error: string | undefined;

  /**
   * Fetch protocol stats.
   */
  async function fetchStats() {
    try {
      const response = await fetch(chain.getStatsEndpoint);
      const json = (await response.json()) as RawStats;
      stats = {
        accountsCount: json.accountsCount,
        swapsCount: json.swapsCount,
        vetTotal: bn(json.vetTotal),
        vthoTotal: bn(json.vthoTotal),
      };
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    }
  }

  onMount(fetchStats);
</script>

{#if !error}
  <StatItem value={stats.swapsCount} label="Trades" />
  <StatItem value={formatUnits(stats.vetTotal, 2)} label="VET volume" />
  <StatItem value={stats.accountsCount} label="Accounts" />
{/if}
