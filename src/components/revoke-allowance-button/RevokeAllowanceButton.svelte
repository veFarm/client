<script lang="ts">
  import { vtho } from "@/stores/vtho";
  import { Button } from "@/components/button";

  /** Button status */
  export let disabled: boolean = false;

  let loading: boolean = false;

  /**
   * Approve or revoke the Trader's allowance to spend VTHO on behalf
   * of the currently logged-in account.
   */
  async function handleClick(amount: string, comment: string): Promise<void> {
    disabled = true;
    loading = true;

    await vtho.setAllowance(amount, comment);

    disabled = false;
    loading = false;
  }
</script>

<Button
  intent="danger"
  {disabled}
  {loading}
  fullWidth
  on:click={() => {
    handleClick(
      "0",
      "The vearn contract will no longer be able to spend your VTHO in exchange for VET.",
    );
  }}
  data-cy="revoke-allowance-button"
>
  Revoke Spending
</Button>

{#if $vtho.error != null && $vtho.error.length > 0}
  <p class="text-danger" data-cy="error-message">ERROR: {$vtho.error}</p>
{/if}
