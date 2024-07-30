<script lang="ts">
  import { createEventDispatcher } from "svelte";
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
  import { Alert } from "@/components/alert";
  import { RevokeAllowanceButton } from "@/components/revoke-allowance-button";
  import { TradesForecast } from "@/components/trades-forecast";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import Checkmark from "@/assets/Checkmark.svelte";
  import Edit from "@/assets/Edit.svelte";

  type Variant = "LOGIN" | "CONFIG_AND_APPROVE" | "ACTIVE" | "UPDATE_CONFIG";

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

      if (!inputsMatchStore) {
        clauses.push(
          trader.getClause("saveConfig")!(reserveBalanceWei.toFixed()),
        );

        comments.push("Store Reserve Balance into the Vearn contract. ");
      }

      if (variant === "CONFIG_AND_APPROVE") {
        clauses.push(vtho.getClause("approve")!(chain.trader, MAX_UINT256));

        comments.push(
          `${
            clauses.length === 1 ? "Allow" : "Additionally, allow"
          } the Vearn contract to spend your VTHO in exchange for VET.`,
        );
      }

      const response = await wallet.signTx(clauses, comments.join(" "));
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

  const dispatch = createEventDispatcher();

  function handleEdit() {
    dispatch("editReserveBalance");
  }

  function handleCancelEdit() {
    dispatch("cancelEditReserveBalance");
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

  let insufficientBalance: boolean = false;

  $: insufficientBalance =
    $balance.current != null && $balance.current.vet.eq(0) /* &&
    $balance.current.vtho.eq(0) */;

  let title: string = "";

  const TITLES: Record<Variant, string> = {
    LOGIN: "Activate Vearn",
    CONFIG_AND_APPROVE: "Activate Vearn",
    ACTIVE: "Vearn Activated",
    UPDATE_CONFIG: "Update Reserve Balance",
  };

  $: {
    title = TITLES[variant] || "";
  }
</script>

<div class="bg-highlight border border-muted rounded-lg">
  <div class="flex items-center justify-between px-3 py-3 lg:px-6 lg:py-4">
    <div class="flex items-center space-x-2">
      <h3 class:text-success={variant === "ACTIVE"}>
        {title}
      </h3>
      {#if variant === "ACTIVE"}
        <Checkmark class="text-success" />
      {/if}
    </div>
  </div>

  <Divider />

  <form
    on:submit|preventDefault={handleSubmit}
    class="p-3 lg:p-6 flex flex-col space-y-4"
  >
    <div class="flex">
      <Input
        type="text"
        id="reserveBalance"
        label="Reserve Balance"
        placeholder={formatUnits($trader.reserveBalance)}
        autocomplete="off"
        autofocus
        currency="VTHO"
        balance={$balance.current != null
          ? `${formatUnits($balance.current.vtho, 2)} VTHO`
          : ""}
        hint="Minimum VTHO balance to be maintained in your account at all times. Anything above that amount will be swapped overtime."
        disabled={disabled || !$wallet.connected || variant === "ACTIVE"}
        error={errors.reserveBalance[0]}
        bind:value={reserveBalance}
        on:input={() => {
          clearFieldErrors("reserveBalance");
        }}
        data-cy="reserve-balance-input"
      >
        <svelte:fragment slot="input-right">
          {#if variant === "ACTIVE"}
            <Button
              intent="secondary"
              fullWidth
              class="ml-2 max-w-min"
              on:click={handleEdit}
              data-cy="goto-update-reserve-balance-button"
            >
              <div class="flex">
                <Edit class="inline-block mr-2" /> EDIT
              </div>
            </Button>
          {/if}
        </svelte:fragment>
      </Input>
    </div>

    <Divider />

    {#if variant !== "UPDATE_CONFIG"}
      <TradesForecast
        reserveBalance={!inputsEmpty ? reserveBalanceWei : bn(0)}
      />
    {/if}

    {#if variant === "LOGIN"}
      <ConnectWalletButton intent="primary" variant="text" fullWidth />
    {/if}

    {#if variant === "CONFIG_AND_APPROVE"}
      <Button
        type="submit"
        intent={insufficientBalance || inputsEmpty ? "secondary" : "primary"}
        disabled={disabled || inputsEmpty || insufficientBalance}
        loading={disabled}
        fullWidth
        data-cy="submit-form-button"
      >
        {insufficientBalance
          ? "INSUFFICIENT BALANCE"
          : inputsEmpty
            ? "ENTER RESERVE BALANCE"
            : "ENABLE AUTOPILOT"}
      </Button>
    {/if}

    {#if variant === "UPDATE_CONFIG"}
      <Button
        type="submit"
        intent={inputsEmpty || inputsMatchStore ? "secondary" : "primary"}
        disabled={disabled || inputsEmpty || inputsMatchStore}
        loading={disabled}
        fullWidth
        data-cy="update-reserve-balance-button"
      >
        {inputsEmpty || inputsMatchStore
          ? "ENTER NEW AMOUNT"
          : "UPDATE RESERVE BALANCE"}
      </Button>
    {/if}

    {#if variant === "ACTIVE"}
      <RevokeAllowanceButton disabled={!$trader.swapConfigSet} />
      <Alert
        title="Autopilot Enabled"
        body={`Vearn will periodically exchange VTHO for VET while keeping a reserve balance of ${formatUnits(
          $trader.reserveBalance,
        )} VTHO in your account.`}
        on:close={() => {}}
        data-cy="protocol-is-enabled-message"
      />
    {/if}

    {#if variant === "UPDATE_CONFIG"}
      <Button
        intent="outline"
        fullWidth
        on:click={handleCancelEdit}
        data-cy="cancel-reserve-balance-update-button"
      >
        CANCEL
      </Button>
    {/if}

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
</div>
