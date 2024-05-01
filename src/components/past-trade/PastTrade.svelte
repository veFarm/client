<script lang="ts">

  export let withdrawAmount: string;
  export let amountOutReceived: string;
  export let txId: string;
  export let blockTimestamp: number;
  export let explorerUrl: string;
</script>

<!--   <span class="text-xs">
    Date:
  </span>
  <br />
  <span class="text-base text-primary md:text-lg">
    Amount:
  </span>
  <br />
  <span class="text-xs">
    TxID: {txId}
  </span>
</a> -->

<table class="w-full text-xs sm:text-sm font-medium">
  <tbody>
    <tr>
      <td class="title">Date:</td>
      <td class="value">{new Date(blockTimestamp * 1000).toLocaleString().replace(",", " ")}</td>
    </tr>
    <tr>
      <td class="title">Amount:</td>
      <td class="value">{withdrawAmount} VTHO - <span class="text-primary">{amountOutReceived} VET</span></td>
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

        {txId}
      </a>
      </td>
    </tr>
  </tbody>
</table>

<style lang="postcss">
  .title {
    @apply w-0 whitespace-nowrap text-xs font-normal text-accent;
  }
  .value {
    @apply truncate text-sm font-normal text-body;
    /* max-width: 1px; */
  }
  tr > td {
    @apply px-4 py-1 truncate;
  }
</style>
