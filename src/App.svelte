<script lang="ts">
  import { chain } from "@/config";
  import { wallet } from "@/stores/wallet";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Divider } from "@/components/divider";
  import { Stats } from "@/components/stats";
  import { ConfigForm } from "@/components/config-form";
  import { RevokeAllowanceButton } from "@/components/revoke-allowance-button";
  import { SwapsHistory } from "@/components/swaps-history";

  type View = "LOGIN" | "CONFIG_AND_APPROVE" | "SUMMARY" | "UPDATE_CONFIG";

  let view: View = "LOGIN";

  let swapConfigSet: boolean = false;

  $: swapConfigSet =
    $trader.triggerBalance !== "0" && $trader.reserveBalance !== "0";

  $: {
    if (!$wallet.connected) {
      view = "LOGIN";
    } else if (!swapConfigSet || $vtho.allowance === "0") {
      view = "CONFIG_AND_APPROVE";
    } else if (swapConfigSet && $vtho.allowance !== "0") {
      view = "SUMMARY";
    }
  }
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
              class="bg-green-50 border rounded-lg border-green-300 p-3 lg:p-6"
            >
              <h2 class="text-green-700 text-center">
                Great! We&apos;re&nbsp;all&nbsp;set.
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
                view = "UPDATE_CONFIG";
              }}
            >
              Update Configuration
            </Button>
            <RevokeAllowanceButton disabled={!swapConfigSet} />
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

        <p class="text-center">Chain: {chain.name}</p>
      </section>
    </div>

    {#if $wallet.connected}
      <Divider />
      <SwapsHistory />
    {/if}
  </div>
</Layout>
