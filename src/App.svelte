<script lang="ts">
  import { onMount } from "svelte";
  import { Connex } from "@vechain/connex";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import { chain } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { formatUnits } from "@/utils/format-units";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Stats } from "@/components/stats";
  import { ConfigForm } from "@/components/config-form";
  import { RevokeAllowanceButton } from "@/components/revoke-allowance-button";
  import { TradesHistory } from "@/components/trades-history";
  import { TradesForecast } from "@/components/trades-forecast";
  import { FundsWarning } from "@/components/funds-warning";

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

  // Update account balance with every new tick.
  $: {
    if ($wallet.connected) {
      const { walletId } = $wallet;

      const connex = new Connex({
        node: chain.rpc[0],
        network: chain.network,
        noExtension: walletId === "sync2",
      });

      const connexUtils = new ConnexUtils(connex);

      const ticker = connexUtils.ticker();

      void (async () => {
        for (;;) {
          await ticker.next();
          await balance.fetchBalance();
        }
      })();
    }
  }

  onMount(async () => {
    // Login user from localStorage if any.
    await wallet.loadStoredAccount();
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
        <h1 data-cy="title">Grow your VET balance.</h1>
        <p class="text-gray-300 mt-4" data-cy="description">
          <!-- Automatically swap VTHO for VET using optimized strategies. How does it work?
          Set your reserve balance and allow the VeFarm contract to spend your VTHO.
          Afterward, the contract will periodically withdraw VTHO from your account,
          execute a swap for VET tokens through a DEX, and return the resulting tokens
          to your wallet.store. You don&apos;t need to worry about finding the best exchange rate
          or the right time to trade; we&apos;ll take care of that. -->
          With your VET holdings, you automatically accumulate VTHO tokens in your
          account. VeFarm takes care of exchanging these VTHO tokens for additional
          VET tokens at strategically optimized moments, boosting your VET balance
          and increasing your potential gains.
        </p>
        <div
          class="hidden lg:flex lg:flex-row lg:justify-center lg:space-x-16 lg:mt-10"
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
              class="text-green-700 bg-green-50 rounded-t-lg space-y-4 p-3 lg:p-4"
              data-cy="protocol-is-enabled-message"
            >
              <h2 class="text-green-700 text-center">
                Great! We&apos;re&nbsp;all&nbsp;set.
              </h2>
              <p>
                VeFarm is configured to periodically exchange VTHO for VET while
                maintaining a reserve balance of
                <b>{formatUnits($trader.reserveBalance)}&nbsp;VTHO</b> in your account.
              </p>
              <TradesForecast reserveBalance={$trader.reserveBalance} />
            </div>
            <FundsWarning />
            <Button
              intent="primary"
              fullWidth
              on:click={() => {
                view = "UPDATE_CONFIG";
              }}
              data-cy="goto-update-reserve-balance-button"
            >
              Update Reserve
            </Button>
            <RevokeAllowanceButton disabled={!$trader.swapConfigSet} />
          </div>
        {/if}

        {#if view === "UPDATE_CONFIG"}
          <div class="space-y-4">
            <ConfigForm variant="UPDATE_CONFIG" />
            <Button
              intent="outline"
              fullWidth
              on:click={() => {
                view = "SUMMARY";
              }}
              data-cy="cancel-reserve-balance-update-button"
            >
              Cancel
            </Button>
          </div>
        {/if}

        <p class="text-center text-accent">Chain: {chain.name}</p>
        <button on:click={trader.fetchConfig}>REFETCH</button>
      </section>
    </div>

    {#if $wallet.connected}
      <TradesHistory />
    {/if}
  </div>
</Layout>
