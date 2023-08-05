<script lang="ts">
  import { wallet } from "@/stores/wallet";
  import { Layout } from "@/components/layout";
  import { Divider } from "@/components/divider";
  import { Hero } from "@/components/hero";
  import { ConfigForm } from "@/components/config-form";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { AllowanceButton } from "@/components/allowance-button";
  import { SwapsHistory } from "@/components/swaps-history";
  import { chain } from "@/config";
</script>

<Layout>
  <div class="flex flex-col space-y-8 md:space-y-16">
    <div
      class="
      flex flex-col items-center space-y-8
      md:flex-row md:space-y-0 md:space-x-8
    "
    >
      <section class="basis-1/2 self-start">
        <Hero />
      </section>
      <section
        class="basis-1/2 border border-accent rounded-lg px-6 py-4 bg-white text-black space-y-4"
      >
        <!-- TODO: AllowanceButton should be disabled as long as targets are not set in contract -->
        <ConfigForm />
        {#if !$wallet.connected}
          <ConnectWalletButton intent="primary" fullWidth />
        {:else}
          <AllowanceButton />
        {/if}
        <p class="text-center">Chain: {chain.name}</p>
      </section>
    </div>

    {#if $wallet.connected}
      <Divider />
      <SwapsHistory />
    {/if}
  </div>
</Layout>
