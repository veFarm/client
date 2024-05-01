<script lang="ts">
  import { onMount } from "svelte";
  import { Connex } from "@vechain/connex";
  import { wrapConnex } from "@vearnfi/wrapped-connex";
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
    import Alert from "./components/alert/Alert.svelte";

  type View = "LOGIN" | "CONFIG_AND_APPROVE" | "SUMMARY" | "UPDATE_CONFIG"; // TODO: add LOADING

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
    // Login user from localStorage if any.
    await wallet.loadStoredAccount();
  });
</script>

<Layout>
  <div class="flex flex-col space-y-8 md:space-y-16">
    <div
      class="
      flex flex-col items-center space-y-8
      lg:flex-row lg:justify-around lg:space-y-0 lg:space-x-8
    "
    >
      <section class="basis-1/2">
        <h1 data-cy="title">VTHO-VET Swaps on Autopilot</h1>
        <p class="text-accent text-base mt-4" data-cy="description">
          Vearn streamlines the process of converting VTHO to VET tokens,
          automatically executing swaps at strategic intervals. Enjoy peace of
          mind as Vearn boosts your VET balance without any manual effort
          required.
        </p>
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
      <section
        class="basis-1/2 max-w-lg bg-background border border-highlight rounded-lg text-accent"
      >
        {#if view === "LOGIN"}
          <ConfigForm variant="LOGIN" />
        {/if}

        {#if view === "CONFIG_AND_APPROVE"}
          <ConfigForm variant="CONFIG_AND_APPROVE" />
        {/if}

        {#if view === "SUMMARY"}
          <ConfigForm variant="SUMMARY">
            <svelte:fragment slot="form-bottom">
              <!-- <Button
                intent="secondary"
                fullWidth
                on:click={() => {
                  view = "UPDATE_CONFIG";
                }}
                data-cy="goto-update-reserve-balance-button"
              >
                EDIT RESERVE BALANCE
              </Button> -->
              <RevokeAllowanceButton disabled={!$trader.swapConfigSet} />
              <Alert
                    title="Autopilot Enabled"
                    body={`We will periodically exchange VTHO for VET while keeping a reserve balance of ${formatUnits($trader.reserveBalance)} VTHO in your account.`}
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
    </div>

    {#if $wallet.connected}
      <TradesHistory />
    {/if}
  </div>
</Layout>

<!-- {#if view === "SUMMARY"}
          <div class="space-y-4">
            <div
              class="text-green-700 bg-green-50 rounded-t-lg space-y-4 p-3 lg:p-4"
              data-cy="protocol-is-enabled-message"
            >
              <h2 class="text-green-700 text-center">
                Great! We&apos;re&nbsp;all&nbsp;set.
              </h2>
              <p>
                vearn is configured to periodically exchange VTHO for VET while
                maintaining a reserve balance of
                <b data-cy="reserve-balance-amount"
                  >{formatUnits($trader.reserveBalance)}&nbsp;VTHO</b
                > in your account.
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
              UPDATE RESERVE BALANCE
            </Button>
            <RevokeAllowanceButton disabled={!$trader.swapConfigSet} />
          </div>
        {/if} -->
