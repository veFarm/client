<script lang="ts">
  import { wallet } from "@/stores/wallet";
  import { Layout } from "@/components/layout";
  import { Divider } from "@/components/divider";
  import { Hero } from "@/components/hero";
  import { Form } from "@/components/form";
  import { SwapsHistory } from "@/components/swaps-history";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { chain } from "@/config";
</script>

<Layout>
  <div class="flex flex-col space-y-8 md:space-y-16">
    <div
      class="
      flex flex-col space-y-8
      md:flex-row md:items-center md:space-y-0 md:space-x-8
    "
    >
      <div class="basis-1/2">
        <Hero />
      </div>
      <div
        class="basis-1/2 border border-accent rounded-lg px-6 py-4 bg-white text-black"
      >
        <Form />
        <p class="text-center mt-4">Chain: {chain.name}</p>
      </div>
    </div>

    {#if $wallet.connected}
      <Divider />
    {/if}

    <SwapsHistory />
  </div>
</Layout>

<!-- {#if !$wallet.connected}
          <p class="mb-4">
            Connect your wallet to calculate the best strategy to swap VTHO for
            VET based on your balance.
          </p>
          <ConnectWalletButton intent="primary" fullWidth />
        {:else}
          <Form />
        {/if} -->
