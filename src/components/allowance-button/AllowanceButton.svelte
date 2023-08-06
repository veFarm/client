<script lang="ts">
  import type { Contract } from "@/blockchain/connex-utils";
  import type { AbiItem } from "@/typings/types";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import * as vthoArtifact from "@/abis/VTHO.json";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { Button } from "@/components/button";
  import { VTHO_TOTAL_SUPPLY } from "@/config";

  const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  /** Connex utils instance. */
  let connexUtils: ConnexUtils | undefined;
  /** Reference to the VTHO contract. */
  let vtho: Contract | undefined;
  /** Allowance button status. */
  let disabled = true;
  /** Allowance given by the account to the Trader contract. */
  let allowance: string | undefined;
  /** Error message if any. */
  let error: string | undefined;

  /** List of possible allowance actions. */
  type Action = "APPROVE" | "REVOKE";

  /** Arguments to be passed to the vtho.approve function. */
  const ACTION_PAYLOAD: Record<Action, { amount: string; comment: string }> = {
    APPROVE: {
      amount: VTHO_TOTAL_SUPPLY,
      comment: "Allow VeFarm to spend your VTHO in exchange for VET.",
    },
    REVOKE: {
      amount: "0",
      comment: "VeFarm will no longer be able to exchange your VTHO for VET.",
    },
  };

  /**
   * Fetch allowance given by the account to the Trader contract.
   */
  async function fetchAllowance(): Promise<void> {
    try {
      if ($wallet.account == null || vtho == null) {
        throw new Error("Wallet is not connected.");
      }

      const decoded = await vtho.methods.constant.allowance({
        args: [$wallet.account, TRADER_CONTRACT_ADDRESS],
      });

      allowance = decoded[0];
    } catch (err: any) {
      error = err?.message || "Unknown error occurred.";
    }
  }

  /**
   * Approve/revoke Trader's allowance to spend VTHO.
   */
  async function handleClick(action: Action): Promise<void> {
    disabled = true;

    try {
      if (connexUtils == null || vtho == null) {
        throw new Error("Wallet is not connected.");
      }

      const { amount, comment } = ACTION_PAYLOAD[action];

      const response = await vtho.methods.signed.approve({
        args: [TRADER_CONTRACT_ADDRESS, amount],
        comment,
      });

      await connexUtils.waitForReceipt(response.txid);
      await fetchAllowance();
    } catch (err: any) {
      error = err?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  // Fetch Trader allowance on wallet connection.
  $: {
    if ($wallet.connex != null) {
      connexUtils = new ConnexUtils($wallet.connex);

      vtho = connexUtils.getContract(
        vthoArtifact.abi as AbiItem[],
        VTHO_CONTRACT_ADDRESS,
      );

      fetchAllowance();
    }
  }

  // Disabled button while allowance is being fetched.
  // TODO: disabled via parent component if config is not set
  $: disabled = allowance == null;
</script>

{#if allowance === "0"}
  <Button
    intent="primary"
    {disabled}
    fullWidth
    on:click={() => {
      handleClick("APPROVE");
    }}
  >
    Approve Spending
  </Button>
{:else}
  <Button
    intent="danger"
    {disabled}
    fullWidth
    on:click={() => {
      handleClick("REVOKE");
    }}
  >
    Revoke Spending
  </Button>
{/if}

{#if error != null && error.length > 0}
  <p class="text-danger">{error}</p>
{/if}
