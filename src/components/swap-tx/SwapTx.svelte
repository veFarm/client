<script lang="ts">
  import { chain } from "@/config";

  export let amountIn: string;
  export let amountOut: string;
  export let txId: string;
</script>

<div>
  <p class="overflow-hidden whitespace-nowrap text-ellipsis">
    {amountIn} VTHO ➡ {amountOut} VET
    <br />
    TX:
    <a
      href={`${chain.explorers[0].url}/transactions/${txId}`}
      target="_blank"
      rel="noreferrer"
    >
      {txId}
    </a>
  </p>
</div>
