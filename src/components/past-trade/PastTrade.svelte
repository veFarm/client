<script lang="ts">
  export let withdrawAmount: string;
  export let amountOutReceived: string;
  export let txId: string;
  export let blockTimestamp: number;
  export let explorerUrl: string;
</script>

<a
  href={`${explorerUrl}/transactions/${txId}`}
  target="_blank"
  rel="noreferrer"
  class="block bg-highlight border border-muted rounded-md px-4 py-3 truncate hover:bg-gray-800"
  title={txId}
>
  <span class="text-xs">
    {new Date(blockTimestamp * 1000).toLocaleString()}
  </span>
  <br />
  <span class="text-base text-primary md:text-lg">
    {withdrawAmount} VTHO ➡ {amountOutReceived} VET
  </span>
  <br />
  <span class="text-xs">
    TX: {txId}
  </span>
</a>
