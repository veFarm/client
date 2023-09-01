<script lang="ts">
  import bn from "bignumber.js";
  import { MAX_UINT256 } from "@/config";
  import { wallet } from "@/stores/wallet";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { isNumeric } from "@/utils/is-numeric/is-numeric";
  import { formatUnits } from "@/utils/format-units";
  import { expandTo18Decimals } from "@/utils/expand-to18-decimals";
  import { isZeroOrEmpty } from "@/utils/is-zero-or-empty";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { TradesForecast } from "@/components/trades-forecast";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";

  const { TRADER_CONTRACT_ADDRESS } = getEnvVars();

  type Variant = "LOGIN" | "CONFIG_AND_APPROVE" | "UPDATE_CONFIG";

  export let variant: Variant;

  type ErrorFields = "reserveBalance" | "triggerBalance" | "network";
  type Errors = Record<ErrorFields, string[]>;

  /** Form status. */
  let disabled = false;
  /** Errors object. */
  let errors: Errors = {
    reserveBalance: [],
    triggerBalance: [],
    network: [],
  };
  /** VTHO balance to be retained in the account after the swap in decimals. */
  let reserveBalance = "";
  /** VTHO balance to initiate a swap in decimals. */
  let triggerBalance = "";
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
    reserveBalance: string | undefined,
    triggerBalance: string | undefined,
  ): Errors {
    // Initialize errors
    const _errors: Errors = {
      reserveBalance: [],
      triggerBalance: [],
      network: [],
    };

    // Sanitize inputs
    const _reserveBalance =
      reserveBalance != null ? reserveBalance.trim() : undefined;
    const _triggerBalance =
      triggerBalance != null ? triggerBalance.trim() : undefined;

    if (!_reserveBalance) {
      _errors.reserveBalance.push("Required field.");
    } else if (!isNumeric(_reserveBalance)) {
      _errors.reserveBalance.push("Please enter a valid amount.");
    } else if (parseInt(_reserveBalance, 10) === 0) {
      _errors.reserveBalance.push("Please enter a positive value.");
    }

    // TODO
    if (!_triggerBalance) {
      _errors.triggerBalance.push("Required field.");
    } else if (!isNumeric(_triggerBalance)) {
      _errors.triggerBalance.push("Please enter a valid amount.");
    } else if (parseInt(_triggerBalance, 10) === 0) {
      _errors.triggerBalance.push("Please enter a positive value.");
    } else if (
      _reserveBalance != null &&
      isNumeric(_reserveBalance) &&
      bn(_triggerBalance).lte(bn(_reserveBalance))
    ) {
      _errors.triggerBalance.push(
        "Trigger balance must exceed reserve balance",
      );
    }

    // TODO: catch MAX_UINT256
    // TODO: triggerBalance - reserveBalance should be big enough

    return _errors;
  }

  /**
   * Store selected parameters into the Trader contract.
   */
  async function handleSubmit(): Promise<void> {
    disabled = true;

    try {
      // Clear previous errors if any
      clearErrors();

      // Validate fields
      const err = validateFields(reserveBalance, triggerBalance);

      // In case of errors, display on UI and return handler to parent component
      if (err.reserveBalance.length > 0 || err.triggerBalance.length > 0) {
        errors = err;
        disabled = false;
        return;
      }

      const clauses: Connex.VM.Clause[] = [];
      const comments: string[] = [];

      // TODO: get clause and comment from store
      if (!inputsMatchStore) {
        clauses.push(
          trader.getClause("saveConfig")!([
            // TODO: swap order at contract level.
            expandTo18Decimals(triggerBalance).toFixed(),
            expandTo18Decimals(reserveBalance).toFixed(),
          ]),
        );

        comments.push(
          "Save reserveBalance and triggerBalance values into the VeFarm contract.",
        );
      }

      if (variant === "CONFIG_AND_APPROVE") {
        clauses.push(
          vtho.getClause("approve")!([TRADER_CONTRACT_ADDRESS, MAX_UINT256]),
        );

        comments.push(
          "Allow the VeFarm contract to spend your VTHO in exchange for VET.",
        );
      }

      const response = await wallet.signTx(
        clauses,
        "Please approve the following action(s):" +
          comments.reverse().join(" "),
      );
      await wallet.waitForReceipt(response!.txid);
      await trader.fetchConfig();
      await wallet.fetchBalance();
    } catch (error: any) {
      console.log({ error });
      errors.network.push(error?.message || "Unknown error occurred.");
    } finally {
      disabled = false;
    }
  }

  // Set stored config values on login.
  $: {
    if ($trader.contract != null && $trader.swapConfigSet && !runOnce) {
      reserveBalance = formatUnits($trader.reserveBalance);
      triggerBalance = formatUnits($trader.triggerBalance);
      runOnce = true;
    }
  }

  // Allow for numbers only.
  $: reserveBalance = reserveBalance.replace(/\D+/g, "");
  $: triggerBalance = triggerBalance.replace(/\D+/g, "");

  let inputsEmpty: boolean = true;

  $: inputsEmpty =
    isZeroOrEmpty(reserveBalance) || isZeroOrEmpty(triggerBalance);

  let inputsMatchStore: boolean = false;

  $: inputsMatchStore =
    $trader.reserveBalance.eq(
      isZeroOrEmpty(reserveBalance) ? 0 : expandTo18Decimals(reserveBalance),
    ) &&
    $trader.triggerBalance.eq(
      isZeroOrEmpty(triggerBalance) ? 0 : expandTo18Decimals(triggerBalance),
    );
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col space-y-4">
  <Input
    type="text"
    id="reserveBalance"
    label="Reserve Balance"
    placeholder={formatUnits($trader.reserveBalance)}
    autocomplete="off"
    currency="VTHO"
    hint="Minimum balance to be maintained in your account after the swap"
    disabled={disabled || !$wallet.connected}
    error={errors.reserveBalance[0]}
    bind:value={reserveBalance}
    on:input={() => {
      clearFieldErrors("reserveBalance");
    }}
  />
  <Input
    type="text"
    id="triggerBalance"
    label="Trigger Balance"
    placeholder={formatUnits($trader.triggerBalance)}
    autocomplete="off"
    currency="VTHO"
    subtext={`Balance: ${
      $wallet.balance != null ? formatUnits($wallet.balance.vtho, 2) : "0"
    }`}
    hint="Minimum balance to initiate a swap"
    disabled={disabled || !$wallet.connected}
    error={errors.triggerBalance[0]}
    bind:value={triggerBalance}
    on:input={() => {
      clearFieldErrors("triggerBalance");
    }}
  />

  {#if !inputsEmpty}
    <TradesForecast
      reserveBalance={expandTo18Decimals(reserveBalance)}
      triggerBalance={expandTo18Decimals(triggerBalance)}
    />
  {/if}

  {#if variant === "LOGIN"}
    <ConnectWalletButton intent="primary" fullWidth />
  {/if}

  {#if variant === "CONFIG_AND_APPROVE"}
    <Button
      type="submit"
      intent="primary"
      disabled={disabled || inputsEmpty}
      loading={disabled}
      fullWidth
    >
      Approve Spending
    </Button>
  {/if}

  {#if variant === "UPDATE_CONFIG"}
    <Button
      type="submit"
      intent="primary"
      disabled={disabled || inputsEmpty || inputsMatchStore}
      loading={disabled}
      fullWidth
    >
      Update Parameters
    </Button>
  {/if}

  {#if $wallet.error != null && $wallet.error.length > 0}
    <p class="text-danger">ERROR: {$wallet.error}</p>
  {/if}
  {#if $trader.error != null && $trader.error.length > 0}
    <p class="text-danger">ERROR: {$trader.error}</p>
  {/if}
  {#if errors.network != null && errors.network.length > 0}
    <p class="text-danger">ERROR: {errors.network[0]}</p>
  {/if}
</form>
