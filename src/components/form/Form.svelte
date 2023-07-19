<script lang="ts">
  import type { Contract } from "@/blockchain/connex-utils";
  import type { AbiItem } from "@/typings/types";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import * as vthoArtifact from "@/abis/VTHO.json";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { VTHO_TOTAL_SUPPLY } from "@/config";

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
  let vthoLeft = 10; // TODO: this needs to be formated to BN

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
            "Allow the VeFarm smart contract to spend your VTHO in exchange for VET.",
        },
        revoke: {
          amount: "0",
          comment:
            "The VeFarm smart contract will no longer be able to spend your VTHO in exchange for VET.",
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

<form class="flex flex-col space-y-4">
  <p class="underline">Balance:</p>
  <p>
    {balance} VET
    <br />
    {energy} VTHO
  </p>
  {#if allowance === "0"}
    <Input
      type="number"
      id="vtho_left"
      label="Minimum balance to be retained after the swap"
      {disabled}
      bind:value={vthoLeft}
    >
      <svelte:fragment slot="sufix">VTHO</svelte:fragment>
    </Input>
  {:else}
    <p class="underline">Minimum balance to be retained after the swap:</p>
    <p>{vthoLeft} VTHO</p>
  {/if}
  <p class="underline">Strategy:</p>
  <p>
    The protocol will swap VTHO for VET whenever your VTHO balance reaches 5
    VTHO or more. Will swap 5 VTHO every 5 minutes until your balance is below
    the target amount.
  </p>
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

  {#if error != null && error.length > 0}
    <p class="text-danger">{error}</p>
  {/if}
</form>
