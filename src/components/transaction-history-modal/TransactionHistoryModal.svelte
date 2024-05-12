<script lang="ts">
  import { slide } from "svelte/transition";
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { historyModal } from "@/stores/history-modal";
  import { formatUnits } from "@/utils/format-units";
  import { Modal } from "@/components/modal";
  import { PastTrade } from "@/components/past-trade";
  import { Spinner } from "@/components/spinner";
  import { Divider } from "@/components/divider";

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
  async function fetchSwaps(
    account: Address,
    vetBalance: BigNumber,
  ): Promise<void> {
    try {
      loading = true;

      const response = await fetch(
        `${
          chain.getAccountSwapsEndpoint
        }?account=${account}&vet=${vetBalance.toFixed()}`,
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

  function handleClose() {
    historyModal.close();
  }

  // Fetch swaps once after the wallet has been connected
  $: {
    if ($wallet.connected) {
      fetchSwaps($wallet.account, bn(0));
    }
  }

  // Refetch swaps whenever VET balance gets updated
  $: {
    if (
      $wallet.connected &&
      balance.didUpdate($balance.current, $balance.previous)
    ) {
      let timeout: NodeJS.Timeout | undefined;
      new Promise((resolve, reject) => {
        timeout = setTimeout(resolve, 5_000);
      }).then(() => {
        fetchSwaps($wallet.account!, $balance.current!.vet);
        clearTimeout(timeout);
      });
    }
  }
</script>

<Modal
  isOpen={$historyModal.isOpen}
  on:close={handleClose}
  data-cy="history-modal"
>
  <svelte:fragment slot="header">Transaction History</svelte:fragment>
  <svelte:fragment slot="body">
    <div class="space-y-3">
      {#if error != null && error.length > 0}
        <p class="text-danger">{error}</p>
      {:else if loading}
        <p>Fetching transactions... <Spinner /></p>
      {:else if swapTxs == null || swapTxs.length === 0}
        <p class="text-body">Nothing here yet!</p>
      {/if}
      {#each swapTxs as tx, index (tx.txId)}
        <div in:slide>
          <PastTrade
            withdrawAmount={formatUnits(tx.withdrawAmount, 3)}
            amountOutReceived={formatUnits(tx.amountOutReceived, 5)}
            txId={tx.txId}
            blockTimestamp={tx.blockTimestamp}
            explorerUrl={chain.explorers[0].url}
          />
        </div>
        {#if index < swapTxs.length - 1}
          <Divider />
        {/if}
      {/each}
    </div>
  </svelte:fragment>
</Modal>
