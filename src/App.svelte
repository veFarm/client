<script lang="ts">
  import type { Contract } from "@/blockchain/connex-utils";
  import type { AbiItem } from "@/typings/types";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import * as vthoArtifact from "@/abis/VTHO.json";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { StatItem } from "@/components/stat-item";
  // import { Input } from "@/components/input";
  import { SwapsHistory } from "@/components/swaps-history";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { chain, VTHO_TOTAL_SUPPLY } from "@/config";

  const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  /** Connex utils instance. */
  let connexUtils: ConnexUtils | undefined;
  /** Reference to the VTHO contract. */
  let vtho: Contract | undefined;
  /** Form status. */
  let disabled = false;
  /** Error message if any. */
  let error = "";
  /** Allowance given by the account to the Trader contract. */
  let allowance = "0";
  /** Account's VET balance. */
  let balance: string | undefined = undefined;
  /** Account's VTHO balance. */
  let energy: string | undefined = undefined;
  /** VTHO balance left after the swap. */
  // let vthoLeft = 10; // TODO: this needs to be formated to BN

  /**
   * Fetch account balance from the vechain ledger.
   */
  async function getBalance(): Promise<void> {
    disabled = true;

    try {
      if (connexUtils == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const balances = await connexUtils.getBalance($wallet.account);

      balance = balances.balance;
      energy = balances.energy;
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  /**
   * Fetch allowance given by the account to the Trader contract.
   */
  async function getAllowance(): Promise<void> {
    disabled = true;

    try {
      if (vtho == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      allowance = await vtho.methods.constant.allowance({
        args: [$wallet.account, TRADER_CONTRACT_ADDRESS],
      });
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  /**
   * Approve/revoke Trader's allowance to spend VTHO.
   */
  async function handleAllowance(
    allowanceType: "approve" | "revoke"
  ): Promise<void> {
    disabled = true;

    try {
      if (connexUtils == null || vtho == null) {
        throw new Error("Wallet is not connected.");
      }

      const actions = {
        approve: {
          amount: VTHO_TOTAL_SUPPLY,
          comment:
            "Allow our smart contract to spend your VTHO in exchange for VET.",
        },
        revoke: {
          amount: "0",
          comment:
            "Our smart contract will no longer be able to spend your VTHO in exchange for VET.",
        },
      };

      const { amount, comment } = actions[allowanceType];

      const response = await vtho.methods.signed.approve({
        args: [TRADER_CONTRACT_ADDRESS, amount],
        comment,
      });

      await connexUtils.waitForReceipt(response.txid);
      await getAllowance();
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  $: {
    if ($wallet.connex != null) {
      connexUtils = new ConnexUtils($wallet.connex);

      vtho = connexUtils.getContract(
        vthoArtifact.abi as AbiItem[],
        VTHO_CONTRACT_ADDRESS
      );

      getBalance();
      getAllowance();
    }
  }
</script>

<Layout>
  <div
    class="flex flex-col space-y-8 md:flex-row md:items-center md:space-y-0 md:space-x-4"
  >
    <div class="basis-1/2">
      <h1>Swap VTHO for VET automatically.</h1>
      <p class="text-gray-300 mt-4">
        Allow our smart contract to spend your VTHO in exchange for VET,
        automatically. Don&apos;t worry about finding the best exchange rate or
        the best time to trade.
      </p>
      <!-- <p class="text-gray-400">
        VTHO is a token on VeChain, which is generated automatically when you
        hold VET. Therefore, one way to increase your VET balance is by
        exchanging earned VTHO tokens for VET on a regular basis. By doing so,
        you will generate more VTHO which can then be traded for even more VET,
        and the cycle continues.
      </p> -->
      <!-- <div class="px-4 py-8 mx-auto w-full md:px-24 lg:px-8 lg:py-16"> -->
      <div
        class="mt-8 max-w-3xl mx-auto grid grid-cols-3 row-gap-8 md:grid-cols-3"
      >
        <StatItem value="3.2K" label="Trades" />
        <StatItem value="13.8K" label="VET volume" />
        <StatItem value="486" label="Users" />
      </div>
      <!-- </div> -->
    </div>
    <form
      class="basis-1/2 flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-white text-black"
    >
      {#if !$wallet.connected}
        <p>
          Connect your wallet to calculate the best strategy to swap VTHO for
          VET based on your balance.
        </p>
        <ConnectWalletButton intent="primary" fullWidth />
        <!-- {:else}
        <Button intent="primary" disabled fullWidth>Connect wallet</Button> -->
      {/if}

      {#if $wallet.connected}
        <p class="underline">Current balance:</p>
        <p>
          {balance} VET
          <br />
          {energy} VTHO
        </p>
        <p class="underline">Strategy:</p>
        <p>
          The protocol will swap VTHO for VET whenever your VTHO balance reaches
          5 VTHO or more. Will swap 5 VTHO every 5 minutes until your balance is
          below the target amount.
        </p>
        <!-- <Input
      type="number"
      id="vtho_left"
      label="Amount to be kept in wallet"
      {disabled}
      bind:value={vthoLeft}
    >
      <svelte:fragment slot="sufix">VTHO</svelte:fragment>
    </Input> -->
        {#if allowance === "0"}
          <Button
            intent="primary"
            {disabled}
            fullWidth
            on:click={() => {
              handleAllowance("approve");
            }}
          >
            Approve
          </Button>
        {:else}
          <Button
            intent="danger"
            {disabled}
            fullWidth
            on:click={() => {
              handleAllowance("revoke");
            }}
          >
            Revoke
          </Button>
        {/if}
      {/if}

      {#if error != null && error.length > 0}
        <p class="text-danger">{error}</p>
      {/if}

      <p class="text-center">Chain: {chain.name}</p>
    </form>
  </div>

  <SwapsHistory />
</Layout>
