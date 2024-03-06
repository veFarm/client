<script lang="ts">
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { formatUnits } from "@/utils/format-units";
  import { PastTrade } from "@/components/past-trade";
  import { Spinner } from "@/components/spinner";

  type RawSwapDoc = {
    account: Address;
    withdrawAmount: string;
    amountOutReceived: string;
    txId: string;
    blockTimestamp: number;
  };

  type SwapDoc = {
    account: Address;
    withdrawAmount: BigNumber;
    amountOutReceived: BigNumber;
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
  /** Loading state. */
  let loading: boolean = false;

  /**
   * Fetch account swap transactions.
   */
  async function fetchSwaps(account: Address): Promise<void> {
    try {
      loading = true;

      const response = await fetch(
        `${chain.getAccountSwapsEndpoint}?account=${account}`,
        {
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );

      if (response.status === 404) return;

      const json = (await response.json()) as RawSwapDoc[];

      swapTxs = json.map((tx) => ({
        account: tx.account,
        withdrawAmount: bn(tx.withdrawAmount),
        amountOutReceived: bn(tx.amountOutReceived),
        txId: tx.txId,
        blockTimestamp: tx.blockTimestamp,
      }));
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      loading = false;
    }
  }

  $: {
    if ($wallet.connected) {
      fetchSwaps($wallet.account);
    }
  }

  // Refetch swaps whenever VET balance gets updated
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
          fetchSwaps($wallet.account);
        }
        clearTimeout(timeout);
      });
    }
  }
</script>

<section class="flex flex-col space-y-4" data-cy="trades-history">
  <h2>Your Trades</h2>

  {#if error != null && error.length > 0}
    <p class="text-danger">{error}</p>
  {:else if loading}
    <p><Spinner /> Fetching transactions...</p>
  {:else if swapTxs == null || swapTxs.length === 0}
    <p>You don&apos;t have any past trades</p>
  {:else}
    {#each swapTxs as tx}
      <PastTrade
        withdrawAmount={formatUnits(tx.withdrawAmount, 3)}
        amountOutReceived={formatUnits(tx.amountOutReceived, 5)}
        txId={tx.txId}
        blockTimestamp={tx.blockTimestamp}
        explorerUrl={chain.explorers[0].url}
      />
    {/each}
  {/if}
</section>
