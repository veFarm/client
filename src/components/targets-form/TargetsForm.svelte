<script lang="ts">
  import type { Contract } from "@/blockchain/connex-utils";
  import type { AbiItem } from "@/typings/types";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import * as vthoArtifact from "@/abis/VTHO.json";
  import * as traderArtifact from "@/abis/Trader.json";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { parseUnits } from "@/utils/parse-units";
  import { isNumber } from "@/utils/is-number";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { VTHO_DECIMALS } from "@/config";

  const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  type Targets = {
    targetAmount: string;
    amountLeft: string;
  };
  type ErrorFields = "network" | "targetAmount" | "amountLeft";
  type Errors = Record<ErrorFields, string[]>;

  /** Connex utils instance. */
  let connexUtils: ConnexUtils | undefined;
  /** Reference to the VTHO contract. */
  let vtho: Contract | undefined;
  /** Reference to the VeFarm Trader contract */
  let trader: Contract | undefined;
  /** Form status. */
  let disabled = false;
  /** Errors object. */
  let errors: Errors = {
    network: [],
    targetAmount: [],
    amountLeft: [],
  };
  /** Account's VET balance. */
  let balance: string | undefined = undefined;
  /** Account's VTHO balance. */
  let energy: string | undefined = undefined;
  /** VTHO amount to initiate a swap. */
  let targetAmount = "500";
  /** VTHO balance to be retained after the swap. */
  let amountLeft = "10"; // TODO: this needs to be formated to BN
  /** Account target values stored in the Trader contract. */
  let targets: Targets | undefined;

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
  function clearFieldErrors(fieldName: ErrorFields): void {
    errors[fieldName] = [];
  }

  /**
   * Validate input fields.
   */
  function validateFields(
    targetAmount: string | undefined,
    amountLeft: string | undefined,
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

  // TODO: integrate balance into wallet store
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

  // TODO: it would be nice if this data would be globally available.
  /**
   * Fetch account targets stored in the Trader contract.
   */
  async function fetchTargets(): Promise<void> {
    try {
      if ($wallet.account == null || trader == null) {
        throw new Error("Wallet is not connected.");
      }

      targets = await trader.methods.constant.accountTargets({
        args: [$wallet.account],
      });
    } catch (err: any) {
      errors.network.push(err?.message || "Unknown error occurred.");
    }
  }

  /**
   * Store targetAmount and amountLeft values into Trader contract.
   */
  async function handleSubmit(): Promise<void> {
    disabled = true;

    try {
      if (connexUtils == null || vtho == null || trader == null) {
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

      const response = await trader.methods.signed.setTargets({
        args: [
          parseUnits(targetAmount, VTHO_DECIMALS),
          parseUnits(amountLeft, VTHO_DECIMALS),
        ],
        comment: "Store target values into the VeFarm contract.",
      });

      await connexUtils.waitForReceipt(response.txid);
      // TODO:
      // 3. store values via API or call the server to fetch SetTargets event
      // 4. re-fetch user's data (this should be global)
    } catch (error: any) {
      errors.network.push(error?.message || "Unknown error occurred.");
    } finally {
      disabled = false;
    }
  }

  // Fetch account targets on wallet connection.
  $: {
    if ($wallet.connex != null) {
      connexUtils = new ConnexUtils($wallet.connex);

      vtho = connexUtils.getContract(
        vthoArtifact.abi as AbiItem[],
        VTHO_CONTRACT_ADDRESS,
      );

      trader = connexUtils.getContract(
        traderArtifact.abi as AbiItem[],
        TRADER_CONTRACT_ADDRESS,
      );

      // TODO: move this to wallet store
      getBalance();
      fetchTargets();
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col space-y-4">
  <Input
    type="text"
    id="targetAmount"
    label="Swap VTHO for VET when my balance reaches"
    placeholder="0.0"
    currency="VTHO"
    subtext={`Balance: ${energy || "0.0"}`}
    disabled={disabled || !$wallet.connected}
    error={errors.targetAmount[0]}
    bind:value={targetAmount}
    on:input={() => {
      clearFieldErrors("targetAmount");
    }}
  />
  <Input
    type="text"
    id="amountLeft"
    label="Keep in my wallet after the swap"
    placeholder="0.0"
    currency="VTHO"
    disabled={disabled || !$wallet.connected}
    error={errors.amountLeft[0]}
    bind:value={amountLeft}
    on:input={() => {
      clearFieldErrors("amountLeft");
    }}
  />

  <!-- TODO: move to it's out compoent and use a slot to insert -->
  <p class="text-background">
    Minimum Received
    <br />
    Fees
    <br />
    Next Trade
  </p>

  {#if $wallet.connected}
    <Button type="submit" intent="primary" {disabled} fullWidth>Save</Button>
  {/if}

  {#if errors.network != null && errors.network.length > 0}
    <p class="text-danger">{errors.network[0]}</p>
  {/if}
</form>
