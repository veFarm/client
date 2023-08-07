<script lang="ts">
  import type { SwapDoc } from "@/typings/types";
  import { chain } from "@/config";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { formatUnits } from "@/utils/format-units";
  import { SwapTx } from "@/components/swap-tx";

  const { GET_ACCOUNT_SWAPS_ENDPOINT } = getEnvVars();

  /**
   * Array of swap transactions performed by the Trader
   * contract in behalf of the current logged in account.
   */
  let swapTxs: SwapDoc[] = [];
  /** Error message if any. */
  let error: string | undefined;

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

      swapTxs = await response.json();
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    }
  }

  // TODO: refetch account swaps every x mins.
  $: {
    if ($wallet.connected) {
      fetchSwaps();
    }
  }
</script>

<section class="flex flex-col space-y-4">
  <h2>Past Trades</h2>
  {#if error != null && error.length > 0}
    <p class="text-danger">{error}</p>
  {:else if swapTxs == null || swapTxs.length === 0}
    <p>You don&apos;t have any past trades</p>
  {:else}
    {#each swapTxs as tx}
      <SwapTx
        withdrawAmount={formatUnits(tx.withdrawAmount, 18, 3)}
        amountOut={formatUnits(tx.amountOut, 18, 5)}
        txId={tx.txId}
        explorerUrl={chain.explorers[0].url}
      />
    {/each}
  {/if}
</section>
