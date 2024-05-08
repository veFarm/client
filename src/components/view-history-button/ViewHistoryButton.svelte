<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { historyModal } from "@/stores/history-modal";
  import { Button } from "@/components/button";
  import History from "@/assets/History.svelte";

  type $$Props = ComponentProps<Button>;
</script>

<button
  disabled={$historyModal.isOpen}
  on:click={historyModal.open}
  data-cy="view-history-button"
  title="View Transaction History"
>
  <History />
</button>
