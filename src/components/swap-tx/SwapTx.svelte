<script lang="ts">
  import bn from "bignumber.js";
  import type { SwapDoc } from "@/typings/types";
  import { chain } from "@/config";

  export let tx: SwapDoc;
</script>

<div>
  <p class="overflow-hidden whitespace-nowrap text-ellipsis">
    {bn(tx.amountIn).div(bn(10).pow(18)).decimalPlaces(3)} VTHO ➡ {bn(
      tx.amountOut
    )
      .div(bn(10).pow(18))
      .decimalPlaces(5)} VET
    <br />
    TX:
    <a
      href={`${chain.explorers[0].url}/transactions/${tx.txId}`}
      target="_blank"
      rel="noreferrer"
    >
      {tx.txId}
    </a>
  </p>
</div>
