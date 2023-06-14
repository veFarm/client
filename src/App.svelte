<script lang="ts">
  import { VTHO } from "@/blockchain/vtho";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { SwapsHistory } from "@/components/swaps-history";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { chain, VTHO_TOTAL_SUPPLY } from "./config";

  const { TRADER_CONTRACT_ADDRESS } = getEnvVars();

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

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
   * Get account balance.
   */
  async function getBalance(): Promise<void> {
    disabled = true;

    try {
      if ($wallet.connexService == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const balances = await $wallet.connexService.getBalance({
        account: $wallet.account,
      });

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
      if ($wallet.connexService == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const vtho = new VTHO($wallet.connexService);

      allowance = await vtho.allowance({
        owner: $wallet.account,
        spender: TRADER_CONTRACT_ADDRESS,
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
  async function handleApprove(amount: string, comment: string): Promise<void> {
    disabled = true;

    try {
      if ($wallet.connexService == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const vtho = new VTHO($wallet.connexService);

      const clause = vtho.approve({
        spender: TRADER_CONTRACT_ADDRESS,
        amount,
      });

      const tx = await $wallet.connexService.signTx({
        clauses: [clause],
        signer: $wallet.account,
        comment,
      });

      await $wallet.connexService.waitForTx({ txID: tx.txid });

      await getAllowance();
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  $: {
    if ($wallet.connected) {
      getBalance();
      getAllowance();
    }
  }
</script>

<Layout>
  <form
    class="flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-background mt-8"
  >
    <p>
      To help you earn the most profit, please connect your wallet so we can
      calculate the best strategy to swap VTHO for VET based on your balance.
    </p>
    {#if !$wallet.connected}
      <ConnectWalletButton intent="primary" fullWidth />
    {:else}
      <Button intent="primary" disabled fullWidth>Connect wallet</Button>
    {/if}

    {#if $wallet.connected}
      <p class="underline">Current balance:</p>
      <p>
        VET: {balance}
        <br />
        VTHO: {energy}
      </p>
      <p class="underline">Strategy:</p>
      <p>
        The protocol will swap VTHO for VET whenever your VTHO balance reaches 5
        VTHO or more. Will swap 5 VTHO every 5 minutes until your balance is
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
            handleApprove(
              VTHO_TOTAL_SUPPLY,
              "Allow our smart contract to spend your VTHO in exchange for VET."
            );
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
            handleApprove(
              "0",
              "Our smart contract will no longer be able to spend your VTHO in exchange for VET."
            );
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

  <SwapsHistory />
</Layout>
