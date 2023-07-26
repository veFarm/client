<script lang="ts">
  import type { Contract } from "@/blockchain/connex-utils";
  import type { AbiItem } from "@/typings/types";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import * as vthoArtifact from "@/abis/VTHO.json";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { isNumber } from "@/utils/is-number";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { VTHO_TOTAL_SUPPLY } from "@/config";
  import Divider from "../divider/Divider.svelte";

  const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  type ErrorFields = "network" | "targetAmount" | "amountLeft";
  type Errors = Record<ErrorFields, string[]>;

  /** Connex utils instance. */
  let connexUtils: ConnexUtils | undefined;
  /** Reference to the VTHO contract. */
  let vtho: Contract | undefined;
  /** Form status. */
  let disabled = false;
  /** Errors object. */
  let errors: Errors = {
    network: [],
    targetAmount: [],
    amountLeft: [],
  };
  /** Allowance given by the account to the Trader contract. */
  let allowance = "0";
  /** Account's VET balance. */
  let balance: string | undefined = undefined;
  /** Account's VTHO balance. */
  let energy: string | undefined = undefined;
  /** VTHO amount to initiate a swap. */
  let targetAmount: string;
  /** VTHO balance to be retained after the swap. */
  let amountLeft: string; // TODO: this needs to be formated to BN

  /**
   * Reset errors object.
   */
  function clearErrors(): void {
    let key: keyof typeof errors;
    for (key in errors) {
      errors[key] = [];
    }
  }

  /**
   * Reset field errors
   */
  function clearFieldErrors(fieldName: string): void {
    errors[fieldName] = [];
  }

  /**
   * Validate input fields.
   */
  function validateFields(
    targetAmount: string | undefined,
    amountLeft: string | undefined
  ): Errors {
    // Initialize errors
    const _errors: Errors = {
      targetAmount: [],
      amountLeft: [],
      network: [],
    };

    // Sanitize inputs
    const _targetAmount = targetAmount != null && targetAmount.trim();
    const _amountLeft = amountLeft != null && amountLeft.trim();

    console.log({ targetAmount, amountLeft });

    if (!_targetAmount) {
      _errors.targetAmount.push("Target amount is required.");
    } else if (!isNumber(_targetAmount)) {
      _errors.targetAmount.push("Please enter a valid amount.");
    } else if (_targetAmount === "0") {
      _errors.targetAmount.push("Please enter a positive amount.");
    }

    if (!_amountLeft) {
      _errors.amountLeft.push("Amount left is required!");
    } else if (!isNumber(_amountLeft)) {
      _errors.amountLeft.push("Please enter a valid amount.");
    } else if (_amountLeft === "0") {
      _errors.amountLeft.push("Please enter a positive amount.");
    }

    return _errors;
  }

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
    } catch (error: any) {
      errors.network.push(error?.message || "Unknown error occurred.");
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
    } catch (error: any) {
      errors.network.push(error?.message || "Unknown error occurred.");
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

      // Clear previous errors if any
      clearErrors();

      // Validate fields
      const err = validateFields(targetAmount, amountLeft);

      // In case of errors, display on UI and return handler to parent component
      if (err.targetAmount.length > 0 || err.amountLeft.length > 0) {
        errors = err;
        return;
      }

      // TODO: store targetAmount and amountLeft and convert to BigNumber

      const actions = {
        approve: {
          amount: VTHO_TOTAL_SUPPLY,
          comment: "Allow VeFarm to exchange your VTHO for VET.",
        },
        revoke: {
          amount: "0",
          comment:
            "VeFarm will no longer be able to exchange your VTHO for VET.",
        },
      };

      const { amount, comment } = actions[allowanceType];

      const response = await vtho.methods.signed.approve({
        args: [TRADER_CONTRACT_ADDRESS, amount],
        comment,
      });

      await connexUtils.waitForReceipt(response.txid);
      await getAllowance();
    } catch (error: any) {
      errors.network.push(error?.message || "Unknown error occurred.");
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

  $: {
    console.log({ targetAmount });
    console.log({ amountLeft });
  }
</script>

<form on:submit|preventDefault class="flex flex-col space-y-4">
  {#if $wallet.connected}
    <p class="text-sm text-center md:text-base">
      Balance: {energy}&nbsp;VTHO - {balance}&nbsp;VET
    </p>
    <Divider />
  {/if}
  {#if allowance === "0"}
    <Input
      type="text"
      id="targetAmount"
      label="Swap VTHO for VET when balance reaches"
      disabled={disabled || !$wallet.connected}
      error={errors.targetAmount[0]}
      bind:value={targetAmount}
      on:input={() => {
        clearFieldErrors("targetAmount");
      }}
    >
      <svelte:fragment slot="sufix">VTHO</svelte:fragment>
    </Input>
  {:else}
    <p class="underline">Target amount to trigger a swap:</p>
    <p>{targetAmount} VTHO</p>
  {/if}
  {#if allowance === "0"}
    <Input
      type="text"
      id="amountLeft"
      label="Minimum balance to keep after swap"
      disabled={disabled || !$wallet.connected}
      error={errors.amountLeft[0]}
      bind:value={amountLeft}
      on:input={() => {
        clearFieldErrors("amountLeft");
      }}
    >
      <svelte:fragment slot="sufix">VTHO</svelte:fragment>
    </Input>
  {:else}
    <p class="underline">Minimum balance to be retained after the swap:</p>
    <p>{amountLeft} VTHO</p>
  {/if}

  {#if targetAmount != null && targetAmount.length > 0 && amountLeft != null && amountLeft.length > 0 && errors.targetAmount.length + errors.amountLeft.length === 0}
    <p>
      We will swap VTHO for VET when your account balance reaches {targetAmount}
      VTHO leaving {amountLeft} VTHO in your wallet. Keep in mind that a swap transaction
      costs aproximately 3 VTHO.
    </p>
  {/if}

  {#if !$wallet.connected}
    <ConnectWalletButton intent="primary" fullWidth />
  {:else if allowance === "0"}
    <Button
      type="submit"
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
      type="submit"
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

  {#if errors.network != null && errors.network.length > 0}
    <p class="text-danger">{errors.network[0]}</p>
  {/if}
</form>
