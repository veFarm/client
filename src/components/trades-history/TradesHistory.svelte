<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { getEnvVars } from "@/config/get-env-vars";
  import { wallet } from "@/stores/wallet";
  import { formatUnits } from "@/utils/format-units";
  import { timeSince } from "@/utils/time-since";
  import { PastTrade } from "@/components/past-trade";

  const { GET_ACCOUNT_SWAPS_ENDPOINT } = getEnvVars();

  // TODO: rename it to PastTrades

  type RawSwapDoc = {
    account: Address;
    withdrawAmount: string;
    amountOut: string;
    txId: string;
    blockTimestamp: number;
  };

  type SwapDoc = {
    account: Address;
    withdrawAmount: BigNumber;
    amountOut: BigNumber;
    txId: string;
    blockTimestamp: number;
  };

  /**
   * Array of swap transactions performed by the Trader
   * contract in behalf of the current logged in account.
   */
  let swapTxs: SwapDoc[] = [];
  /** Error message if any. */
  let error: string | undefined;
  /** Fetch time. */
  let fetchAt: number = Date.now();

  /**
   * Fetch account swap transactions.
   */
  async function fetchSwaps() {
    try {
      if ($wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const response = await fetch(
        `${GET_ACCOUNT_SWAPS_ENDPOINT}?account=${$wallet.account}`,
      );

      const json = (await response.json()) as RawSwapDoc[];

      swapTxs = json.map((tx) => ({
        account: tx.account,
        withdrawAmount: bn(tx.withdrawAmount),
        amountOut: bn(tx.amountOut),
        txId: tx.txId,
        blockTimestamp: tx.blockTimestamp,
      }));
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    }

    fetchAt = Date.now();
  }

  let interval1: NodeJS.Timer | undefined;

  // Fetch swaps every 5 mins.
  $: {
    if ($wallet.connected) {
      fetchSwaps();
      clearInterval(interval1);
      interval1 = setInterval(fetchSwaps, 5 * 60 * 1_000);
    }
  }

  let interval2: NodeJS.Timer | undefined;
  let updatedAt: string | undefined;

  // Display last updated at.
  $: {
    clearInterval(interval2);
    interval2 = setInterval(() => {
      updatedAt = timeSince(fetchAt);
    }, 60 * 1_000);
  }
</script>

<section class="flex flex-col space-y-4">
  <h2>
    Your Trades
    <br />
    <span class="block text-sm text-gray-400 font-normal">
      {updatedAt != null ? `Last updated: ${updatedAt} ago` : ""}
    </span>
  </h2>

  {#if error != null && error.length > 0}
    <p class="text-danger">{error}</p>
  {:else if swapTxs == null || swapTxs.length === 0}
    <p>You don&apos;t have any past trades</p>
  {:else}
    {#each swapTxs as tx}
      <PastTrade
        withdrawAmount={formatUnits(tx.withdrawAmount, 3)}
        amountOut={formatUnits(tx.amountOut, 5)}
        txId={tx.txId}
        blockTimestamp={tx.blockTimestamp}
        explorerUrl={chain.explorers[0].url}
      />
    {/each}
  {/if}
</section>
