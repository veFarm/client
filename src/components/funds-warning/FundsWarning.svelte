<script lang="ts">
  import { chain } from "@/config/index";
  import { balance } from "@/stores/balance";
</script>

{#if $balance.current != null && $balance.current.vet.eq(0) && $balance.current.vtho.eq(0)}
  <div
    class="bg-blue-50 text-blue-800 rounded-lg border-blue-300 divide-blue-300 p-4 gap-3 text-sm md:text-base"
    data-cy="lack-of-funds-alert"
  >
    Ops! It looks like you don&apos;t have enough funds to perform a swap.
    {#if chain.chainId === 100010}
      Feel free to grab some tokens from the <a
        href={chain.faucets[0]}
        target="_blank"
        class="underline"
        data-cy="faucet-link">faucet</a
      >.
    {/if}
  </div>
{/if}
