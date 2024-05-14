<script lang="ts">
  import { shortenAddress } from "@/utils/shorten-address";
  import ChevronRight from "@/assets/ChevronRight.svelte";
  import NewTab from "@/assets/NewTab.svelte";

  export let withdrawAmount: string;
  export let amountOutReceived: string;
  export let txId: string;
  export let blockTimestamp: number;
  export let explorerUrl: string;
</script>

<table class="w-full text-sm font-medium">
  <tbody>
    <tr>
      <td class="title">Date:</td>
      <td class="value"
        >{new Date(blockTimestamp * 1000)
          .toLocaleString()
          .replace(",", " ")}</td
      >
    </tr>
    <tr>
      <td class="title">Amount:</td>
      <td class="value">
        {withdrawAmount} VTHO <ChevronRight class="inline mb-0.5" />
        <span class="text-primary">{amountOutReceived} VET</span>
      </td>
    </tr>
    <tr>
      <td class="title">TxID:</td>
      <td class="value">
        <a
          href={`${explorerUrl}/transactions/${txId}`}
          target="_blank"
          rel="noreferrer"
          title={txId}
        >
          {shortenAddress(txId)}
          <NewTab class="h-4 inline" />
        </a>
      </td>
    </tr>
  </tbody>
</table>

<style lang="postcss">
  .title {
    @apply w-0 whitespace-nowrap text-sm;
  }
  .value {
    @apply truncate text-sm;
    max-width: 1px; /* Required for truncate to work :S */
  }
  tr > td {
    @apply pr-4 py-1 truncate;
  }
</style>
