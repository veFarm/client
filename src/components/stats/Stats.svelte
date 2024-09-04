<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { formatUnits } from "@/utils/format-units";
  import { StatItem } from "@/components/stat-item";

  type RawStats = {
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
   * Fetch user stats for the given account.
   * @param {Address} account Target user account
   * @return {Promise<void>}
   */
  async function fetchStats(account: Address): Promise<void> {
    try {
      const response = await fetch(
        `${chain.getUserStatsEndpoint}?account=${account}`,
      );

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

  // Refetch stats whenever VET balance gets updated
  $: {
    if (
      $balance.current != null &&
      $balance.previous != null &&
      !$balance.current.vet.eq($balance.previous.vet)
    ) {
      let timeout: NodeJS.Timeout | undefined;
      new Promise((res, rej) => {
        timeout = setTimeout(res, 3_000);
      }).then(() => {
        if ($wallet.connected) {
          fetchStats($wallet.account);
        }
        clearTimeout(timeout);
      });
    }
  }
</script>

{#if stats != null}
  <div
    class="space-y-2 lg:flex lg:flex-row lg:justify-center lg:space-x-16 lg:mt-10 ml-2"
    data-cy="stats"
  >
    <StatItem value={stats.swapsCount} label="Swaps" />
    <StatItem
      primary
      value={`${formatUnits(stats.vetTotal, 2)} VET`}
      label="Total Earned"
    />
    <StatItem
      value={`${formatUnits(stats.vthoTotal, 2)} VTHO`}
      label="Total Spent"
    />
  </div>
{/if}
{#if error != null}
  <p class="text-sm text-danger">ERROR: {error}</p>
{/if}
