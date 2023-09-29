<script lang="ts">
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
</script>

{#if $wallet.connected && $wallet.balance.vet.eq(0) && $wallet.triggerBalance != null && $wallet.triggerBalance.lt($wallet.balance.vtho)}
  <div
    class="bg-blue-50 text-blue-800 rounded-lg border-blue-300 divide-blue-300 p-4 gap-3 text-sm md:text-base"
  >
    Ops! It looks like you don&apos;t have enough funds to perform a swap.
    {#if chain.chainId === 100010}
      Feel free to grab some tokens from the <a
        href={chain.faucets[0]}
        target="_blank"
        class="underline">faucet</a
      >.
    {/if}
  </div>
{/if}
