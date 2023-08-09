<script lang="ts">
  import { VTHO_TOTAL_SUPPLY } from "@/config";
  import { vtho } from "@/stores/vtho";
  import { Button } from "@/components/button";

  /** Button status */
  export let disabled = false;

  /**
   * Approve or revoke the Trader's allowance to spend VTHO on behalf
   * of the currently logged-in account.
   */
  async function handleClick(amount: string, comment: string): Promise<void> {
    disabled = true;

    await vtho.setAllowance(amount, comment);

    disabled = false;
  }
</script>

{#if $vtho.allowance === "0"}
  <Button
    intent="primary"
    {disabled}
    fullWidth
    on:click={() => {
      handleClick(
        VTHO_TOTAL_SUPPLY,
        "Allow VeFarm to spend your VTHO in exchange for VET.",
      );
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
      handleClick(
        "0",
        "VeFarm will no longer be able to spend your VTHO in exchange for VET.",
      );
    }}
  >
    Revoke Spending
  </Button>
{/if}

{#if $vtho.error != null && $vtho.error.length > 0}
  <p class="text-danger">ERROR: {$vtho.error}</p>
{/if}
