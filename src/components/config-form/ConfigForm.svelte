<script lang="ts">
  import bn from "bignumber.js";
  import { VTHO_TOTAL_SUPPLY } from "@/config";
  import { wallet } from "@/stores/wallet";
  import { vtho } from "@/stores/vtho";
  import { trader } from "@/stores/trader";
  import { getEnvVars } from "@/utils/get-env-vars";
  import { isNumber } from "@/utils/is-number";
  import { parseUnits } from "@/utils/parse-units";
  import { secsTillNextTrade } from "@/utils/secs-till-next-trade";
  import { secondsToDHMS } from "@/utils/seconds-to-dhms";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";

  const { TRADER_CONTRACT_ADDRESS } = getEnvVars();

  type Variant = "LOGIN" | "CONFIG_AND_APPROVE" | "UPDATE_CONFIG";

  export let variant: Variant;

  type ErrorFields = "triggerBalance" | "reserveBalance";
  type Errors = Record<ErrorFields, string[]>;

  /** Form status. */
  let disabled = false;
  /** Errors object. */
  let errors: Errors = {
    triggerBalance: [],
    reserveBalance: [],
  };
  /** VTHO balance to initiate a swap in decimals. */
  let triggerBalance = "";
  /** VTHO balance to be retained in the account after the swap in decimals. */
  let reserveBalance = "";
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

  /**
   * Store selected configuration into the Trader contract.
   */
  async function handleSubmit(): Promise<void> {
    disabled = true;

    // Clear previous errors if any
    clearErrors();

    // Validate fields
    const err = validateFields(triggerBalance, reserveBalance);

    // In case of errors, display on UI and return handler to parent component
    if (err.triggerBalance.length > 0 || err.reserveBalance.length > 0) {
      errors = err;
      disabled = false;
      return;
    }

    const clauses: Connex.VM.Clause[] = [];
    const comments: string[] = ["Please approve the following action(s):"];

    // TODO: get clause and comment from store
    if (!inputsMatchStore) {
      clauses.push(
        trader.getClause("saveConfig")!([
          parseUnits(triggerBalance),
          parseUnits(reserveBalance),
        ]),
      );

      comments.push("Save configuration values into the VeFarm contract.");
    }

    if (variant === "CONFIG_AND_APPROVE") {
      clauses.push(
        vtho.getClause("approve")!([
          TRADER_CONTRACT_ADDRESS,
          VTHO_TOTAL_SUPPLY,
        ]),
      );

      comments.push(
        "Allow the VeFarm contract to spend your VTHO in exchange for VET.",
      );
    }

    const response = await wallet.signTx(clauses, comments.join(" "));
    await wallet.waitForReceipt(response!.txid);
    await trader.fetchConfig();
    await wallet.fetchBalance();

    disabled = false;
  }

  // Set stored config values on login.
  $: {
    if (
      $trader.contract != null &&
      $trader.triggerBalance !== "0" &&
      $trader.reserveBalance !== "0" &&
      !runOnce
    ) {
      triggerBalance = $trader.triggerBalance;
      reserveBalance = $trader.reserveBalance;
      runOnce = true;
    }
  }

  // Allow for numbers only.
  $: triggerBalance = triggerBalance.replace(/\D+/g, "");
  $: reserveBalance = reserveBalance.replace(/\D+/g, "");

  // TODO: what happens when input value is 0000?
  let inputsMatchStore: boolean | undefined;

  $: inputsMatchStore =
    $trader.triggerBalance === triggerBalance &&
    $trader.reserveBalance === reserveBalance &&
    triggerBalance !== "0" &&
    reserveBalance !== "0";

  let nextTrade: string | undefined;

  $: {
    if ($wallet.connected) {
      const nextTradeSecs = secsTillNextTrade(triggerBalance, $wallet.balance);

      if (nextTradeSecs != null) {
        const { d, m, h, s } = secondsToDHMS(nextTradeSecs);
        nextTrade =
          d > 0
            ? `${d} days`
            : h > 0
            ? `${h} hours`
            : m > 0
            ? `${m} minutes`
            : `${s} seconds`;
      } else {
        nextTrade = undefined;
      }
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col space-y-4">
  <Input
    type="text"
    id="triggerBalance"
    label="Trigger Balance"
    placeholder={$trader.triggerBalance || "0"}
    currency="VTHO"
    subtext={`Balance: ${$wallet.balance?.vtho || "0"}`}
    hint="Minimum balance to initiate a swap"
    {disabled}
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
    placeholder={$trader.reserveBalance || "0"}
    currency="VTHO"
    hint="Minimum balance to be maintained in your account after the swap"
    {disabled}
    error={errors.reserveBalance[0]}
    bind:value={reserveBalance}
    on:input={() => {
      clearFieldErrors("reserveBalance");
    }}
  />

  <!-- TODO: move to it's out compoent and use a slot to insert -->
  <p class="text-accent">
    <span>Next Trade</span>
    {#if nextTrade != null}
      <span class="float-right">{nextTrade}</span>
    {:else}
      <div class="w-6 h-4 animate-pulse bg-slate-200 float-right" />
    {/if}
    <br />
    Fees
    <br />
    Minimum Received
  </p>

  {#if variant === "LOGIN"}
    <ConnectWalletButton intent="primary" fullWidth />
  {/if}

  {#if variant === "CONFIG_AND_APPROVE"}
    <Button
      type="submit"
      intent="primary"
      disabled={disabled || triggerBalance === "" || reserveBalance === ""}
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
      disabled={disabled ||
        triggerBalance === "" ||
        reserveBalance === "" ||
        inputsMatchStore}
      loading={disabled}
      fullWidth
    >
      Update Configuration
    </Button>
  {/if}

  {#if $wallet.error != null && $wallet.error.length > 0}
    <p class="text-danger">ERROR: {$wallet.error}</p>
  {/if}
  {#if $trader.error != null && $trader.error.length > 0}
    <p class="text-danger">ERROR: {$trader.error}</p>
  {/if}
</form>
