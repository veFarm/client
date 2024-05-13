<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Alert } from "@/components/alert";
  import { ConfigForm } from "@/components/config-form";
  import { RevokeAllowanceButton } from "@/components/revoke-allowance-button";
  import { FAQs } from "@/components/faqs";
  import { TransactionHistoryModal } from "@/components/transaction-history-modal";

  type View = "LOGIN" | "CONFIG_AND_APPROVE" | "SUMMARY" | "UPDATE_CONFIG"; // TODO: add LOADING

  const TITLE = "VTHO-VET Swaps on Autopilot";
  const SUBTITLE = `Vearn streamlines the process of converting VTHO to VET tokens,
    automatically executing swaps at strategic intervals. Enjoy peace of
    mind as Vearn boosts your VET balance without any manual effort
    required.`;

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
      <div class="w-full max-w-lg mx-auto lg:basis-1/2 lg:mt-20">
        {#if show}
          <h1
            in:fade={{ delay: 200 }}
            class="text-center lg:text-left"
            data-cy="title"
          >
            {TITLE}
          </h1>
          <p
            in:fade={{ delay: 300 }}
            class="text-center lg:text-left text-accent text-base mt-2 lg:mt-3"
            data-cy="description"
          >
            {SUBTITLE}
          </p>
        {/if}
      </div>
      {#if show}
        <div
          in:fly={{ x: 50, delay: 400 }}
          class="mx-auto lg:basis-1/2 max-w-lg"
        >
          {#if view === "LOGIN"}
            <ConfigForm variant="LOGIN" />
          {/if}

          {#if view === "CONFIG_AND_APPROVE"}
            <ConfigForm variant="CONFIG_AND_APPROVE" />
          {/if}

          {#if view === "SUMMARY"}
            <ConfigForm
              variant="SUMMARY"
              on:editReserveBalance={() => {
                view = "UPDATE_CONFIG";
              }}
            >
              <svelte:fragment slot="form-bottom">
                <RevokeAllowanceButton disabled={!$trader.swapConfigSet} />
                <Alert
                  title="Autopilot Enabled"
                  body={`We will periodically exchange VTHO for VET while keeping a reserve balance of ${formatUnits(
                    $trader.reserveBalance,
                  )} VTHO in your account.`}
                  on:close={() => {}}
                  data-cy="protocol-is-enabled-message"
                />
              </svelte:fragment>
            </ConfigForm>
          {/if}

          {#if view === "UPDATE_CONFIG"}
            <ConfigForm variant="UPDATE_CONFIG">
              <svelte:fragment slot="form-bottom">
                <Button
                  intent="outline"
                  fullWidth
                  on:click={() => {
                    view = "SUMMARY";
                  }}
                  data-cy="cancel-reserve-balance-update-button"
                >
                  CANCEL
                </Button>
              </svelte:fragment>
            </ConfigForm>
          {/if}

          <!-- <p class="text-center text-accent">Chain: {chain.name}</p> -->
          <!-- <div class="block lg:hidden mt-3">
        {#if show}
          <p
            in:fade={{ delay: 300 }}
            class="text-center text-accent text-sm md:text-base"
            data-cy="description"
          >
            {SUBTITLE}
          </p>
        {/if}
        </div> -->
        </div>
      {/if}
    </section>
    {#if view !== "LOGIN"}
      <section class="w-full max-w-lg mx-auto lg:max-w-full">
        <h2 class="text-body mb-3 text-xl">Transaction History</h2>
        <TransactionHistoryModal />
      </section>
    {/if}

    <section class="w-full max-w-lg mx-auto lg:max-w-full space-y-3">
      <h2>Your Questions</h2>
      <FAQs />
    </section>
  </div>
</Layout>
