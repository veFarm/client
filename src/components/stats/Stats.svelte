<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { tradeForecast } from "@/stores/trade-forecast";
  import { formatUnits } from "@/utils/format-units";
  import { StatItem } from "@/components/stat-item";

  type RawStats = {
    /** Target account. */
    account: string;
    /** Number of swap operations performed by the target account. */
    swapsCount: number;
    /** Total VET amount transacted by the target account. */
    vetTotal: string;
    /** Total VTHO amount transacted by the target account. */
    vthoTotal: string;
  };

  type Stats = {
    swapsCount: number;
    vetTotal: BigNumber;
    vthoTotal: BigNumber;
  };

  /** Account stats. */
  let stats: Stats | undefined;
  /** Error message if any. */
  let error: string | undefined;

  /**
   * Fetch account stats for the given account.
   * @param {Address} account Target account
   * @return {Promise<void>}
   */
  async function fetchStats(account: Address): Promise<void> {
    try {
      const response = await fetch(
        `${chain.getAccountStatsEndpoint}?account=${account}`,
      );

      if (response.status === 404) return;

      const json = (await response.json()) as RawStats;

      stats = {
        swapsCount: json.swapsCount,
        vetTotal: bn(json.vetTotal),
        vthoTotal: bn(json.vthoTotal),
      };
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    }
  }

  $: {
    if ($wallet.connected) {
      fetchStats($wallet.account);
    }
  }
</script>

{#if stats != null && $tradeForecast.fetched}
  <StatItem value={stats.swapsCount} label="Trades" />
  <StatItem value={formatUnits(stats.vetTotal, 2)} label="VET volume" />
  <StatItem
    value={formatUnits(
      $tradeForecast.solutions[$tradeForecast.solutions.length - 1]
        .totalProfitVET,
      2,
    )}
    label="VET early profit"
  />
{/if}
{#if error != null}
  <p class="text-danger">ERROR: {error}</p>
{/if}
