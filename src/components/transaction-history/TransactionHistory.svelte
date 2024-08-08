<script lang="ts">
  import { slide } from "svelte/transition";
  import bn from "bignumber.js";
  import type { BigNumber } from "bignumber.js";
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { formatUnits } from "@/utils/format-units";
  import { shortenAddress } from "@/utils/shorten-address";
  import { PastTrade } from "@/components/past-trade";
  import { Spinner } from "@/components/spinner";
  import { Divider } from "@/components/divider";
  import NewTab from "@/assets/NewTab.svelte";

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
   * Fetch user swap transactions.
   */
  async function fetchSwaps(
    account: Address,
    vetBalance: BigNumber,
  ): Promise<void> {
    try {
      loading = true;

      const response = await fetch(
        `${
          chain.getUserSwapsEndpoint
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

{#if error != null && error.length > 0}
  <p class="text-danger">{error}</p>
{:else if loading}
  <p>Fetching transactions... <Spinner /></p>
{:else if swapTxs == null || swapTxs.length === 0}
  <p>Nothing here yet!</p>
{/if}

<!-- Mobile -->
<div class="block lg:hidden px-2 space-y-3">
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

<!-- Desktop -->
{#if swapTxs.length > 0}
  <div class="hidden lg:block space-y-3 border border-muted rounded">
    <table width="100%" class="table-fixed">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Spent</th>
          <th scope="col">Earned</th>
          <th scope="col">TxID</th>
        </tr>
      </thead>
      <tbody>
        {#each swapTxs as tx (tx.txId)}
          <tr in:slide>
            <td width="25%"
              >{new Date(tx.blockTimestamp * 1000)
                .toLocaleString()
                .replace(",", " ")}</td
            >
            <td width="25%">{formatUnits(tx.withdrawAmount, 3)} VTHO</td>
            <td width="25%" class="primary"
              >{formatUnits(tx.amountOutReceived, 5)} VET</td
            >
            <td width="25%">
              <a
                href={`${chain.explorers[0].url}/transactions/${tx.txId}`}
                target="_blank"
                rel="noreferrer"
                title={tx.txId}
              >
                <div class="flex items-center">
                  <span class="truncate">{tx.txId}</span>
                  <NewTab class="h-4 shrink-0" />
                </div>
              </a></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

{#if $wallet.account != null && swapTxs.length > 0}
  <p class="text-sm text-disabled mt-3">
    Only the last 5 transactions are shown. Click
    <a
      href={chain.chainId === 100009 /* mainnet */
        ? `${chain.explorers[0].url}/account/${$wallet.account}/#transactions-internal`
        : `${chain.explorers[0].url}/accounts/${$wallet.account}/transfer`}
      target="_blank"
      rel="noreferrer"
      class="underline"
    >
      here
    </a>
    to view all transactions.
  </p>
{/if}

<style lang="postcss">
  thead {
    @apply bg-highlight border-b border-muted text-center;
  }
  th,
  td {
    @apply text-center px-2 py-1.5 lg:px-4 lg:py-3;
  }
  th {
    @apply text-sm font-normal;
  }
  tr {
    @apply text-sm border-b border-muted last:border-b-0;
  }
  .primary {
    @apply text-primary;
  }
</style>
