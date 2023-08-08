<script lang="ts">
  import type { Contract } from "@/blockchain/connex-utils";
  import type { AbiItem } from "@/typings/types";
  import { ConnexUtils } from "@/blockchain/connex-utils";
  import * as vthoArtifact from "@/abis/VTHO.json";
  import * as traderArtifact from "@/abis/Trader.json";
  import { wallet } from "@/stores/wallet";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { parseUnits } from "@/utils/parse-units";
  import { formatUnits } from "@/utils/format-units";
  import { isNumber } from "@/utils/is-number";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { VTHO_DECIMALS } from "@/config";

  const { VTHO_CONTRACT_ADDRESS, TRADER_CONTRACT_ADDRESS } = getEnvVars();

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  type SwapConfig = {
    triggerBalance: string;
    reserveBalance: string;
  };
  type ErrorFields = "network" | "triggerBalance" | "reserveBalance";
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
    triggerBalance: [],
    reserveBalance: [],
  };
  /** VTHO balance to initiate a swap. */
  let triggerBalance = "";
  /** VTHO balance to be retained in the account after the swap. */
  let reserveBalance = "";
  /** Account target values stored in the Trader contract. */
  let storedConfig: SwapConfig | undefined;
  /** Hack to set targets once. */
  let runOnce = false;

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
    triggerBalance: string | undefined,
    reserveBalance: string | undefined,
  ): Errors {
    // Initialize errors
    const _errors: Errors = {
      triggerBalance: [],
      reserveBalance: [],
      network: [],
    };

    // Sanitize inputs
    const _triggerBalance = triggerBalance != null && triggerBalance.trim();
    const _reserveBalance = reserveBalance != null && reserveBalance.trim();

    if (!_triggerBalance) {
      _errors.triggerBalance.push("Required field.");
    } else if (!isNumber(_triggerBalance)) {
      _errors.triggerBalance.push("Please enter a valid amount.");
    } else if (_triggerBalance === "0") {
      _errors.triggerBalance.push("Please enter a positive amount.");
    }
    // TODO: catch MAX_UINT256
    // TODO: triggerBalance - reserveBalance should be big enough

    if (!_reserveBalance) {
      _errors.reserveBalance.push("Required field.");
    } else if (!isNumber(_reserveBalance)) {
      _errors.reserveBalance.push("Please enter a valid amount.");
    } else if (_reserveBalance === "0") {
      _errors.reserveBalance.push("Please enter a positive amount.");
    }

    return _errors;
  }

  // TODO: it would be nice if this data would be globally available.
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

  /**
   * Store selected configuration into the Trader contract.
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
      const err = validateFields(triggerBalance, reserveBalance);

      // In case of errors, display on UI and return handler to parent component
      if (err.triggerBalance.length > 0 || err.reserveBalance.length > 0) {
        errors = err;
        return;
      }

      const response = await trader.methods.signed.saveConfig({
        args: [
          parseUnits(triggerBalance, VTHO_DECIMALS),
          parseUnits(reserveBalance, VTHO_DECIMALS),
        ],
        comment: "Save config values into the VeFarm contract.",
      });

      await connexUtils.waitForReceipt(response.txid);
      await wallet.refetchBalance();
    } catch (error: any) {
      errors.network.push(error?.message || "Unknown error occurred.");
    } finally {
      disabled = false;
    }
  }

  // Fetch account's config on wallet connection.
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

      fetchConfig();
    }
  }

  // Set stored config values on render.
  $: {
    if (storedConfig != null && !runOnce) {
      triggerBalance = storedConfig.triggerBalance;
      reserveBalance = storedConfig.reserveBalance;
      runOnce = true;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col space-y-4">
  <Input
    type="text"
    id="triggerBalance"
    label="Trigger Balance"
    placeholder={storedConfig != null ? storedConfig.triggerBalance : "0"}
    currency="VTHO"
    subtext={`Balance: ${$wallet.balance?.vtho || "0"}`}
    hint="Minimum balance to initiate a swap"
    disabled={disabled || !$wallet.connected}
    error={errors.triggerBalance[0]}
    bind:value={triggerBalance}
    on:input={() => {
      clearFieldErrors("triggerBalance");
    }}
  />
  <Input
    type="text"
    id="reserveBalance"
    label="Reserve Balance"
    placeholder={storedConfig != null ? storedConfig.reserveBalance : "0"}
    currency="VTHO"
    hint="Minimum balance to be retained after the swap"
    disabled={disabled || !$wallet.connected}
    error={errors.reserveBalance[0]}
    bind:value={reserveBalance}
    on:input={() => {
      clearFieldErrors("reserveBalance");
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
    <Button
      type="submit"
      intent="primary"
      disabled={disabled ||
        (storedConfig != null &&
          storedConfig.triggerBalance === triggerBalance &&
          storedConfig.reserveBalance === reserveBalance)}
      fullWidth
    >
      Save Config
    </Button>
  {/if}

  {#if errors.network != null && errors.network.length > 0}
    <p class="text-danger">{errors.network[0]}</p>
  {/if}
</form>
