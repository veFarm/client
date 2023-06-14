<script lang="ts">
  import type { SwapDoc } from "@/typings/types";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { formatUnits } from "@/utils/format-units";
  import { SwapTx } from "@/components/swap-tx";

  const { GET_ACCOUNT_SWAPS_ENDPOINT } = getEnvVars();

  /** Error message if any. */
  let error = "";
  /**
   * Swap transactions performed by the Trader contract
   * in behalf of the current logged in account.
   */
  let swapTxs: SwapDoc[] = [];

  async function getAccountSwaps() {
    try {
      if ($wallet.connexService == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const response = await fetch(
        `${GET_ACCOUNT_SWAPS_ENDPOINT}?account=${$wallet.account}`
      );
      swapTxs = await response.json();
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    }
  }

  $: {
    if ($wallet.connected) {
      getAccountSwaps();
    }
  }
</script>

{#if $wallet.connected}
  <div
    class="flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-background my-8"
  >
    <h2 class="underline">Past Trades</h2>
    {#if error != null && error.length > 0}
      <p class="text-danger">{error}</p>
    {:else if swapTxs == null || swapTxs.length === 0}
      <p>You don&apos;t have any past trades</p>
    {:else}
      {#each swapTxs as tx}
        <SwapTx
          amountIn={formatUnits(tx.amountIn, 18, 3)}
          amountOut={formatUnits(tx.amountOut, 18, 5)}
          txId={tx.txId}
        />
      {/each}
    {/if}
  </div>
{/if}
