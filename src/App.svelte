<script lang="ts">
  import { onMount } from "svelte";
  // import { Connex } from "@vechain/connex";
  import { ConnexService } from "@/blockchain/connex-service";
  import { VTHO } from "@/blockchain/vtho";
  // import Big from "big.js";
  import { wallet } from "@/stores/wallet";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { chain, VTHO_TOTAL_SUPPLY } from "./config";

  // const VTHO_CONTRACT_ADDRESS = import.meta.env.VITE_VTHO_CONTRACT_ADDRESS;
  const TRADER_CONTRACT_ADDRESS = import.meta.env.VITE_TRADER_CONTRACT_ADDRESS;

  if (TRADER_CONTRACT_ADDRESS == null) {
    throw new Error("Missing env var TRADER_CONTRACT_ADDRESS");
  }

  // TODO: either do this or call totalSupply

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  let disabled = false;
  let error = "";
  let allowed = false;
  let vthoLeft: number = 10;

  /**
   * Get Trader's contract allowance.
   */
  async function getAllowance(): Promise<void> {
    try {
      disabled = true;

      if ($wallet.connexService == null || $wallet.account == null) {
        throw new Error("Wallet is not connected.");
      }

      const vtho = new VTHO($wallet.connexService);

      const allowance = await vtho.allowance({
        owner: $wallet.account,
        spender: TRADER_CONTRACT_ADDRESS,
      });

      allowed = allowance.decoded[0] !== "0";
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  /**
   * Approve/revoke Trader's allowance to spend VTHO.
   */
  async function handleApprove({
    amount,
    comment,
  }: {
    amount: string;
    comment: string;
  }): Promise<void> {
    try {
      disabled = true;

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
      console.log({ tx });

      const receipt = await $wallet.connexService.waitForTx({ txID: tx.txid });
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  onMount(async () => {
    await getAllowance();
  });
</script>

<Layout>
  <form
    class="flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-background mt-8"
  >
    <h2 class="underline">Swap VTHO for VET automatically</h2>
    <Input
      type="number"
      id="vtho_left"
      label="Amount to be kept in wallet"
      bind:value={vthoLeft}
    >
      <svelte:fragment slot="sufix">VTHO</svelte:fragment>
    </Input>
    {#if $wallet.isConnected}
      <Button
        intent="primary"
        class="mx-auto"
        {disabled}
        fullWidth
        on:click={() => {
          handleApprove({
            amount: VTHO_TOTAL_SUPPLY,
            comment:
              "Allow our smart contract to spend your VTHO in exchange for VET.",
          });
        }}
      >
        Approve
      </Button>
    {:else}
      <ConnectWalletButton intent="primary" fullWidth />
    {/if}

    {#if error != null && error.length > 0}
      <p class="text-danger">{error}</p>
    {/if}

    <p class="text-center">Chain: {chain.name}</p>
  </form>

  <div
    class="flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-background mt-8"
  >
    <h2 class="underline">Past Trades</h2>
  </div>
</Layout>
