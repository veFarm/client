<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { ConfigForm } from "@/components/config-form";
  import { RevokeAllowanceButton } from "@/components/revoke-allowance-button";
  import Alert from "./components/alert/Alert.svelte";

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
    <div
      class="
      flex flex-col items-start space-y-4 lg:space-y-0 lg:space-x-8
      lg:flex-row lg:justify-around"
    >
      <section class="w-full lg:basis-1/2 lg:mt-20">
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
            class="hidden lg:block text-center lg:text-left text-accent text-base mt-4"
            data-cy="description"
          >
            {SUBTITLE}
          </p>
        {/if}
        <!-- <h1 data-cy="title">VTHO-VET Swaps on Autopilot</h1>
        <p>
          Holding VET tokens in your account generates VTHO, which in turn can be traded for additional VET tokens, boosting your starting balance.
          Vearn streamlines this process by automatically executing swaps at strategic intervals, maximizing the end result.
          Did you know? Holding VET in your account produces VTHO tokens that are used
          to pay for transaction on the VeChain blockchain. Vearn takes care of exchanging
          these VTHO tokens for additional VET tokens using optimized strategies.
            VTHO Production: Holding VET tokens generates VTHO tokens continuously at a constant rate.
            VTHO-VET Swaps: Vearn automatically exchanges the generated VTHO tokens for additional VET tokens via a decentralized exchange (DEX).
            Increased VET Balance: As a result of the VTHO-VET swaps, the user's initial VET balance increases with the additional VET tokens acquired.

            Overall, the diagram illustrates the continuous cycle of VET producing VTHO, which is then exchanged for additional VET tokens through Vearn's automated process, ultimately leading to an increased VET balance for the user.

            Vearn facilitates a perpetual cycle where VET holdings produce VTHO, subsequently exchanged for additional VET tokens via a decentralized exchange, resulting in a continuous augmentation of the user's VET balance.
        </p> -->
        <!-- <div class="hidden lg:block">
          <Stats />
        </div> -->
      </section>
      {#if show}
        <section
          in:fly={{ x: 50, delay: 400 }}
          class="mx-auto lg:basis-1/2 max-w-lg bg-highlight border border-muted rounded-lg text-accent"
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
        </section>
      {/if}
      <section class="block lg:hidden">
        {#if show}
          <p
            in:fade={{ delay: 300 }}
            class="text-center text-accent text-sm md:text-base"
            data-cy="description"
          >
            {SUBTITLE}
          </p>
        {/if}
      </section>
    </div>
  </div>
</Layout>
