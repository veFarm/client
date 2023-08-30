<script lang="ts">
  import { onMount } from "svelte";
  import { chain } from "@/config";
  import { wallet } from "@/stores/wallet";
  import { vtho } from "@/stores/vtho";
  import type { WalletId } from "@/typings/types";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Divider } from "@/components/divider";
  import { Stats } from "@/components/stats";
  import { ConfigForm } from "@/components/config-form";
  import { RevokeAllowanceButton } from "@/components/revoke-allowance-button";
  import { TradesHistory } from "@/components/trades-history";
  import { TradeForecast } from "@/components/trade-forecast";

  type View = "LOGIN" | "CONFIG_AND_APPROVE" | "SUMMARY" | "UPDATE_CONFIG";

  let view: View = "LOGIN";

  $: {
    if (!$wallet.connected) {
      view = "LOGIN";
    } else if (!$trader.swapConfigSet || !$vtho.allowed) {
      view = "CONFIG_AND_APPROVE";
    } else if ($trader.swapConfigSet && $vtho.allowed) {
      view = "SUMMARY";
    }
  }

  // Login stored user if any.
  onMount(async () => {
    const user = localStorage.getItem("user"); // "{"walletId": "sync2", "account": "0x"}"
    if (user == null) return;
    const { walletId, account } = JSON.parse(user) as {
      walletId: WalletId;
      account: Address;
    };
    await wallet.connect(walletId, account);
  });
</script>

<Layout>
  <div class="flex flex-col space-y-8 md:space-y-16">
    <div
      class="
      flex flex-col items-center space-y-8
      lg:flex-row lg:space-y-0 lg:space-x-8
    "
    >
      <section class="basis-1/2 self-start">
        <h1>Swap VTHO for VET automatically.</h1>
        <p class="text-gray-300 mt-4">
          Select your swap configuration and allow the VeFarm contract to spend
          your VTHO. After which the contract will periodically withdraw VTHO
          from your account, perform a swap for VET tokens through a DEX, and
          return the resulting tokens back to your wallet.
        </p>
        <div
          class="hidden lg:grid lg:grid-cols-3 lg:row-gap-8 lg:mt-10 lg:mx-auto"
        >
          <Stats />
        </div>
      </section>
      <section
        class="basis-1/2 max-w-lg border border-accent rounded-lg p-3 lg:p-6 bg-white text-black space-y-4"
      >
        {#if view === "LOGIN"}
          <ConfigForm variant="LOGIN" />
        {/if}

        {#if view === "CONFIG_AND_APPROVE"}
          <ConfigForm variant="CONFIG_AND_APPROVE" />
        {/if}

        {#if view === "SUMMARY"}
          <div class="space-y-4">
            <div
              class="text-green-700 bg-green-50 border rounded-lg border-green-300 space-y-4 p-3 lg:p-4"
            >
              <h2 class="text-green-700 text-center">
                Great! We&apos;re&nbsp;all&nbsp;set.
              </h2>
              <p>
                The VeFarm contract is configured to exchange VTHO for VET when
                your account balance reaches
                <b>{formatUnits($trader.triggerBalance)}&nbsp;VTHO</b>. It will
                swap the maximum possible amount while maintaining a reserve
                balance of
                <b>{formatUnits($trader.reserveBalance)}&nbsp;VTHO</b> in your account.
              </p>
              <TradeForecast
                triggerBalance={$trader.triggerBalance}
                reserveBalance={$trader.reserveBalance}
              />
            </div>
            <Button
              intent="primary"
              fullWidth
              on:click={() => {
                view = "UPDATE_CONFIG";
              }}
            >
              Update Configuration
            </Button>
            <RevokeAllowanceButton disabled={!$trader.swapConfigSet} />
          </div>
        {/if}

        {#if view === "UPDATE_CONFIG"}
          <div class="space-y-4">
            <ConfigForm variant="UPDATE_CONFIG" />
            <Button
              intent="secondary"
              fullWidth
              on:click={() => {
                view = "SUMMARY";
              }}
            >
              Cancel
            </Button>
          </div>
        {/if}

        <p class="text-center text-accent">Chain: {chain.name}</p>
      </section>
    </div>

    {#if $wallet.connected}
      <Divider />
      <TradesHistory />
    {/if}
  </div>
</Layout>
