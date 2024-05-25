<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { Layout } from "@/components/layout";
  import { Hero } from "@/components/hero";
  import { ConfigForm } from "@/components/config-form";
  // import { LearnMore } from "@/components/learn-more";
  import { TransactionHistory } from "@/components/transaction-history";
  import { FAQs } from "@/components/faqs";

  type View = "LOGIN" | "CONFIG_AND_APPROVE" | "SUMMARY" | "UPDATE_CONFIG"; // TODO: add LOADING

  let view: View = "LOGIN";
  let show: boolean = false; // animation

  $: {
    if (!$wallet.connected) {
      view = "LOGIN";
    } else if (!$trader.swapConfigSet || !$vtho.allowed) {
      view = "CONFIG_AND_APPROVE";
    } else if ($trader.swapConfigSet && $vtho.allowed) {
      view = "SUMMARY";
    }
  }

  // Update account balance with every new tick.
  $: {
    if ($wallet.connected) {
      const { wConnex } = $wallet;

      const ticker = wConnex.getTicker();

      void (async () => {
        for (;;) {
          await ticker.next();
          await balance.fetchBalance();
        }
      })();
    }
  }

  onMount(async () => {
    show = true;
    // Login user from localStorage if any.
    await wallet.loadStoredAccount();
  });
</script>

<Layout>
  <div class="flex flex-col space-y-8 md:space-y-16">
    <section
      class="
      flex flex-col items-start space-y-4 lg:space-y-0 lg:space-x-8
      lg:flex-row lg:justify-around"
    >
      <div
        class="w-full max-w-lg mx-auto lg:basis-1/2 lg:mt-20 space-y-2 lg:space-y-3"
      >
        {#if show}
          <div in:fade={{ delay: 200 }}>
            <Hero />
          </div>
        {/if}
      </div>
      {#if show}
        <div
          in:fly={{ x: 50, delay: 400 }}
          class="mx-auto lg:basis-1/2 max-w-lg"
        >
          <ConfigForm
            variant={view}
            on:editReserveBalance={() => {
              view = "UPDATE_CONFIG";
            }}
            on:cancelEditReserveBalance={() => {
              view = "SUMMARY";
            }}
          />
        </div>
      {/if}
    </section>

    <!-- {#if view === "LOGIN"}
      <div class="block lg:hidden">
        <LearnMore />
      </div>
    {/if} -->

    {#if view !== "LOGIN"}
      <section
        class="w-full max-w-lg mx-auto lg:max-w-full space-y-3"
        data-cy="transaction-history"
      >
        <h2>Transaction History</h2>
        <TransactionHistory />
      </section>
    {/if}

    <section class="w-full max-w-lg mx-auto lg:max-w-full space-y-3">
      <h2>Your Questions</h2>
      <FAQs />
    </section>
  </div>
</Layout>
