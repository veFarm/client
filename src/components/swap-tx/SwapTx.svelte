<script lang="ts">
  export let withdrawAmount: string;
  export let amountOut: string;
  export let txId: string;
  export let explorerUrl: string;
</script>

<div class="bg-accent border border-muted rounded-md px-4 py-3">
  <p class="truncate">
    {withdrawAmount} VTHO ➡ {amountOut} VET
    <br />
    TX:
    <a
      href={`${explorerUrl}/transactions/${txId}`}
      target="_blank"
      rel="noreferrer"
      class="overflow-hidden whitespace-nowrap text-ellipsis"
    >
      {txId}
    </a>
  </p>
</div>
