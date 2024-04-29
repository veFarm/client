<script lang="ts">
  import bn from "bignumber.js";
  import { chain, MAX_UINT256 } from "@/config/index";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { isNumeric } from "@/utils/is-numeric/is-numeric";
  import { formatUnits } from "@/utils/format-units";
  import { expandTo18Decimals } from "@/utils/expand-to-18-decimals";
  import { isZeroOrEmpty } from "@/utils/is-zero-or-empty";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { Divider } from "@/components/divider";
  import { TradesForecast } from "@/components/trades-forecast";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { FundsWarning } from "@/components/funds-warning";

  type Variant = "LOGIN" | "CONFIG_AND_APPROVE" | "UPDATE_CONFIG";

  export let variant: Variant;

  type ErrorFields = "reserveBalance" | "network";
  type Errors = Record<ErrorFields, string[]>;

  /** Form status. */
  let disabled = false;
  /** Errors object. */
  let errors: Errors = {
    reserveBalance: [],
    network: [],
  };
  /** VTHO balance to be retained in the account after the swap in decimals. */
  let reserveBalance = "";
  /** Hack to set targets once. */
  let runOnce = false;
  /** Reserve balance in wei. */
  let reserveBalanceWei = bn(0);

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
  function validateFields(reserveBalance: string | undefined): Errors {
    // Initialize errors
    const _errors: Errors = {
      reserveBalance: [],
      network: [],
    };

    // Sanitize inputs
    const _reserveBalance =
      reserveBalance != null ? reserveBalance.trim() : undefined;

    if (!_reserveBalance) {
      _errors.reserveBalance.push("Required field.");
    } else if (!isNumeric(_reserveBalance)) {
      _errors.reserveBalance.push("Please enter a valid amount.");
    } else if (parseInt(_reserveBalance, 10) === 0) {
      _errors.reserveBalance.push("Please enter a positive value.");
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
      const err = validateFields(reserveBalance);

      // In case of errors, display on UI and return handler to parent component
      if (err.reserveBalance.length > 0) {
        errors = err;
        disabled = false;
        return;
      }

      const clauses: Connex.VM.Clause[] = [];
      const comments: string[] = [];

      // TODO: get clause and comment from store
      if (!inputsMatchStore) {
        clauses.push(
          trader.getClause("saveConfig")!(reserveBalanceWei.toFixed()),
        );

        comments.push("Store reserve balance value into the vearn contract.");
      }

      if (variant === "CONFIG_AND_APPROVE") {
        clauses.push(vtho.getClause("approve")!(chain.trader, MAX_UINT256));

        comments.push(
          "Allow the vearn contract to spend your VTHO in exchange for VET.",
        );
      }

      const response = await wallet.signTx(
        clauses,
        "Please approve the following action(s):" +
          comments.reverse().join(" "),
      );
      await wallet.waitForReceipt(response!.txid);
      await trader.fetchConfig();
      await vtho.fetchAllowance();
    } catch (error: any) {
      console.error(error);
      errors.network.push(error?.message || "Unknown error occurred.");
    } finally {
      disabled = false;
    }
  }

  // Set stored config values on login.
  $: {
    if ($trader.contract != null && $trader.swapConfigSet && !runOnce) {
      reserveBalance = formatUnits($trader.reserveBalance);
      runOnce = true;
    }
  }

  // Allow for numbers only.
  $: reserveBalance = reserveBalance.replace(/\D+/g, "");

  $: reserveBalanceWei = isZeroOrEmpty(reserveBalance)
    ? bn(0)
    : expandTo18Decimals(reserveBalance);

  let inputsEmpty: boolean = true;

  $: inputsEmpty = reserveBalanceWei.eq(0);

  let inputsMatchStore: boolean = false;

  $: inputsMatchStore = $trader.reserveBalance.eq(reserveBalanceWei);

  let configApproveDisabled: boolean = true;

  $: configApproveDisabled = disabled || inputsEmpty;

  let updateConfigDisabled: boolean = true;

  $: updateConfigDisabled = disabled || inputsEmpty || inputsMatchStore;
</script>

<div class="px-3 py-2 lg:px-6 lg:py-4">
  {#if variant === "UPDATE_CONFIG"}
    <h2 class="text-body font-bold text-lg">Update Reserve Balance</h2>
  {:else}
    <h2 class="text-body font-bold text-lg">Activate Vearn</h2>
  {/if}
</div>

<Divider />

<form on:submit|preventDefault={handleSubmit} class="p-3 lg:p-6 flex flex-col space-y-4">
  <Input
    type="text"
    id="reserveBalance"
    label="Reserve Balance"
    placeholder={formatUnits($trader.reserveBalance)}
    autocomplete="off"
    autofocus
    currency="VTHO"
    subtext={`Balance: ${
      $balance.current != null ? formatUnits($balance.current.vtho, 2) : "0"
    }`}
    hint="Minimum balance to be maintained in your account at all times"
    disabled={disabled || !$wallet.connected}
    error={errors.reserveBalance[0]}
    bind:value={reserveBalance}
    on:input={() => {
      clearFieldErrors("reserveBalance");
    }}
    data-cy="reserve-balance-input"
  />

  <Divider />
  <FundsWarning />

  {#if !inputsEmpty}
    <TradesForecast reserveBalance={reserveBalanceWei} />
  {/if}

  {#if variant === "LOGIN"}
    <ConnectWalletButton intent="primary" fullWidth />
  {/if}

  {#if variant === "CONFIG_AND_APPROVE"}
    <Button
      type="submit"
      intent="primary"
      disabled={configApproveDisabled}
      loading={disabled}
      fullWidth
      data-cy="submit-form-button"
    >
      {configApproveDisabled ? "ENTER RESERVE BALANCE" : "ENABLE AUTO SWAP"}
    </Button>
  {/if}

  {#if variant === "UPDATE_CONFIG"}
    <Button
      type="submit"
      intent={updateConfigDisabled ? "secondary" : "primary"}
      disabled={updateConfigDisabled}
      loading={disabled}
      fullWidth
      data-cy="update-reserve-balance-button"
    >
      {updateConfigDisabled ? "ENTER NEW AMOUNT" : "UPDATE RESERVE"}
    </Button>
  {/if}

  <slot name="additional-button" />

  {#if $wallet.error != null && $wallet.error.length > 0}
    <p class="text-danger">ERROR: {$wallet.error}</p>
  {/if}
  {#if $trader.error != null && $trader.error.length > 0}
    <p class="text-danger">ERROR: {$trader.error}</p>
  {/if}
  {#if errors.network != null && errors.network.length > 0}
    <p class="text-danger" data-cy="network-error">
      ERROR: {errors.network[0]}
    </p>
  {/if}
</form>
