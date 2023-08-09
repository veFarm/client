<script lang="ts">
  import { chain, VTHO_DECIMALS } from "@/config";
  import type { Contract } from "@/blockchain/connex-utils";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import type { AbiItem, SwapConfig } from "@/typings/types";
  import * as traderArtifact from "@/abis/Trader.json";
  import { wallet } from "@/stores/wallet";
  import { vtho } from "@/stores/vtho";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { formatUnits } from "@/utils/format-units";
  import { Layout } from "@/components/layout";
  import { Divider } from "@/components/divider";
  import { Stats } from "@/components/stats";
  import { ConfigForm } from "@/components/config-form";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { AllowanceButton } from "@/components/allowance-button";
  import { SwapsHistory } from "@/components/swaps-history";

  const { TRADER_CONTRACT_ADDRESS } = getEnvVars();

  type ErrorFields = "network";
  type Errors = Record<ErrorFields, string[]>;

  /** Connex utils instance. */
  let connexUtils: ConnexUtils | undefined;
  /** Reference to the VeFarm Trader contract */
  let trader: Contract | undefined;
  /** Account target values stored in the Trader contract. */
  let storedConfig: SwapConfig | undefined;
  let storedConfigSet = false;
  /** Errors object. */
  let errors: Errors = {
    network: [],
  };

  /**
   * Fetch account's swap config from the Trader contract.
   */
  async function fetchConfig(): Promise<void> {
    try {
      if ($wallet.account == null || trader == null) {
        throw new Error("Wallet is not connected.");
      }

      const decoded = await trader.methods.constant.addressToConfig({
        args: [$wallet.account],
      });

      storedConfig = {
        triggerBalance: formatUnits(decoded[0], VTHO_DECIMALS),
        reserveBalance: formatUnits(decoded[1], VTHO_DECIMALS),
      };
    } catch (err: any) {
      errors.network.push(err?.message || "Unknown error occurred.");
    }
  }

  // Fetch account's config on wallet connection.
  $: {
    if ($wallet.connex != null) {
      connexUtils = new ConnexUtils($wallet.connex);

      trader = connexUtils.getContract(
        traderArtifact.abi as AbiItem[],
        TRADER_CONTRACT_ADDRESS,
      );

      fetchConfig();
    }
  }

  $: storedConfigSet =
    storedConfig != null &&
    storedConfig.triggerBalance !== "0" &&
    storedConfig.reserveBalance !== "0";

  $: {
    console.log({ storedConfig, storedConfigSet });
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
          from your account, perform a swap for VET tokens through a DEX, and
          return the resulting tokens back to your wallet.
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
        {#if storedConfigSet && $vtho.allowance !== "0"}
          <h1>All set!</h1>
          <p>{JSON.stringify(storedConfig, null, 2)}</p>
        {:else}
          <ConfigForm {storedConfig} />
        {/if}
        {#if !$wallet.connected}
          <ConnectWalletButton intent="primary" fullWidth />
        {:else}
          <AllowanceButton disabled={!storedConfigSet} />
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
