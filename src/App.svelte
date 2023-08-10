<script lang="ts">
  import { blur, fade, fly, scale, slide } from "svelte/transition";
  import { chain } from "@/config";
  import { wallet } from "@/stores/wallet";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Divider } from "@/components/divider";
  import { Stats } from "@/components/stats";
  import { ConfigForm } from "@/components/config-form";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { AllowanceButton } from "@/components/allowance-button";
  import { SwapsHistory } from "@/components/swaps-history";

  type View = "INITIAL" | "ALERT" | "UPDATE";

  let view: View = "INITIAL";

  let swapConfigSet: boolean = false;

  $: swapConfigSet =
    $trader.triggerBalance !== "0" && $trader.reserveBalance !== "0";

  $: {
    if (!$wallet.connected || !swapConfigSet || $vtho.allowance === "0") {
      view = "INITIAL";
    } else if (swapConfigSet && $vtho.allowance !== "0") {
      view = "ALERT";
    }
  }
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
        <h1>Swap VTHO for VET automatically.</h1>
        <p class="text-gray-300 mt-4">
          Select your swap configuration and allow the VeFarm contract to spend
          your VTHO. After which the contract will periodically withdraw VTHO
          from your account, perform a swap for VET tokens through a
          decentralized exchange (DEX), and return the resulting tokens back to
          your wallet.
        </p>
        <!-- <p class="text-gray-400">
          VTHO is a token on VeChain, which is generated automatically when you
          hold VET. Therefore, one way to increase your VET balance is by
          exchanging earned VTHO tokens for VET on a regular basis. By doing so,
          you will generate more VTHO which can then be traded for even more VET,
          and the cycle continues.
        </p> -->
        <div
          class="hidden md:grid md:grid-cols-3 md:row-gap-8 md:mt-10 md:mx-auto"
        >
          <Stats />
        </div>
      </section>
      <section
        class="basis-1/2 border border-accent rounded-lg px-6 py-4 bg-white text-black space-y-4"
      >
        {#if view === "INITIAL"}
          <div class="space-y-4">
            <ConfigForm />
            {#if !$wallet.connected}
              <ConnectWalletButton intent="primary" fullWidth />
            {:else}
            <!-- TODO: or stored value doesn't match form value, disable allowance button -->
              <AllowanceButton disabled={!swapConfigSet} />
            {/if}
          </div>
        {/if}

        {#if view === "ALERT"}
          <div class="space-y-4" transition:slide>
            <div class="bg-green-50 border rounded-lg border-green-300 p-4">
              <h2 class="text-green-700 text-center">
                Great! We&apos;re all set.
              </h2>
              <p class="text-green-700 mt-2">
                The VeFarm contract is configured to exchange VTHO for VET when
                your account balance reaches <b
                  >{$trader.triggerBalance}&nbsp;VTHO</b
                >. It will swap the maximum possible amount while maintaining a
                reserve balance of <b>{$trader.reserveBalance}&nbsp;VTHO</b> in your
                account.
              </p>
            </div>
            <Button
              intent="primary"
              fullWidth
              on:click={() => {
                view = "UPDATE";
              }}>Update Configuration</Button
            >
            <AllowanceButton disabled={!swapConfigSet} />
          </div>
        {/if}

        {#if view === "UPDATE"}
          <div class="space-y-4" transition:slide>
            <ConfigForm />
            <Button
              intent="secondary"
              fullWidth
              on:click={() => {
                view = "ALERT";
              }}>Cancel</Button
            >
          </div>
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
